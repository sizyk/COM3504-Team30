const flashContainer = document.getElementById('flash-message');
const flashMessage = flashContainer.firstElementChild;
const flashIcon = document.querySelector('#flash-message i');
const flashText = document.querySelector('#flash-message span');

/**
 * Hides the flash message
 */
export function clearMessage() {
  flashContainer.style.transform = 'translateY(-100%)';
}

/**
 * Shows a flash message to the user, which will remain for 3.5 seconds before disappearing
 * @param message {string} the message to display
 * @param type {'success' | 'info' | 'error'} the type of flash message
 * @param icon {string} a material symbols icon to display next to the message
 * @param sticky {boolean} if true, message will not disappear after 3.5 seconds
 */
export function showMessage(message, type, icon = '', sticky = false) {
  flashMessage.classList.forEach((c) => {
    if (c.startsWith('flash-')) {
      flashMessage.classList.remove(c);
    }
  });

  flashMessage.classList.add(`flash-${type}`);
  flashText.innerText = message;
  flashIcon.innerText = icon;

  flashContainer.style.transform = 'translateY(0)';

  if (!sticky) {
    setTimeout(() => {
      clearMessage();
    }, 3500);
  }
}