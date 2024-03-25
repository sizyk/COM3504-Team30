import IDB from '../utils/IDB.mjs';

/**
 * Fires when internet connection is detected.
 * Retrieves all plants from API endpoint, and updates the user's indexedDB to match.
 * Also pushes all plants from sync-queue to mongoDB
 */
function connectHandler() {
  console.log('You are now online, syncing...');
  // Sync all plants to indexedDB
  fetch('/api/plants/get-all')
    .then((res) => res.json())
    .then((plants) => {
      plants.forEach((p) => {
        // Attempt to remove current plant from indexedDB, to be replaced with updated one
        IDB.delete(
          'plants',
          // (blame mongoDB)
          // eslint-disable-next-line no-underscore-dangle
          p._id,
          () => {
            // Removal was successful, attempt to update with new plant
            IDB.put('plants', p, () => {});
          },
        );
      });
    });
}

/**
 * Fires when internet connection is lost, informing the user that their changes will not be saved
 */
function disconnectHandler() {
}

/**
 * Initialises syncing functionality
 */
export default function initSyncing() {
  if (window.navigator.onLine) {
    connectHandler();
  } else {
    disconnectHandler();
  }

  window.addEventListener('online', connectHandler);
}
