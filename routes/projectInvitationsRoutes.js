const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/projectInvitationsController");

// 📥 Надіслати запрошення
router.post("/invite", auth, controller.inviteUser);

// 👥 Отримати всіх користувачів (PM only)
router.get("/users", auth, controller.getAllUsers);

module.exports = router;
