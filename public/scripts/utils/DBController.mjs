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

  static async requestSync() {
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.sync.register('sync-idb');
      return true;
    } catch {
      console.error('Background Sync could not be registered!');
      return false;
    }
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
      DBController.requestSync().then(() => {});
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
      DBController.requestSync().then(() => {});
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

  /**
   * Attempts to synchronise data from IDB to mongoDB
   * @returns {Promise<boolean>} resolves to `true` when all queued synchronisations have completed
   */
  IDBToMongo() {
    return new Promise((resolve) => {
      this.idb.getAll('sync-queue', (transaction) => {
        // Create array stating whether each queued synchronisation has been resolved
        const resolver = Array(transaction.target.result.length).fill(false);
        const i = 0;
        transaction.target.result.forEach((syncObject) => {
          switch (syncObject.operation) {
            case 'put':
              this.createOrUpdate(syncObject.store, syncObject.queuedObject, () => {
                this.idb.delete('sync-queue', syncObject._id, () => {
                  resolver[i] = true;
                  if (resolver.every((v) => v === true)) {
                    resolve(true);
                  }
                });
              });
              break;
            case 'delete':
              this.delete(syncObject.store, syncObject.queuedObject, () => {
                this.idb.delete('sync-queue', syncObject._id, () => {
                  resolver[i] = true;
                  if (resolver.every((v) => v === true)) {
                    resolve(true);
                  }
                });
              });
              break;
            default:
              defaultError('Illegal operation in synchronise!');
          }
        });
      }, console.error);
    });
  }

  /**
   * horrible code to synchronise from IDB to mongoDB, and then the other way round
   * @returns {Promise<boolean>} resolves to true once complete
   */
  synchronise() {
    return new Promise((resolve) => {
      this.IDBToMongo().then(() => {
        // Sync all plants to indexedDB
        fetch('/api/plants/get-all')
          .then((res) => res.json())
          .then((plants) => {
            const resolver = Array(plants.length).fill(false);
            let i = 0;
            plants.forEach((p) => {
              // Attempt to remove current plant from indexedDB, to be replaced with updated one
              i += 1;
              IDB.delete(
                'plants',
                p._id,
                () => {
                  // Removal was successful, attempt to update with new plant
                  IDB.put('plants', p, () => {
                    resolver[i] = true;
                    if (resolver.every((v) => v === true)) {
                      resolve(true);
                    }
                  });
                },
              );
            });
          });
      });
    });
  }
}

// Export an instance of DBController so that all other files use the same one
export default new DBController();
