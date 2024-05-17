import IDB from '../utils/IDB.mjs';
import DBController from '../utils/DBController.mjs';
import { clearMessage, showMessage } from '../utils/flash-messages.mjs';
import { IDBOpenEvent } from '../utils/CustomEvents.mjs';
import { displayPlantCards, indexPlantTemplate } from '../utils/plantUtils.mjs';
import { addUserMessage } from '../chat.js';

const onlineStatus = document.getElementById('online-status');

/**
 * Method called when syncing is finished, updates the page to display new plants/chats
 */
function onSynchronise() {
  if (window.location.pathname === '/') {
    // Replace currently rendered cards with new ones
    DBController.get('plants', {}, (plants) => displayPlantCards(indexPlantTemplate, plants));
  } else if (window.location.pathname.startsWith('/plant/')) {
    // Remove trailing forward slash (if any) and parse to get plant ID
    const [plantID] = window.location.href.replace(/\/$/, '').split('/').slice(-1);

    // Display all chats
    DBController.get('chats', { plant: plantID }, (chats) => {
      chats.forEach((chat) => {
        addUserMessage(chat.message, chat.user);
      });
    });
  }
}

/**
 * Synchronises the local database with the remote
 */
function syncDB() {
  // Synchronise all events that were performed offline
  DBController.synchronise().then((success) => {
    if (success) {
      showMessage('Sync complete!', 'success', 'sync');

      onSynchronise(); // Perform post-sync task
    } else {
      showMessage('Sync failed. Refresh to try again.', 'error', 'sync');
    }
  }).catch((error) => {
    console.log(error);
    onSynchronise();
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
