const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const juryPanelController = require("../controllers/juryPanelController");

/**
 * 🔹 Цей файл автоматично підключається сервером
 * Сервер сам додає всі маршрути із папки `routes/`
 * Не потрібно вручну підключати його у `server.js`
 */

// ✅ Отримати **поточного залогіненого** члена журі
router.get("/me", authenticate, juryPanelController.getLoggedJuryMember);

// ✅ Отримати всіх членів журі
router.get("/all", authenticate, juryPanelController.getAllJuryMembers);

// ✅ Отримати конкретного члена журі за його `user_id`
router.get("/:user_id", authenticate, (req, res, next) => {
    const { user_id } = req.params;

    // Перевіряємо, чи user_id є числом
    if (isNaN(Number(user_id))) {
        return res.status(400).json({ error: "Некоректний user_id." });
    }

    next(); // Передаємо запит далі в контролер
}, juryPanelController.getJuryMemberById);

console.log("🟢 `juryPanelRoutes.js` успішно підключено сервером!");
module.exports = router;
