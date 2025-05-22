const { QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

// 🧼 Легке очищення повідомлень — без пошкодження корисного тексту
const sanitizeText = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .normalize("NFKC")
    .replace(/[\u{1F600}-\u{1F6FF}]/gu, "") // emoji
    .replace(/[\p{C}]/gu, "")               // control characters
    .replace(/\s+/g, " ")                   // зайві пробіли
    .trim();
};

// 🔔 Одне сповіщення
const createNotification = async (user_id, message) => {
  if (!user_id || !message || typeof message !== "string") return;
  try {
    const cleaned = sanitizeText(message);
    await sequelize.query(
      `INSERT INTO notifications (user_id, message, is_read) VALUES (:user_id, :message, false)`,
      {
        replacements: { user_id, message: cleaned },
        type: QueryTypes.INSERT,
      }
    );
  } catch (error) {
    console.error("❌ [createNotification] Помилка:", error.message);
  }
};

// 🔔 Масове створення
const createNotificationsBulk = async (userIds = [], message) => {
  if (!Array.isArray(userIds) || userIds.length === 0 || typeof message !== "string") return;
  try {
    const cleaned = sanitizeText(message);
    const values = userIds.map((_, i) => `(:user_id${i}, :message${i}, false)`).join(", ");
    const replacements = {};
    userIds.forEach((id, i) => {
      replacements[`user_id${i}`] = id;
      replacements[`message${i}`] = cleaned;
    });

    await sequelize.query(
      `INSERT INTO notifications (user_id, message, is_read) VALUES ${values}`,
      {
        replacements,
        type: QueryTypes.INSERT,
      }
    );
  } catch (error) {
    console.error("❌ [createNotificationsBulk] Помилка:", error.message);
  }
};

// 🧠 Події
const notify = async (eventName, payload = {}) => {
  try {
    switch (eventName) {
      case "idea_created":
        await createNotification(
          payload.ambassadorId,
          `${payload.userName} подав ідею з вашим амбасадорством`
        );
        break;

      case "idea_voted":
        await createNotificationsBulk(
          payload.subscriberIds,
          `Новий голос за ідею: "${payload.ideaTitle}"`
        );
        break;

      case "problem_submitted":
        await createNotification(
          payload.adminId,
          `Додано нову проблему: "${payload.problemTitle}"`
        );
        break;

      case "comment_added":
        await createNotification(
          payload.authorId,
          `Коментар до вашої ідеї: "${payload.ideaTitle}"`
        );
        break;

      case "idea_on_agenda":
        await createNotification(
          payload.authorId,
          `Вашу ідею "${payload.ideaTitle}" додано до порядку денного`
        );
        break;

      case "jury_vote":
        await createNotification(
          payload.authorId,
          `Член журі проголосував за вашу ідею "${payload.ideaTitle}"`
        );
        break;

      default:
        console.warn(`⚠️ Подія "${eventName}" не підтримується`);
    }
  } catch (err) {
    console.error("❌ [notify] Помилка:", err.message);
  }
};

module.exports = {
  createNotification,
  createNotificationsBulk,
  notify,
};
