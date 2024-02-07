let socket;
module.exports = function (io) {
  socket = io;
  // socket connection
  io.on("connection", async function (socket) {
    console.log(`⚡: ${socket.id} user just connected`);
    //Whenever someone disconnects this piece of code executed
    socket.on("disconnect", function () {
      console.log("A user disconnected", socket.id);
    });
  });
  return io;
};

module.exports.sendMessage = (key, message) => socket.emit(key, message);
