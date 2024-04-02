exports.init = (io) => {
  io.sockets.on('connection', (socket) => {
    try {
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
