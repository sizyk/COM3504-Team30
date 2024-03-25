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
   * PUTs data from a form to an API endpoint for a given collection
   * @param collection {string} the database collection to PUT to.
   * @param formData {FormData | Object} the object to send to the API endpoint
   *        (must be FormData if sending files).
   * @param onSuccess {function(string, Object): void} callback function to run on success -
   *        takes a message (as a string) and, optionally, the updated/created object.
   * @param onError {function(string): void} callback function to run on error -
   *        takes a message (as a string).
   */
  static mongoPut(collection, formData, onSuccess = defaultSuccess, onError = defaultError) {
    if (!navigator.onLine) {
      onSuccess('Successfully saved to local database!');
      return;
    }

    // Post to mongoDB endpoint
    fetch(`/api/${collection}`, {
      method: 'PUT',
      body: formData,
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
  static mongoDelete(collection, id, onSuccess = defaultSuccess, onError = defaultError) {
    if (!navigator.onLine) {
      onSuccess('Successfully deleted from local database! Deletion will be synchronised when you next connect to the internet.');
      return;
    }

    // Delete from mongoDB endpoint
    fetch(`/api/${collection}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }

      // Throw error if status code not 200 (OK)
      throw new Error(`Response code ${res.status} when trying to access MongoDB. Deletion queued for syncing.`);
      // Report success/error with respective callback functions
    }).then((resJson) => {
      onSuccess(resJson.message);
    }).catch((error) => {
      onError(error);
    });
  }

  /**
   * Creates on object, or, if it already exists, updates it.
   * @param collection {string} the collection to perform the 'upsert' operation on.
   * @param toUpload {{obj: Object, formData: FormData}} the object to upload to
   *        IndexedDB, and the FormData to upload to mongoDB (allows files)
   * @param onSuccess {function(string, Object): void} callback function to run on success -
   *        takes a message (as a string) and, optionally, the updated/created object.
   * @param onError {function(string): void} callback function to run on error -
   *        takes a message (as a string).
   */
  createOrUpdate(collection, toUpload, onSuccess = defaultSuccess, onError = defaultError) {
    // Safety check to ensure id is present
    if (!Object.prototype.hasOwnProperty.call(toUpload.obj, '_id') || !toUpload.formData.has('_id')) {
      onError("'_id' property missing from request!");
    }

    const mongoData = Object.prototype.hasOwnProperty.call(toUpload, 'formData') ? toUpload.formData : toUpload.obj;

    // Attempt to PUT to indexedDB, and, if successful, PUT to MongoDB
    this.idb.put(
      collection,
      toUpload.obj,
      () => DBController.mongoPut(collection, mongoData, onSuccess, onError),
      () => onError('Create operation failed in indexed DB! Please try again.'),
    );
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
