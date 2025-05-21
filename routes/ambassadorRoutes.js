const express = require("express");
const router = express.Router();
const ambassadorController = require("../controllers/ambassadorController");
const authenticateToken = require("../middleware/authMiddleware");

console.log("[DEBUG] Імпортовані функції:", {
  getLoggedAmbassador: ambassadorController.getLoggedAmbassador,
  getAllAmbassadors: ambassadorController.getAllAmbassadors,
  getAmbassadorById: ambassadorController.getAmbassadorById,
  getIdeasForAmbassador: ambassadorController.getIdeasForAmbassador,
  updateIdeaStatus: ambassadorController.updateIdeaStatus,
  authenticateToken
});

// 🔐 Отримання профілю залогіненого амбасадора (авторизація обов'язкова)
router.get("/profile", authenticateToken, async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      console.warn("[ERROR] 🔴 Токен не містить user_id!");
      return res.status(401).json({ message: "Не авторизований" });
    }
    console.log("[DEBUG] Отримання профілю для user_id:", req.user.id);
    await ambassadorController.getLoggedAmbassador(req, res);
  } catch (error) {
    console.error("[ERROR] 🔴 Помилка у getLoggedAmbassador:", error.message);
    next(error);
  }
});

// 📋 Отримання всіх амбасадорів
router.get("/", async (req, res, next) => {
  try {
    console.log("[DEBUG] Отримання списку всіх амбасадорів");
    await ambassadorController.getAllAmbassadors(req, res);
  } catch (error) {
    console.error("[ERROR] 🔴 Помилка у getAllAmbassadors:", error.message);
    next(error);
  }
});

// 🔎 Отримання одного амбасадора за ID
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    console.log("[DEBUG] Запит амбасадора ID:", id);
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Невірний ID амбасадора." });
    }
    await ambassadorController.getAmbassadorById(req, res);
  } catch (error) {
    console.error("[ERROR] 🔴 Помилка у getAmbassadorById:", error.message);
    next(error);
  }
});

// 💡 Отримання ідей, де вибрано амбасадора
router.get("/:id/ideas", async (req, res, next) => {
  const id = req.params.id;
  try {
    console.log("[DEBUG] Отримання ідей для амбасадора ID:", id);
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Невірний ID амбасадора." });
    }
    await ambassadorController.getIdeasForAmbassador(req, res);
  } catch (error) {
    console.error("[ERROR] 🔴 Помилка у getIdeasForAmbassador:", error.message);
    next(error);
  }
});

// ✅ Зміна статусу ідеї амбасадором
router.patch("/update-status", authenticateToken, async (req, res, next) => {
  try {
    await ambassadorController.updateIdeaStatus(req, res);
  } catch (error) {
    console.error("[ERROR] 🔴 Помилка у updateIdeaStatus:", error.message);
    next(error);
  }
});

console.log("[ambassadorRoutes] ✅ Маршрути амбасадорів підключені.");
module.exports = router;
