const chatsController = require('./chats');
const plantsController = require('./plants');

exports.init = (io) => {
  io.sockets.on('connection', (socket) => {
    try {
      let lastChecked = new Date();
      let userNotified = []; // Array to store users that have been notified

      /**
       * Function to check for new chats every 2 seconds
       */
      socket.on('check for chats', () => {
        // Query the 'chats' collection for changes every 2 seconds
        setInterval(async () => {
          const newChats = await chatsController.getNewChats(lastChecked);
          userNotified = [];
          // Update the last checked time
          lastChecked = new Date();

          if (newChats && newChats.length > 0) {
            // Emit a socket event with the new chats
            io.emit('databaseChange', newChats);
          }
        }, 2000);
      });

      /**
       * Checks if the user should receive a notification
       * by checking if the current user owns the plant related to the chat
       * also passes the id and username for front end checks later
       */
      socket.on('check', async (plant, username, id) => {
        const plantUser = await plantsController.getPlantsUser(plant);
        if (plantUser && plantUser === username && !userNotified.includes(username)) {
          io.emit('sendNotification', username, id);
          userNotified.push(username);
        }
      });

      /**
       * create or joins a room
       */
      socket.on('create or join', async (room) => {
        socket.join(room);
      });

      socket.on('chat', (room, params) => {
        io.to(room).emit('chat', params);
      });
    } catch (e) { /* empty */ }
  });
};
