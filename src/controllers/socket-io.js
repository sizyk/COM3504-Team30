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
        console.log(room);
      });

      socket.on('chat', (room, params) => {
        console.log(params);
        io.to(room).emit('chat', params);
      });

      socket.on('disconnect', () => {
        console.log('someone disconnected');
      });
    } catch (e) { /* empty */ }
  });
};
