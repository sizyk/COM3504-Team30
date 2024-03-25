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
    };

    request.onupgradeneeded = (e) => {
      this.db = e.target.result;

      this.db.createObjectStore('plants', { keyPath: '_id' });
      this.db.createObjectStore('sync-queue', { keyPath: '_id' });
    };
  }

  /**
   * PUTs an object to a store (creates or updates)
   * @param storeName {string} the store to PUT to
   * @param object {Object} the object to put into the store
   * @param successCallback {function(Event): void} the function to call on transaction success
   * @param failureCallback {function(Event): void} the function to call on transaction failure
   */
  put(storeName, object, successCallback = defaultSuccess, failureCallback = defaultError) {
    if (this.db && object) {
      const request = this.db.transaction([storeName], 'readwrite').objectStore(storeName).put(object);

      request.onsuccess = successCallback;
      request.onerror = failureCallback;
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
}

// Export instance of IDB to ensure the same instance is used everywhere
export default new IDB('plants', 1);
