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
   * @param toSend {Object} the object to send to the API endpoint.
   * @param onSuccess {function(string, Object): void} callback function to run on success -
   *        takes a message (as a string) and, optionally, the updated/created object.
   * @param onError {function(string): void} callback function to run on error -
   *        takes a message (as a string).
   */
  mongoPut(collection, toSend, onSuccess = defaultSuccess, onError = defaultError) {
    if (!navigator.onLine) {
      this.idb.queueSync(
        collection,
        toSend,
        'put',
        () => onSuccess('Successfully saved to local database! Update will be synchronised next time you connect to the internet.', toSend),
        () => onError('Operation failed to queue! Please try again.'),
      );
      return;
    }

    // Post to mongoDB endpoint
    fetch(`/api/${collection}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toSend),
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }

      // Throw error if status code not 200 (OK)
      throw new Error(`code ${res.status}`);
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
  mongoDelete(collection, id, onSuccess = defaultSuccess, onError = defaultError) {
    if (!navigator.onLine) {
      this.idb.queueSync(
        collection,
        id,
        'delete',
        () => onSuccess('Successfully deleted from local database! Deletion will be synchronised next time you connect to the internet.'),
        () => onError('Operation failed to queue! Please try again.'),
      );
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
   * @param toUpload {Object} the object to upload to the database
   * @param onSuccess {function(string, Object): void} callback function to run on success -
   *        takes a message (as a string) and, optionally, the updated/created object.
   * @param onError {function(string): void} callback function to run on error -
   *        takes a message (as a string).
   */
  createOrUpdate(collection, toUpload, onSuccess = defaultSuccess, onError = defaultError) {
    // Safety check to ensure id is present
    if (!Object.prototype.hasOwnProperty.call(toUpload, '_id')) {
      onError("'_id' property missing from request!");
    }

    // Attempt to PUT to indexedDB, and, if successful, PUT to MongoDB
    this.idb.put(
      collection,
      toUpload,
      () => this.mongoPut(collection, toUpload, onSuccess, onError),
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
      () => this.mongoDelete(collection, id, onSuccess, onError),
      () => onError(`Failed to delete object with ID ${id} from indexedDB!`),
    );
  }

  synchronise() {
    this.idb.getAll('sync-queue', (transaction) => {
      transaction.target.result.forEach((syncObject) => {
        switch (syncObject.operation) {
          case 'put':
            this.createOrUpdate(syncObject.store, syncObject.queuedObject, () => {});
            this.idb.delete('sync-queue', syncObject._id, () => {});
            break;
          case 'delete':
            this.delete(syncObject.store, syncObject.queuedObject, () => {});
            this.idb.delete('sync-queue', syncObject._id, () => {});
            break;
          default:
            defaultError('Illegal operation in synchronise!');
        }
      });
    }, console.error);
  }
}

// Export an instance of DBController so that all other files use the same one
export default new DBController();
