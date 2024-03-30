function defaultSuccess(e) {
  console.log(e.target.result);
}

function defaultError(e) {
  console.error(`Database Error: ${e.target.error}`);
}

/**
 * @class IDB
 *
 * Wrapper for IndexedDB interactions
 */
class IDB {
  /**
   * @constructor constructs an IDB object, and creates the database if needed
   * @param name {string} the name of the database
   * @param version {number} the version number of the database
   */
  constructor(name, version) {
    this.db = false;

    const request = window.indexedDB.open(name, version);

    request.onerror = defaultError;

    request.onsuccess = () => {
      this.db = request.result;
      window.dispatchEvent(new Event('idb-open'));
    };

    request.onupgradeneeded = (e) => {
      this.db = e.target.result;

      this.db.createObjectStore('plants', { keyPath: '_id' });
      this.db.createObjectStore('sync-queue', { keyPath: '_id', autoIncrement: true });
    };
  }

  /**
   * PUTs an object to a store (creates or updates)
   * @param storeName {string} the store to PUT to
   * @param toUpload {Object} the object to put into the store
   * @param successCallback {function(Event): void} the function to call on transaction success
   * @param failureCallback {function(Event): void} the function to call on transaction failure
   */
  put(storeName, toUpload, successCallback = defaultSuccess, failureCallback = defaultError) {
    if (this.db && toUpload) {
      const performRequest = (obj) => {
        const request = this.db.transaction([storeName], 'readwrite').objectStore(storeName).put(obj);

        request.onsuccess = successCallback;
        request.onerror = failureCallback;
      };

      // If object has an _id key, check if exists before PUTing
      if (Object.prototype.hasOwnProperty.call(toUpload, '_id')) {
        // get original before updating with new keys
        const getRequest = this.db.transaction([storeName], 'readwrite').objectStore(storeName).get(toUpload._id);

        getRequest.onsuccess = () => {
          const obj = getRequest.result || {};
          // Add keys of new object, to prevent overwriting all keys of old one
          Object.keys(toUpload).forEach((key) => {
            obj[key] = toUpload[key];
          });

          performRequest(obj);
        };
      } else {
        performRequest(toUpload);
      }
    }
  }

  /**
   * Deletes an object with a given ID from a store
   * @param storeName {string} the store to delete from
   * @param id {string} the ID to delete
   * @param successCallback {function(Event): void} the function to call on transaction success
   * @param failureCallback {function(Event): void} the function to call on transaction failure
   */
  delete(storeName, id, successCallback = defaultSuccess, failureCallback = defaultError) {
    if (this.db) {
      const request = this.db.transaction([storeName], 'readwrite').objectStore(storeName).delete(id);

      request.onsuccess = successCallback;
      request.onerror = failureCallback;
    }
  }

  /**
   * Queues a synchronisation request, which will be performed as soon as the user connects to the
   * internet.
   * @param storeName {string} the store to queue the operation on
   * @param obj {Object | string} the object/ID to queue
   * @param operation {'put' | 'delete'} the operation to queue
   * @param successCallback {function(Event): void} the function to call on transaction success
   * @param failureCallback {function(Event): void} the function to call on transaction failure
   */
  queueSync(
    storeName,
    obj,
    operation,
    successCallback = defaultSuccess,
    failureCallback = defaultError,
  ) {
    const syncObject = {
      store: storeName,
      queuedObject: obj,
      operation,
    };

    this.put('sync-queue', syncObject, successCallback, failureCallback);
  }

  /**
   * Gets all objects from a given store in the IndexedDB
   * @param storeName {string} the store to get all objects frm
   * @param successCallback {function(Event): void} the function to call on transaction success
   * @param failureCallback {function(Event): void} the function to call on transaction failure
   */
  getAll(storeName, successCallback, failureCallback) {
    if (this.db) {
      const request = this.db.transaction([storeName], 'readonly').objectStore(storeName).getAll();
      request.onsuccess = successCallback;
      request.onerror = failureCallback;
    }
  }
}

// Export instance of IDB to ensure the same instance is used everywhere
export default new IDB('plants', 1);
