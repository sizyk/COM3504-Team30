import IDB from './IDB.mjs';
import { showMessage } from './flash-messages.mjs';

function defaultSuccess(message) {
  showMessage(message, 'success', 'check_circle');
}

function defaultError(message) {
  showMessage(message, 'error', 'error');
}

/**
 * @class DBController
 * Controls all client-side database operations
 * Always adds to indexedDB, before attempting to push to MongoDB (if online)
 * If offline, or MongoDB fails, adds to a synchronisation queue.
 */
class DBController {
  /**
   * Initialises a DBController object
   */
  constructor() {
    this.idb = IDB;
  }

  /**
   * Adds Chat to the database and tries to upload to mongoDB
   * @param collection {string} the collection to perform the 'upsert' operation on.
   * @param toUpload {{obj: Object, formData: FormData}} the object to upload to
   *        IndexedDB, and the FormData to upload to mongoDB (allows files)
   * @param onSuccess {function(string, Object): void} callback function to run on success -
   *        takes a message (as a string) and, optionally, the updated/created object.
   * @param onError {function(string): void} callback function to run on error -
   *        takes a message (as a string).
   */
  async addChat(chat, local = false, onSuccess = defaultSuccess, onError = defaultError ) {
    const collection = 'chat';
    const tx = this.idb.db.transaction([collection], 'readwrite');
    const store = tx.objectStore(collection);
    await store.add(chat);
    await tx.done;
    if (!local) {
      DBController.mongoAddChat(collection, chat, this.idb, () => {}, onError);
    }
  }

  /**
   * POSTs data from a form to an API endpoint for a given collection
   * @param collection {string} the database collection to PUT to.
   * @param chat {Chat} the object to send to the API endpoint
   *        (must be FormData if sending files).
   * @param onSuccess {function(string, Object): void} callback function to run on success -
   *        takes a message (as a string) and, optionally, the updated/created object.
   * @param onError {function(string): void} callback function to run on error -
   *        takes a message (as a string).
   */
  static mongoAddChat(collection, chat , idb, onSuccess = defaultSuccess, onError = defaultError) {
    if (!navigator.onLine) {
      onSuccess('Successfully saved to local database!');
      return;
    }

    const id = chat._id.toString(16)
    console.log(id)

    // Post to mongoDB endpoint
    fetch(`/api/${collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chat),
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }

      // Throw error if status code not 200 (OK)
      throw new Error(`code ${res.statusCode}`);
      // Report success/error with respective callback functions
    }).then((resJson) => {
      onSuccess(resJson.message, resJson.object);
    }).catch((error) => {
      onError(error);
    });
  }

  static deleteFromIDB(collection, id, idb, onSuccess = defaultSuccess, onError = defaultError) {
    // Check if the IndexedDB instance exists
    if (!idb) {
      onError('IndexedDB instance not found');
      return;
    }

    // Open a transaction to the specified collection in readwrite mode
    const transaction = idb.db.transaction([collection], 'readwrite');

    // Get the store from the transaction
    const store = transaction.objectStore(collection);

    // Call the delete method on the store with the specified id
    const request = store.delete(id);

    // Handle the success and error events of the request
    request.onsuccess = (event) => {
      onSuccess(`Successfully deleted object with ID ${id} from IndexedDB`);
    };
    request.onerror = (event) => {
      onError(`Failed to delete object with ID ${id} from IndexedDB`);
    };
  }

  /**
   * Deletes an object from a given collection
   * @param collection {string} the database collection to delete from.
   * @param id {string} the object ID to delete.
   * @param onSuccess {function(string, Object): void} callback function to run on success -
   *        takes a message (as a string).
   * @param onError {function(string): void} callback function to run on error -
   *        takes a message (as a string).
   */
  delete(collection, id, onSuccess = defaultSuccess, onError = defaultError) {
    // Attempts to delete an object from IndexedDB, and, if successful, deletes from MongoDB
    this.idb.delete(
      collection,
      id,
      () => DBController.mongoDelete(collection, id, onSuccess, onError),
      () => onError(`Failed to delete object with ID ${id} from indexedDB!`),
    );
  }

  getAll(collection, onSuccess = defaultSuccess, onError = defaultError) {
    // Check if the IndexedDB instance exists
    if (!this.idb) {
      onError('IndexedDB instance not found');
      return;
    }

    // Open a transaction to the specified collection in read mode
    const transaction = this.idb.db.transaction([collection], 'readonly');

    // Get the store from the transaction
    const store = transaction.objectStore(collection);

    // Call the getAll method on the store
    const request = store.getAll();

    // Handle the success and error events of the request
    request.onsuccess = (event) => {
      onSuccess(request.result);
    };
    request.onerror = (event) => {
      onError(`Failed to get all objects from ${collection} in IndexedDB`);
    };
  }

  getChatsByPlant(plantId, onSuccess = defaultSuccess, onError = defaultError) {
    const collection = 'chat';
    const tx = this.idb.db.transaction([collection], 'readonly');
    const store = tx.objectStore(collection);
    const index = store.index('plant')
    const request = index.getAll(IDBKeyRange.only(plantId));

    request.onsuccess = () => {
      onSuccess(request.result);
    }
    request.onerror = onError;
  }
}

// Export an instance of DBController so that all other files use the same one
export default new DBController();