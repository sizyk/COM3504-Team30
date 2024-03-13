// Store all elements that require hover functionality on mobile
const TOUCH_HOVER_ELEMS = document.getElementsByClassName('touchscreen-hover');

/**
 * @returns {boolean} whether or not current device is touchscreen
 */
function isTouchDevice() {
  return (('ontouchstart' in window)
    || (navigator.maxTouchPoints > 0)
    || (navigator.msMaxTouchPoints > 0));
}

// Code to allow hovering on touchscreen devices
if (isTouchDevice()) {
  // Unhover everything when user clicks anywhere that isn't hoverable
  document.addEventListener('click', () => {
    Array.from(TOUCH_HOVER_ELEMS).forEach((elem) => {
      elem.classList.remove('hover');
    });
  });

  // Add click listener to all elements that require hovering on touchscreen
  Array.from(TOUCH_HOVER_ELEMS).forEach((elem) => {
    elem.addEventListener('click', (e) => {
      // Unhover all other elements that are not the current one, and not ancestors of current one
      Array.from(TOUCH_HOVER_ELEMS).forEach((otherElem) => {
        if (!otherElem.contains(elem)) {
          otherElem.classList.remove('hover');
        }
      });

      elem.classList.toggle('hover');

      e.stopPropagation(); // Prevent document click listener from being called
    });
  });
}
