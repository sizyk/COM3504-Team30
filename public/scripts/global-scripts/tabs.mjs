/**
 * Displays a tab with a given ID, and hides the others
 * @param buttonList {NodeList} all tab buttons
 * @param tabList {NodeList} all tab content divs
 * @param tabID {string} the ID of the tab to show
 */
function activateTab(buttonList, tabList, tabID) {
  // Ensure button for current tab is the only active one
  buttonList.forEach((button) => {
    button.classList.remove('active');

    if (button.dataset.target === tabID) {
      button.classList.add('active');
    }
  });

  // Ensure current tab is the only active one
  tabList.forEach((tab) => {
    tab.classList.remove('active');

    if (tab.id === tabID) {
      tab.classList.add('active');
      if ('hasLeafletMap' in tab.dataset) {
        // Force leaflet map to invalidate size when removing display: hidden
        tab.querySelector('[data-is-leaflet]').dispatchEvent(new Event('leaflet-invalidate'));
      }
    }
  });
}

/**
 * Initialises functionality of all tabs on the page
 */
export default function initTabs() {
  // Detect all tab groups on the page
  document.querySelectorAll('.tabs').forEach((tabGroup) => {
    const tabButtons = tabGroup.querySelectorAll(':scope >.tab-buttons>.tab-button');
    const tabList = tabGroup.querySelectorAll(':scope>.tab-container>.tab-content');

    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activateTab(tabButtons, tabList, button.dataset.target);
      });
    });

    activateTab(tabButtons, tabList, tabButtons[0].dataset.target);
  });
}
