const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificationController");
const authenticateToken = require("../middleware/authMiddleware");

// 🔒 Отримати всі сповіщення (особисті + глобальні) для користувача
router.get("/:user_id", authenticateToken, controller.getByUser);

module.exports = router;
