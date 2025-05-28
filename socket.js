let io;

function initIO(server) {
  io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("register", (userId) => {
      console.log(`🔔 Користувач зареєструвався: ${userId}`);
      socket.join(`notification_${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io не ініціалізовано");
  }
  return io;
}

function sendNotification(userId, message) {
  getIO().to(`notification_${userId}`).emit("notification", {
    message,
    is_read: false,
  });
}

module.exports = { initIO, getIO, sendNotification };
