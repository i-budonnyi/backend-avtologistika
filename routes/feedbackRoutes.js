const express = require("express");
const router = express.Router();
const { addFeedbackMessage, getFeedbackMessages, selectIdeaForApplication } = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware"); // Якщо потрібно перевіряти авторизацію

// ✅ Додати новий коментар
router.post("/add", authMiddleware, addFeedbackMessage);

// ✅ Отримати всі коментарі до ідеї
router.get("/list", authMiddleware, getFeedbackMessages);

// ✅ Вибір ідеї для створення заявки
router.post("/select-idea", authMiddleware, selectIdeaForApplication);

module.exports = router;
