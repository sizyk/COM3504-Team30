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
    const plantGrid = document.getElementById('plant-grid');
    if (plantGrid !== null) {
      let plantCount = 0;
      Array.from(plantGrid.children).forEach((plant) => {
        if (plant.dataset.user === username) {
          plantCount += 1;
        }
      });

      let userCompliment;
      if (plantCount === 0) {
        userCompliment = 's. You can get started by clicking the plus icon!';
      } else if (plantCount === 1) {
        userCompliment = '. Congrats on getting started!';
      } else if (plantCount < 5) {
        userCompliment = 's. Keep it up!';
      } else {
        userCompliment = 's! Amazing job!';
      }

      const userPostString = `You have posted ${plantCount} plant${userCompliment}`;

      localStorage.setItem('user-posted-string', userPostString);
    }

    document.querySelectorAll('[data-fill="user-posted-string"]').forEach((elem) => {
      elem.innerText = localStorage.getItem('user-posted-string');
    });

    document.querySelectorAll('[data-fill="username"]').forEach((elem) => {
      elem.innerText = username;
    });

    showLogoutButton();
  }
}

function onLoginSubmit(e) {
  const username = document.getElementById('username').value;
  e.preventDefault();
  if (username) {
    localStorage.setItem('username', username);
    // Hide the modal after login
    hideLoginModal();
    showMessage(`Welcome ${username}!`, 'info');
    handleLogin();
  } else {
    showMessage('Please Login', 'info');
  }
}

export default function initLogin() {
  const loginModal = document.getElementById('login-modal');
  const logoutButton = document.getElementById('logout-button');
  document.addEventListener('DOMContentLoaded', handleLogin);
  loginModal.addEventListener('submit', onLoginSubmit);
  logoutButton.addEventListener('click', handleLogout);
}
