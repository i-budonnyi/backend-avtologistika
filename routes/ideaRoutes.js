const express = require("express");
const router = express.Router();
const ideaController = require("../controllers/ideaController");
const authenticate = require("../middleware/auth"); // ✅ middleware

console.log("[ideaRoutes] 📌 Ініціалізація маршрутів...");

const {
  getAllIdeas,
  createIdea,
  updateIdeaStatus,
  getAllAmbassadors,
  getUserIdeas,
  getIdeasByAmbassador
} = ideaController;

// 🔹 Отримати всі ідеї (публічно)
router.get("/", getAllIdeas);

// 🔹 Отримати ідеї певного користувача (авторизація)
router.get("/user-ideas", authenticate, getUserIdeas);

// 🔹 Отримати ідеї, де певного амбасадора обрано іншими (публічно)
router.get("/selected-ambassador-ideas/:ambassadorId", getIdeasByAmbassador);

// 🔹 Створити ідею (авторизація)
router.post("/", authenticate, createIdea);

// 🔹 Оновити статус ідеї (авторизація)
router.put("/:id", authenticate, updateIdeaStatus);

// 🔹 Отримати список амбасадорів (публічно)
router.get("/ambassadors", getAllAmbassadors);

console.log("[ideaRoutes] ✅ Маршрути підключені успішно.");
module.exports = router;
