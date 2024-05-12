import getUsername from '../utils/localStore.mjs';

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

  // Initialising socket.io for notifications
  let socket = null;
  if (typeof io !== 'undefined') {
    // eslint-disable-next-line no-undef
    socket = io();
  }
  if (socket && navigator.onLine) {
    // When chnages are detected in the database emit a socket event that
    // checks if the user should receive the notification
    socket.on('databaseChange', (data) => {
      const username = getUsername();
      data.forEach((chat) => {
        if (username === chat.user) {
          return;
        }
        socket.emit('check', chat.plant, username);
      });
    });

    // When the user should receive a notification, send the notification through the service worker
    socket.on('sendNotification', (username) => {
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
