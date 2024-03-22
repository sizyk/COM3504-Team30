// Function to handle adding a new chat
const addNewChatToSync = (syncChatIDB, txtVal) => {
  // Retrieve chat text and add it to the IndexedDB

  if (txtVal !== '') {
    const transaction = syncChatIDB.transaction(['sync-chat'], 'readwrite');
    const chatStore = transaction.objectStore('sync-chat');
    const addRequest = chatStore.add({ text: 5 });
    addRequest.addEventListener('success', () => {
      console.log(`Added #${addRequest.result}: ${txtVal}`);
      const getRequest = chatStore.get(addRequest.result);
      getRequest.addEventListener('success', () => {
        console.log(`Found ${JSON.stringify(getRequest.result)}`);
        // Send a sync message to the service worker
        navigator.serviceWorker.ready.then((sw) => {
          sw.sync.register('sync-chat');
        }).then(() => {
          console.log('Sync registered');
        }).catch((err) => {
          console.log(`Sync registration failed: ${JSON.stringify(err)}`);
        });
      });
    });
  }
};

// Function to add new chat to IndexedDB and return a promise
const addNewChatsToIDB = (chatIDB, chats) => new Promise((resolve, reject) => {
  const transaction = chatIDB.transaction(['chat'], 'readwrite');
  const chatStore = transaction.objectStore('chat');

  const addPromises = chats.map((chat) => new Promise((resolveAdd, rejectAdd) => {
    const addRequest = chatStore.add(chat);
    addRequest.addEventListener('success', () => {
      // console.log(`Added #${addRequest.result}: ${chat.text}`);
      const getRequest = chatStore.get(addRequest.result);
      getRequest.addEventListener('success', () => {
        // console.log(`Found ${JSON.stringify(getRequest.result)}`);
        // Assume insertchatInList is defined elsewhere
        insertChatInList(getRequest.result);
        resolveAdd(); // Resolve the add promise
      });
      getRequest.addEventListener('error', (event) => {
        rejectAdd(event.target.error); // Reject the add promise if there's an error
      });
    });
    addRequest.addEventListener('error', (event) => {
      rejectAdd(event.target.error); // Reject the add promise if there's an error
    });
  }));

  // Resolve the main promise when all add operations are completed
  Promise.all(addPromises).then(() => {
    resolve();
  }).catch((error) => {
    reject(error);
  });
});

// Function to remove all chat from idb
const deleteAllExistingChatsFromIDB = (chatIDB) => {
  const transaction = chatIDB.transaction(['chat'], 'readwrite');
  const chatStore = transaction.objectStore('chat');
  const clearRequest = chatStore.clear();

  return new Promise((resolve, reject) => {
    clearRequest.addEventListener('success', () => {
      resolve();
    });

    clearRequest.addEventListener('error', (event) => {
      reject(event.target.error);
    });
  });
};

// Function to get the chat list from the IndexedDB
const getAllChats = (chatIDB) => new Promise((resolve, reject) => {
  const transaction = chatIDB.transaction(['chat']);
  const chatStore = transaction.objectStore('chat');
  const getAllRequest = chatStore.getAll();

  // Handle success event
  getAllRequest.addEventListener('success', (event) => {
    resolve(event.target.result); // Use event.target.result to get the result
  });

  // Handle error event
  getAllRequest.addEventListener('error', (event) => {
    reject(event.target.error);
  });
});

// Function to get the chat list from the IndexedDB
const getAllSyncChat = (syncChatIDB) => new Promise((resolve, reject) => {
  const transaction = syncChatIDB.transaction(['sync-chat']);
  const chatStore = transaction.objectStore('sync-chat');
  const getAllRequest = chatStore.getAll();

  getAllRequest.addEventListener('success', () => {
    resolve(getAllRequest.result);
  });

  getAllRequest.addEventListener('error', (event) => {
    reject(event.target.error);
  });
});

// // Function to delete a syn
// const deleteSyncchatFromIDB = (syncchatIDB, id) => {
//   const transaction = syncchatIDB.transaction(["sync-chat"], "readwrite")
//   const chatStore = transaction.objectStore("sync-chat")
//   const deleteRequest = chatStore.delete(id)
//   deleteRequest.addEventListener("success", () => {
//     console.log("Deleted " + id)
//   })
// }

function openChatIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('chat', 1);

    request.onerror = function (event) {
      reject(new Error(`Database error: ${event.target}`));
    };

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      db.createObjectStore('chat', { keyPath: '_id' });
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      resolve(db);
    };
  });
}

function openSyncChatIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sync-chat', 1);

    request.onerror = function (event) {
      reject(new Error(`Database error: ${event.target}`));
    };

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      db.createObjectStore('sync-chat', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      resolve(db);
    };
  });
}
