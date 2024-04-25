import { leafletInvalidateEvent } from '../utils/CustomEvents.mjs';

const ALL_TAB_BUTTONS = document.querySelectorAll('[data-toggle="tab"]');

/**
 * Displays a tab with a given ID, and hides the others
 * @param tabList {NodeList | HTMLCollection} all tab content divs
 * @param tabID {string} the ID of the tab to show
 */
function activateTab(tabList, tabID) {
  // Ensure current tab is the only active one
  // Array.from needed as forEach does not exist on HTMLCollection
  Array.from(tabList).forEach((tab) => {
    tab.classList.remove('active');

    if (tab.id === tabID) {
      tab.classList.add('active');
      if ('hasLeafletMap' in tab.dataset) {
        // Force leaflet map to invalidate size when removing display: hidden
        tab.querySelector('[data-is-leaflet]').dispatchEvent(leafletInvalidateEvent);
      }

      // Allow tab buttons to update themselves
      ALL_TAB_BUTTONS.forEach((tabButton) => {
        tabButton.dispatchEvent(new Event(`tab-activated-${tabID}`));
      });
    } else {
      // Allow tab buttons to update themselves
      ALL_TAB_BUTTONS.forEach((tabButton) => {
        tabButton.dispatchEvent(new Event(`tab-deactivated-${tab.id}`));
      });
    }
  });
}

/**
 * Initialises functionality of all tabs on the page
 */
export default function initTabs() {
  // Initialise tab buttons
  document.querySelectorAll('[data-toggle="tab"]').forEach((tabButton) => {
    // Get list of tabs in tab group, (button target + siblings)
    const tabList = document.getElementById(tabButton.dataset.target).parentElement.children;
    tabButton.addEventListener('click', () => {
      activateTab(tabList, tabButton.dataset.target);
    });

    tabButton.addEventListener(`tab-activated-${tabButton.dataset.target}`, () => {
      tabButton.classList.add(tabButton.dataset.activeClass);
    });

    tabButton.addEventListener(`tab-deactivated-${tabButton.dataset.target}`, () => {
      tabButton.classList.remove(tabButton.dataset.activeClass);
    });
  });

  // Detect all tab groups on the page, and activate the first one
  document.querySelectorAll('.tabs').forEach((tabGroup) => {
    const tabList = tabGroup.querySelectorAll(':scope>.tab-container>.tab-content');

    activateTab(tabList, tabList[0].id);
  });
}
