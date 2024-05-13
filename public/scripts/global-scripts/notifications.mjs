import getUsername from '../utils/localStore.mjs';

const sentNotifications = [];

/**
 * Initialises Notifications for the browser
 * and sets up socket.io for real-time notifications
 */
export default async function initNotifications() {
  // Check if the browser supports notifications
  if ('Notification' in window) {
    // Check if the user has granted permission to receive notifications
    if (Notification.permission === 'granted') {
      // Notifications are allowed, you can proceed to create notifications
      // Or do whatever you need to do with notifications
    } else if (Notification.permission !== 'denied') {
      // If the user hasn't been asked yet or has previously denied permission,
      // you can request permission from the user
      Notification.requestPermission().then((permission) => {
        // If the user grants permission, you can proceed to create notifications
        if (permission === 'granted') {
          navigator.serviceWorker.ready
            .then((serviceWorkerRegistration) => {
              serviceWorkerRegistration.showNotification(
                'Plants App',
                { body: 'Notifications are enabled!' },
              )
                .then((r) => console.log(r));
            });
        }
      });
    }
  }

  // Initialise socket.io for real-time notifications
  // - Creates multiple on load so further checks are needed
  if (typeof io !== 'undefined') {
    //eslint-disable-next-line no-undef
    window.socket = io();
    if (navigator.onLine) {
      window.socket.emit('check for chats', getUsername());
    }
  }
  if (window.socket && navigator.onLine) {
    // When changes are detected in the database emit a socket event that
    // checks if the user should receive the notification
    window.socket.on('databaseChange', (data) => {
      const username = getUsername();
      data.forEach((chat) => {
        if (username === chat.user) {
          return;
        }
        // passes plant id and username for checks
        window.socket.emit('check', chat.plant, username, chat._id);
      });
    });

    // When the user should receive a notification,
    // send the notification through the service worker
    window.socket.on('sendNotification', (username, id) => {
      // Checks if notification is already sent,
      // it doesn't send multiple notifications for the same chat
      // Also checks if the notification is meant for the current user
      if (Notification.permission === 'granted' && username === getUsername() && !sentNotifications.includes(id)) {
        sentNotifications.push(id);
        navigator.serviceWorker.ready
          .then((serviceWorkerRegistration) => {
            serviceWorkerRegistration.showNotification(
              'Plants App',
              { body: 'New chat' },
            )
              .then((r) => console.log(r));
          });
      }
    });
  }
}
