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
      console.log(`🔔 Користувач зареєструвався на WebSocket: userId=${userId}, socket=${socket.id}`);
      socket.join(`notification_${userId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔴 Socket disconnected: ${socket.id}, причина: ${reason}`);
    });

    socket.on("error", (err) => {
      console.error(`❌ Socket error on ${socket.id}:`, err.message);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("❌ Socket.io не ініціалізовано!");
  }
  return io;
}

function sendNotification(userId, message) {
  try {
    const room = `notification_${userId}`;
    console.log(`📤 Відправляємо сповіщення в кімнату: ${room}`);
    getIO().to(room).emit("notification", {
      message,
      is_read: false,
      timestamp: new Date().toISOString(),
    });
    console.log("✅ Сповіщення надіслано:", message);
  } catch (err) {
    console.error("❌ [sendNotification] Помилка:", err.message);
  }
}

module.exports = { initIO, getIO, sendNotification };
