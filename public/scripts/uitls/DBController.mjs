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
  async addChat(chat, onSuccess = defaultSuccess, onError = defaultError) {
    const collection = 'chat';
    const tx = this.idb.db.transaction([collection], 'readwrite');
    const store = tx.objectStore(collection);
    await store.add(chat);
    await tx.done;

   DBController.mongoAddChat(collection, chat, onSuccess, onError);
  }

  /**
   * PUTs data from a form to an API endpoint for a given collection
   * @param collection {string} the database collection to PUT to.
   * @param chat {Chat} the object to send to the API endpoint
   *        (must be FormData if sending files).
   * @param onSuccess {function(string, Object): void} callback function to run on success -
   *        takes a message (as a string) and, optionally, the updated/created object.
   * @param onError {function(string): void} callback function to run on error -
   *        takes a message (as a string).
   */
  static mongoAddChat(collection, chat , onSuccess = defaultSuccess, onError = defaultError) {
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
}

// Export an instance of DBController so that all other files use the same one
export default new DBController();