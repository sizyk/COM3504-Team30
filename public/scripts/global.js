/* eslint import/extensions: 0 */

// Import and initialise required modules
import initThemeToggle from './global-scripts/themeToggle.mjs';
import initModals from './global-scripts/modals.mjs';
import initTouchScreen from './global-scripts/touchHover.mjs';
import initSyncing from './global-scripts/syncing.mjs';
import initSW from './global-scripts/serviceWorker.mjs';
import initLogin from './global-scripts/login.mjs';
import initTabs from './global-scripts/tabs.mjs';
import initNotifications from './global-scripts/notifications.mjs';

initSW();
initNotifications();
initThemeToggle();
initModals();
initTouchScreen();
initLogin();
initTabs();

// Only enable syncing if not in offline mode
if (!(Object.prototype.hasOwnProperty.call(window, 'plantsAppOffline') || window.plantsAppOffline === false)) {
  initSyncing();
}
