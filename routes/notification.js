const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificationController");

// Отримати всі сповіщення (особисті + глобальні) для користувача
router.get("/:user_id", controller.getForUser);

module.exports = router;
