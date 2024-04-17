import { showLoginModal } from '../global-scripts/login.mjs';
import { showMessage } from './flash-messages.mjs';
/**
 * Safely reads username from LocalStore
 */
export default function getUsername() {
  const username = localStorage.getItem('username');
  if (!username) {
    showMessage('Logged out unexpectedly', 'error');
    showLoginModal();
  }

  return username;
}
