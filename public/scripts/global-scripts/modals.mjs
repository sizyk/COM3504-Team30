/**
 * Adds/removes the 'visible' class to/from a modal, depending on whether it is active
 * @param modal {HTMLDivElement} the modal to adjust visibility of
 */
function setModalVisibility(modal) {
  if (modal.classList.contains('active')) {
    modal.classList.remove('invisible');
  } else {
    // Timeout ensures modal finishes its CSS transitions before being made invisible
    setTimeout(() => {
      if (!modal.classList.contains('active')) {
        modal.classList.add('invisible');
      }
    }, 510);
  }
}

/**
 * Initialises functionality of all modals on the page
 */
export default function initModals() {
  // Add click event listeners to all modal toggle buttons
  document.querySelectorAll('[data-toggle="modal"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById(btn.getAttribute('data-target'));
      modal.classList.toggle('active');

      setModalVisibility(modal);
    });
  });

  // Add click event listeners to all modal close buttons
  document.querySelectorAll('[data-close="modal"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal, [data-modal]');

      modal.classList.remove('active');

      setModalVisibility(modal);
    });
  });
}
