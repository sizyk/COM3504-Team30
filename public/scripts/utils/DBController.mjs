import IDB from './IDB.mjs';
import { showMessage } from './flash-messages.mjs';

function defaultSuccess(message) {
  showMessage(message, 'success', 'check_circle');
}

function defaultError(message) {
  showMessage(message, 'error', 'error');
}

// List of stores that should be synchronised
const SYNC_STORES = ['plants'];

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
    const offlineCB = () => {
      this.idb.queueSync(
        collection,
        toSend,
        'put',
        () => onSuccess('Successfully saved to local database! Update will be synchronised next time you connect to the internet.', toSend),
        () => onError('Operation failed to queue! Please try again.'),
      );
    };

    if (!navigator.onLine) {
      offlineCB();
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
    }).catch(() => {
      offlineCB();
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
    const offlineCB = () => {
      this.idb.queueSync(
        collection,
        id,
        'delete',
        () => onSuccess('Successfully deleted from local database! Deletion will be synchronised next time you connect to the internet.'),
        () => onError('Operation failed to queue! Please try again.'),
      );
    };

    if (!navigator.onLine) {
      offlineCB();
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
    }).catch(() => {
      offlineCB();
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

  /**
   * Attempts to synchronise data from IDB to mongoDB
   * @returns {Promise<boolean>} resolves to `true` when all queued synchronisations have completed
   */
  IDBToMongo() {
    return new Promise((resolve) => {
      this.idb.getAll('sync-queue', (transaction) => {
        // Create array stating whether each queued synchronisation has been resolved
        const resolver = Array(transaction.target.result.length).fill(false);

        if (resolver.length === 0) {
          // Nothing to upload, so resolve
          resolve(true);
        }

        let i = 0;
        transaction.target.result.forEach((syncObject) => {
          let op;
          switch (syncObject.operation) {
            case 'put':
              op = (store, obj, success, fail) => this.createOrUpdate(store, obj, success, fail);
              break;
            case 'delete':
              op = (store, obj, success, fail) => this.delete(store, obj, success, fail);
              break;
            default:
              resolve(false);
              defaultError('Illegal operation in synchronise!');
              return;
          }

          // Perform selected operation
          op(syncObject.store, syncObject.queuedObject, () => {
            this.idb.delete('sync-queue', syncObject._id, () => {
              resolver[i] = true;
              i += 1;
              // Check if all operations have finished, if so then resolve as true
              if (resolver.every((v) => v === true)) {
                resolve(true);
              }
            }, () => resolve(false));
          }, () => resolve(false));
        });
      }, () => resolve(false));
    });
  }

  /**
   * Synchronises data from mongoDB to IndexedDB
   * @returns {Promise<boolean>} resolves to true if all sync successfully, false if any fail
   */
  mongoToIDB() {
    /**
     * Wrapper for deleting a local object from IDB, and adding a remote one
     * Refactored to here as having it in the promise is far too messy
     * @param store {string} the store to update
     * @param obj {object} the object to update
     * @param resolver {boolean[]} list of booleans, representing sync completeness
     * @param i {number} the index in 'resolver' of this operation
     * @param resolve {function} the promise's resolve function
     */
    const deleteObject = (store, obj, resolver, i, resolve) => {
      this.idb.delete(store, obj._id, () => {
        // Removal was successful, attempt to update with new plant
        this.idb.put(store, obj, () => {
          resolver[i] = true;
          if (resolver.every((v) => v === true)) {
            resolve(true);
          }
        }, () => {
          resolve(false);
        });
      }, () => {
        resolve(false);
      });
    };

    return new Promise((resolve) => {
      // Sync each store from mongoDB to indexedDB
      SYNC_STORES.forEach((store) => {
        // Sync all objects to indexedDB
        fetch(`/api/${store}/get-all`)
          .then((res) => res.json())
          .then((objects) => {
            const resolver = Array(objects.length).fill(false);
            let i = 0;
            objects.forEach((o) => {
              // Attempt to remove current plant from indexedDB, to be replaced with updated one
              deleteObject(store, o, resolver, i, resolve);
              i += 1;
            });
          });
      });
    });
  }

  /**
   * Synchronise from IDB to mongoDB, and then the other way round
   * @returns {Promise<boolean>} resolves to true once complete
   */
  synchronise() {
    return new Promise((resolve, reject) => {
      this.IDBToMongo().then((success) => {
        if (!success) {
          resolve(false);
        } else {
          this.mongoToIDB().then(resolve);
        }
      }).catch(reject);
    });
  }
}

// Export an instance of DBController so that all other files use the same one
export default new DBController();
