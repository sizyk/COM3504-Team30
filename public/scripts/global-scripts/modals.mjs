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
 * Initialises a single modal
 * @param modal {HTMLDivElement} the modal to initialise
 */
export function initialiseModal(modal) {
  if (modal.id === 'login-modal') {
    return;
  }
  const toggleBtn = document.querySelector(`[data-toggle="modal"][data-target="${modal.id}"]`);
  toggleBtn.addEventListener('click', () => {
    modal.classList.toggle('active');
    setModalVisibility(modal);
  });

  modal.querySelectorAll('[data-close="modal"]').forEach((closeBtn) => {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');

      setModalVisibility(modal);
    });
  });
}

/**
 * Initialises functionality of all modals on the page
 */
export default function initModals() {
  // Add click event listeners to all modal toggle buttons
  document.querySelectorAll('.modal').forEach(initialiseModal);
}
