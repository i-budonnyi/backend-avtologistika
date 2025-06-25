const express = require("express");
const router = express.Router();

const {
  getSubscriptions,
  subscribeToEntry,
  unsubscribeFromEntry
} = require("../controllers/subscriptionController");

// ✅ Перевірка коректності імпорту функцій
const controllers = {
  getSubscriptions,
  subscribeToEntry,
  unsubscribeFromEntry
};

for (const [key, value] of Object.entries(controllers)) {
  if (typeof value !== "function") {
    console.error(`❌ [ERROR] Контролер ${key} не є фуttнкцією (undefined або неправильний експорт).`);
    process.exit(1);
  }
}

console.log("✅ Усі контролери імпортовані успішно:", {
  getSubscriptions: typeof getSubscriptions,
  subscribeToEntry: typeof subscribeToEntry,
  unsubscribeFromEntry: typeof unsubscribeFromEntry
});

// ✅ Маршрути
router.get("/user-subscriptions", getSubscriptions); // Отримати всі підписки користувача
router.post("/subscribe", subscribeToEntry);         // Підписка на запис (блог, ідея, проблема)
router.delete("/unsubscribe", unsubscribeFromEntry); // Відписка від запису

module.exports = router;
