const express = require("express");
const router = express.Router();
const { 
    getAllIdeas, 
    createIdea, 
    updateIdeaStatus, 
    getAllAmbassadors, 
    authenticateUser, 
    getUserIdeas 
} = require("../controllers/ideaController");

// ✅ Всі ідеї
router.get("/", getAllIdeas);

// ✅ Отримати ідеї конкретного користувача
router.get("/user-ideas", authenticateUser, getUserIdeas);

// ✅ Створення ідеї (з захистом авторизації)
router.post("/", authenticateUser, createIdea);

// ✅ Оновлення статусу ідеї
router.put("/:id", authenticateUser, updateIdeaStatus);

// ✅ Отримання списку амбасадорів
router.get("/ambassadors", getAllAmbassadors);

module.exports = router;
