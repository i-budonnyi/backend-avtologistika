const clients = new Map();

const addClient = (userId, ws) => {
  clients.set(userId, ws);
};

const removeClient = (userId) => {
  clients.delete(userId);
};

const sendNotification = (userId, message) => {
  const ws = clients.get(userId);
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type: 'notification', message }));
  }
};

module.exports = { clients, addClient, removeClient, sendNotification };
