function isTouchDevice() {
  return (('ontouchstart' in window)
    || (navigator.maxTouchPoints > 0)
    || (navigator.msMaxTouchPoints > 0));
}

if (isTouchDevice()) {
  const touchHoverElems = document.getElementsByClassName('touchscreen-hover');

  Array.from(touchHoverElems).forEach((elem) => {
    elem.addEventListener('click', (e) => {
      e.target.closest('.plant-card').classList.toggle('hover');
    });
  });
}
