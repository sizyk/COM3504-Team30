const ChatModel = require('../models/chat');

exports.init = function (io) {
  io.sockets.on('connection', (socket) => {
    try {
      /**
       * create or joins a room
       */
      socket.on('create or join', async (room) => {
        // const messages = await ChatModel.find({ plant: room });
        socket.join(room);
        // io.to(room).emit('oldMessages', messages);
        // console.log(messages);
      });

      socket.on('oldMessages', async (room) => {
        const messages = await ChatModel.find({ plant: room });
        io.to(room).emit('oldMessages', messages);
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
