import { showMessage } from '../utils/flash-messages.mjs';
import { plantAddEvent } from '../utils/CustomEvents.mjs';

/**
 * Updates the user's 'posted string' to represent the amount of plants they have posted,
 * with extra text that is adjusted based on the number of posted plants.
 */
function updateUserPostedString() {
  const plantGrid = document.getElementById('plant-grid');
  const username = localStorage.getItem('username');
  if (plantGrid !== null && username !== null) {
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
}

export function showLoginModal() {
  document.getElementById('login-modal').classList.add('active');
  document.getElementById('login-modal').classList.remove('invisible');
}

function hideLoginModal() {
  document.getElementById('login-modal').classList.remove('active');
  document.getElementById('login-modal').classList.add('invisible');
}

function showLogoutButton() {
  const logoutButton = document.getElementById('logout-button');

  if (logoutButton) {
    logoutButton.classList.remove('invisible');
  }
}

function hideLogoutButton() {
  const logoutButton = document.getElementById('logout-button');

  if (logoutButton) {
    logoutButton.classList.add('invisible');
  }
}

function handleLogout() {
  localStorage.removeItem('username');
  hideLogoutButton();
  showLoginModal();
}

function handleLogin() {
  const username = localStorage.getItem('username');
  const editButton = document.getElementById('edit-button');
  if (!username) {
    // If no user is "logged in", show the login modal & hide the edit button
    if (editButton) {
      editButton.classList.add('invisible');
    }
    showLoginModal();
  } else {
    // If wrong user is "logged in", hide the edit button
    if (editButton && username !== editButton.dataset.user) {
      editButton.classList.add('invisible');
    }

    updateUserPostedString();

    document.querySelectorAll('[data-fill="username"]').forEach((elem) => {
      elem.innerText = username;
    });

    // Get user avatar (only use cool API one if not offline)
    document.querySelectorAll('[data-fill="user-avatar"]').forEach((elem) => {
      if (!window.navigator.onLine) {
        // if offline, just use first character of username
        elem.innerHTML = `
          <div class="h-full aspect-square hover-button font-bold text-4xl rounded-lg">
            ${username.charAt(0)}
          </div>
        `;
      } else {
        elem.innerHTML = `
          <img src="https://api.dicebear.com/8.x/thumbs/svg?radius=20&seed=${username}" alt="${username}'s avatar" />
        `;
      }
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

  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }

  document.addEventListener(plantAddEvent.type, updateUserPostedString);
}
