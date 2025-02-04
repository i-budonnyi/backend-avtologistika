const express = require("express");
const router = express.Router();
const {
    getSubscribers,
    getSubscriptions,
    subscribeToEntry,
    unsubscribeFromEntry
} = require("../controllers/subscriptionController"); // Переконайся, що шлях правильний

console.log("🔹 Перевірка імпорту subscriptionController:", {
    getSubscribers: typeof getSubscribers,
    getSubscriptions: typeof getSubscriptions,
    subscribeToEntry: typeof subscribeToEntry,
    unsubscribeFromEntry: typeof unsubscribeFromEntry,
});

// 🔥 Якщо якась функція undefined — вивести помилку
if (
    typeof getSubscribers !== "function" ||
    typeof getSubscriptions !== "function" ||
    typeof subscribeToEntry !== "function" ||
    typeof unsubscribeFromEntry !== "function"
) {
    console.error("❌ [ERROR] Неможливо підключити маршрут subscriptionRoutes.js: Один або більше контролерів undefined!");
    process.exit(1);
}

// 🔥 Маршрути
router.get("/subscribers/:entryId", getSubscribers);
router.get("/subscriptions/:userId", getSubscriptions);
router.post("/subscribe", subscribeToEntry);
router.delete("/unsubscribe", unsubscribeFromEntry);

module.exports = router;
