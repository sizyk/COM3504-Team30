const ChatModel = require('../models/chat');

exports.init = function (io) {
  io.sockets.on('connection', (socket) => {
    try {
      /**
       * create or joins a room
       */
      socket.on('create or join', async (room) => {
        const messages = await ChatModel.find({ plant: room });
        socket.emit('oldMessages', messages);
        socket.join(room);
      });

      socket.on('chat', async (room, userId, chatText) => {
        try {
          const newChat = new ChatModel({
            user: userId,
            plant: room,
            message: chatText,
            dateTime: Date.now(),
          });
          console.log(JSON.stringify(newChat));
          await newChat.save();
          io.sockets.to(room).emit('chat', room, userId, chatText);
        } catch (error) {
          console.error('Error saving message:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('someone disconnected');
      });
    } catch (e) { /* empty */ }
  });
};
