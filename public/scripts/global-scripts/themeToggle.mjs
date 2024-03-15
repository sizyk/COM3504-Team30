const toggleSwitch = document.getElementById('theme-toggle');
const htmlElem = document.getElementsByTagName('html')[0];

/**
 * Sets the theme to a specific value, and stores the current theme in localStorage
 * to save between pages. Used rather than a simple toggle so that the theme can be
 * set to a fallback value on script initialisation.
 * @param {'light'|'dark'} theme - the theme to set
 */
function setTheme(theme) {
  if (theme !== 'dark' && theme !== 'light') {
    return;
  }

  localStorage.setItem('current-theme', theme);

  // Clear classlist (in case user has manually edited it to add both)
  htmlElem.classList.remove('light');
  htmlElem.classList.remove('dark');

  htmlElem.classList.add(theme);

  if (toggleSwitch !== null) {
    toggleSwitch.dataset.theme = theme;
  }
}

/**
 * Toggles dark mode on or off
 */
function toggleDarkMode() {
  switch (localStorage.getItem('current-theme')) {
    case 'light':
      setTheme('dark');
      break;
    case 'dark':
      setTheme('light');
      break;
    default:
      setTheme('light');
  }
}

/**
 * Initialises the theme toggle script
 */
export default function initThemeToggle() {
  // Use light theme as a fallback if nothing found in localStorage
  setTheme(localStorage.getItem('current-theme') || 'light');

  if (toggleSwitch !== null) {
    toggleSwitch.addEventListener('click', toggleDarkMode);
  }
}
