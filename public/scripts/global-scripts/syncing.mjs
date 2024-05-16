import IDB from '../utils/IDB.mjs';
import DBController from '../utils/DBController.mjs';
import { clearMessage, showMessage } from '../utils/flash-messages.mjs';
import { IDBOpenEvent } from '../utils/CustomEvents.mjs';
import { displayPlantCards, indexPlantTemplate } from '../utils/plantUtils.mjs';

const onlineStatus = document.getElementById('online-status');

/**
 * Method called when syncing is finished, updates the page to display new plants
 * @param filters {Object} any filters to apply to the GET request
 * @param card {indexPlantTemplate | singlePlantTemplate}
 */
function onSynchronise(filters, card) {
  // Replace currently rendered cards with new ones
  DBController.get('plants', filters, (plants) => displayPlantCards(card, plants));
}

/**
 * Synchronises the local database with the remote
 */
function syncDB() {
  // Synchronise all events that were performed offline
  DBController.synchronise().then((success) => {
    if (success) {
      showMessage('Sync complete!', 'success', 'sync');

      if (window.location.pathname === '/') {
        onSynchronise({}, indexPlantTemplate);
      }
    } else {
      showMessage('Sync failed. Refresh to try again.', 'error', 'sync');
    }
  }).catch((error) => {
    console.log(error);
    if (window.location.pathname === '/') {
      onSynchronise({}, indexPlantTemplate);
    }
    clearMessage(); // Fail silently - rejected promise means nothing to sync
  });
}

/**
 * Fires when internet connection is detected.
 * Retrieves all plants from API endpoint, and updates the user's indexedDB to match.
 * Also pushes all plants from sync-queue to mongoDB
 */
function connectHandler() {
  // Use event listener to prevent sync attempts occurring before IDB is open
  window.addEventListener(IDBOpenEvent.type, syncDB);

  if (IDB.db) {
    window.dispatchEvent(IDBOpenEvent);
  }

  onlineStatus.innerText = 'wifi';
  onlineStatus.title = 'Online';
}

/**
 * Fires when internet connection is lost, informing the user that their changes will not be saved
 */
function disconnectHandler() {
  onlineStatus.innerText = 'wifi_off';
  onlineStatus.title = 'Offline';
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
  window.addEventListener('offline', disconnectHandler);
}
