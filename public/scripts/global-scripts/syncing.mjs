import IDB from '../utils/IDB.mjs';
import DBController from '../utils/DBController.mjs';


function syncChat() {
  // Sync all chat messages to mongoDB

  DBController.getAll('chat', () => {
    // Get all chat messages from the database
    const tx = IDB.db.transaction(['chat'], 'readwrite');
    const store = tx.objectStore('chat');
    const request = store.getAll();

    request.onsuccess = () => {
      const chats = request.result;
      // For each chat message, try to upload it to MongoDB
      chats.forEach((chat) => {
        DBController.addChat(chat);
      });
    };
  })

}


/**
 * Initialises syncing functionality
 */
export default function initSyncing() {
  if (window.navigator.onLine) {
    syncChat();
  } else {
  }

  window.addEventListener('online', syncChat);
}