let io = null;

function initIO(server) {
  if (io) {
    console.warn("⚠️ Socket.io вже ініціалізовано.");
    return io;
  }

  io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("register", (userId) => {
      if (userId) {
        console.log(`🔔 Користувач зареєструвався: userId=${userId}, socket=${socket.id}`);
        socket.join(`notification_${userId}`);
      } else {
        console.warn("⚠️ Не передано userId для register");
      }
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
    console.error("❌ Socket.io не ініціалізовано! Повертаємо null.");
    return null; // Замість throw — безпечніше
  }
  return io;
}

function sendNotification(userId, message) {
  try {
    const socket = getIO();
    if (!socket) return;

    const room = `notification_${userId}`;
    console.log(`📤 Відправляємо сповіщення в кімнату: ${room}`);

    socket.to(room).emit("notification", {
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
