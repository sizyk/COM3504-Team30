/* eslint import/extensions: 0 */

// Import and initialise required modules
import initThemeToggle from './global-scripts/themeToggle.mjs';
import initModals from './global-scripts/modals.mjs';
import initTouchScreen from './global-scripts/touchHover.mjs';
import initSyncing from './global-scripts/syncing.mjs';
import initSW from './global-scripts/serviceWorker.mjs';

initSW();
initThemeToggle();
initModals();
initTouchScreen();

// Only enable syncing if not in offline mode
if (!(Object.prototype.hasOwnProperty.call(window, 'plantsAppOffline') && window.plantsAppOffline === true)) {
  initSyncing();
}
