import { showMessage } from '../utils/flash-messages.mjs';

export function showLoginModal() {
  document.getElementById('login-modal').classList.add('active');
  document.getElementById('login-modal').classList.remove('invisible');
}

function hideLoginModal() {
  document.getElementById('login-modal').classList.remove('active');
  document.getElementById('login-modal').classList.add('invisible');
}

function showLogoutButton() {
  document.getElementById('logout-button').classList.remove('invisible');
}

function hideLogoutButton() {
  document.getElementById('logout-button').classList.add('invisible');
}

function handleLogout() {
  localStorage.removeItem('username');
  hideLogoutButton();
  showLoginModal();
}

function handleLogin() {
  const username = localStorage.getItem('username');
  if (!username) {
    // If no user is "logged in", show the login modal
    showLoginModal();
  } else {
    showLogoutButton();
  }

  document.getElementById('login-modal').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    if (username) {
      localStorage.setItem('username', username);
      // Hide the modal after login
      hideLoginModal();
      showMessage(`Welcome ${username}!`, 'info');
      showLogoutButton();
    } else {
      showMessage('Please Login', 'info');
    }
  });
}

export default function initLogin() {
  const logoutButton = document.getElementById('logout-button');
  document.addEventListener('DOMContentLoaded', handleLogin);
  logoutButton.addEventListener('click', handleLogout);
}
