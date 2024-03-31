import IDB from '../utils/IDB.mjs';
import DBController from '../utils/DBController.mjs';
import { clearMessage, showMessage } from '../utils/flash-messages.mjs';

/**
 * Fires when internet connection is detected.
 * Retrieves all plants from API endpoint, and updates the user's indexedDB to match.
 * Also pushes all plants from sync-queue to mongoDB
 */
function connectHandler() {
  // Use event listener to prevent sync attempts occurring before IDB is open
  window.addEventListener('idb-open', () => {
    // Synchronise all events that were performed offline
    DBController.synchronise().then((success) => {
      if (success) {
        showMessage('Sync complete!', 'success', 'sync');
      } else {
        showMessage('Sync failed. Refresh to try again.', 'error', 'sync');
      }
    }).catch(() => clearMessage()); // Fail silently - rejected promise means nothing to sync
  });

  if (IDB.db) {
    window.dispatchEvent(new Event('idb-open'));
  }
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
