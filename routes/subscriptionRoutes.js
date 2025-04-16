const express = require("express");
const router = express.Router();
const {
    getSubscriptions,
    subscribeToEntry,
    unsubscribeFromEntry
} = require("../controllers/subscriptionController");

// 🔥 Перевірка імпорту контролерів
console.log("🔹 Перевірка імпорту subscriptionController:", {
    getSubscriptions: typeof getSubscriptions,
    subscribeToEntry: typeof subscribeToEntry,
    unsubscribeFromEntry: typeof unsubscribeFromEntry,
});

// 🔥 Якщо якась функція undefined — вивести помилку
if (
    typeof getSubscriptions !== "function" ||
    typeof subscribeToEntry !== "function" ||
    typeof unsubscribeFromEntry !== "function"
) {
    console.error("❌ [ERROR] Неможливо підключити маршрут subscriptionRoutes.js: Один або більше контролерів undefined!");
    process.exit(1);
}

// 🔥 Маршрути
router.get("/user-subscriptions", getSubscriptions); // ✅ Отримати всі підписки користувача
router.post("/subscribe", subscribeToEntry); // ✅ Підписка на запис (блог, ідея, проблема)
router.delete("/unsubscribe", unsubscribeFromEntry); // ✅ Відписка від запису

module.exports = router;
