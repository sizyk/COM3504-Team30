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
   * @param chat the chat object to upload to IndexedDB and mongoDB
   * @param local {boolean} whether to only save to local database (default: false)
   * @param onSuccess {function(string, Object): void} callback function to run on success -
   *        takes a message (as a string) and, optionally, the updated/created object.
   * @param onError {function(string): void} callback function to run on error -
   *        takes a message (as a string).
   */
  async addChat(chat, local = false, onSuccess = defaultSuccess, onError = defaultError) {
    const collection = 'chat';
    const tx = this.idb.db.transaction([collection], 'readwrite');
    const store = tx.objectStore(collection);
    await store.add(chat);
    await tx.done;
    if (!local) {
      DBController.mongoAddChat(collection, chat, this.idb, onSuccess, onError);
    }
  }

  static mongoAddChat(collection, chat, idb, onSuccess = defaultSuccess, onError = defaultError) {
    if (!navigator.onLine) {
      onSuccess('Successfully saved to local database!');
      return;
    }

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
    request.onsuccess = () => {
      onSuccess(request.result);
    };
    request.onerror = () => {
      onError(`Failed to get all objects from ${collection} in IndexedDB`);
    };
  }

  getChatsByPlant(plantId, onSuccess = defaultSuccess, onError = defaultError) {
    const collection = 'chat';
    const tx = this.idb.db.transaction([collection], 'readonly');
    const store = tx.objectStore(collection);
    const index = store.index('plant');
    const request = index.getAll(IDBKeyRange.only(plantId));
    console.log(request);

    request.onsuccess = () => {
      onSuccess(request.result);
    };
    request.onerror = onError;
  }
}

// Export an instance of DBController so that all other files use the same one
export default new DBController();
