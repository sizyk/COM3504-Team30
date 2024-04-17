/**
 * @returns {boolean} whether or not current device is touchscreen
 */
function isTouchDevice() {
  return (('ontouchstart' in window)
    || (navigator.maxTouchPoints > 0)
    || (navigator.msMaxTouchPoints > 0));
}

/**
 * Initialises 'tap-to-hover' effects on touchscreen devices, for elements with the
 * `touchscreen-hover` class.
 */
export default function initTouchScreen() {
  // Code to allow hovering on touchscreen devices
  const touchHoverElems = Array.from(document.getElementsByClassName('touchscreen-hover'));

  // Unhover everything when user clicks anywhere that isn't hoverable
  document.addEventListener('click', () => {
    // Guard clause to stop this from running on non-touchscreen devices
    if (!isTouchDevice()) {
      return;
    }

    touchHoverElems.forEach((elem) => {
      elem.classList.remove('hover');
    });
  });

  // Add click listener to all elements that require hovering on touchscreen
  touchHoverElems.forEach((elem) => {
    elem.addEventListener('click', (e) => {
      // Guard clause to stop this from running on non-touchscreen devices
      if (!isTouchDevice()) {
        return;
      }

      // Unhover all other elements that are not the current one, and not ancestors of current one
      touchHoverElems.forEach((otherElem) => {
        if (!otherElem.contains(elem)) {
          otherElem.classList.remove('hover');
        }
      });

      elem.classList.toggle('hover');

      e.stopPropagation(); // Prevent document click listener from being called
    });
  });
}
