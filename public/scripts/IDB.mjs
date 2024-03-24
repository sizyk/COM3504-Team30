function defaultSuccess(e) {
  console.log(e.target.result);
}

function defaultError(e) {
  console.error(`Database Error: ${e.target.error}`);
}

class IDB {
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

  put(storeName, object, successCallback = defaultSuccess, failureCallback = defaultError) {
    if (this.db && object) {
      const request = this.db.transaction([storeName], 'readwrite').objectStore(storeName).put(object);

      request.onsuccess = successCallback;
      request.onerror = failureCallback;
    }
  }

  remove(storeName, id, successCallback = defaultSuccess, failureCallback = defaultError) {
    if (this.db) {
      const request = this.db.transaction([storeName], 'readwrite').objectStore(storeName).delete(id);

      request.onsuccess = successCallback;
      request.onerror = failureCallback;
    }
  }
}

// Export instance of IDB to ensure the same instance is used everywhere
export default new IDB('plants', 1);
