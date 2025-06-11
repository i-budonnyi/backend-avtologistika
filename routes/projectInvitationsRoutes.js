const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/projectInvitationsController");

// 📥 Надіслати запрошення
router.post("/invite", auth, controller.inviteUser);

// ❌ Скасувати запрошення
router.post("/cancel", auth, controller.cancelInvitation);

// 🕵️‍♂️ Переглянути історію запрошень для певного проєкту
router.get("/history", auth, controller.getInvitationHistory);

// 👥 Отримати всіх користувачів (PM only)
router.get("/users", auth, controller.getAllUsers);

module.exports = router;
