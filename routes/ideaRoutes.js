const express = require("express");
const router = express.Router();
const ideaController = require("../controllers/ideaController");

console.log("[ideaRoutes] 📌 Ініціалізація маршрутів...");

const {
  getAllIdeas,
  createIdea,
  updateIdeaStatus,
  getAllAmbassadors,
  getUserIdeas,
  getIdeasByAmbassador,
  getIdeaStatusById // ✅ Додано
} = ideaController;

// 🔹 Отримати всі ідеї (публічно)
router.get("/", getAllIdeas);

// 🔹 Отримати ідеї певного користувача (авторизація)
router.get("/user-ideas", require("../middleware/auth"), getUserIdeas);

// 🔹 Отримати ідеї, де певного амбасадора обрано іншими (публічно)
router.get("/selected-ambassador-ideas/:ambassadorId", getIdeasByAmbassador);

// 🔹 Створити ідею (авторизація)
router.post("/", require("../middleware/auth"), createIdea);

// 🔹 Оновити статус ідеї (авторизація)
router.put("/:id", require("../middleware/auth"), updateIdeaStatus);

// 🔹 Отримати список амбасадорів (публічно)
router.get("/ambassadors", getAllAmbassadors);

// ✅ 🔹 Отримати статус ідеї за ID (публічно)
router.get("/status/:id", getIdeaStatusById);

console.log("[ideaRoutes] ✅ Маршрути підключені успішно.");
module.exports = router;
