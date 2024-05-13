import getUsername from '../utils/localStore.mjs';

/**
 * Initialises Notifications for the browser
 * and sets up socket.io for real-time notifications
 * if the socket doesn't exist
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

  if (typeof io !== 'undefined') {
    let socketId = localStorage.getItem('socketId'); // try and get a socket id from local storage
    if (socketId !== null) {
      window.socket = io({ query: { socketId } }); // if a socket id is found, use it to connect to the server
    } else { // if not initialise a new socket connection and start the process of checking for chats
      window.socket = io();
      if (navigator.onLine) {
        window.socket.emit('check for chats');
        window.socket.on('connect', () => {
          localStorage.setItem('socketId', window.socket.id); // on connection, save the socket id to local storage
        });
      }

    }
  }
  if (window.socket && navigator.onLine) {

    // When chnages are detected in the database emit a socket event that
    // checks if the user should receive the notification
    window.socket.on('databaseChange', (data) => {
      const username = getUsername();
      data.forEach((chat) => {
        if (username === chat.user) {
          return;
        }
        window.socket.emit('check', chat.plant, username);
      });
    });

    // When the user should receive a notification, send the notification through the service worker
    window.socket.on('sendNotification', (username) => {
      if (Notification.permission === 'granted' && username === getUsername()) {
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
