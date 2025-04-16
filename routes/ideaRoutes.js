const express = require("express");
const router = express.Router();
const ideaController = require("../controllers/ideaController");

console.log("[ideaRoutes] 📌 Ініціалізація маршрутів...");
console.log("[ideaRoutes] 📌 Експортовані функції контролера:", ideaController);

// 🔥 Перевіряємо, чи всі функції є в `ideaController`
const { 
    getAllIdeas, 
    createIdea, 
    updateIdeaStatus, 
    getAllAmbassadors, 
    authenticateUser, 
    getUserIdeas,
    getIdeasByAmbassador // 🔥 Додана функція для отримання ідей, де обрали конкретного амбасадора
} = ideaController;

if (!getAllIdeas || !createIdea || !updateIdeaStatus || !getAllAmbassadors || !authenticateUser || !getUserIdeas || !getIdeasByAmbassador) {
    console.error("[ideaRoutes] ❌ Помилка: Одна або більше функцій не імпортовані!");
    console.error({
        getAllIdeas,
        createIdea,
        updateIdeaStatus,
        getAllAmbassadors,
        authenticateUser,
        getUserIdeas,
        getIdeasByAmbassador
    });
    throw new Error("❌ Маршрути не можуть бути підключені через відсутні функції контролера!");
}

// ✅ Отримання всіх ідей
router.get("/", getAllIdeas);

// ✅ Отримання ідей конкретного користувача (авторизація обов'язкова)
router.get("/user-ideas", authenticateUser, getUserIdeas);

// ✅ Отримання ідей, де певного амбасадора було обрано іншими користувачами
router.get("/selected-ambassador-ideas/:ambassadorId", authenticateUser, getIdeasByAmbassador);

// ✅ Створення ідеї
router.post("/", authenticateUser, createIdea);

// ✅ Оновлення статусу ідеї
router.put("/:id", authenticateUser, updateIdeaStatus);

// ✅ Отримання списку амбасадорів
router.get("/ambassadors", getAllAmbassadors);

console.log("[ideaRoutes] ✅ Маршрути успішно підключені.");
module.exports = router;
