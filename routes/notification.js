const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.post("/", notificationController.addNotification);
router.get("/:userId", notificationController.getUserNotifications); // 👈 тут явно :userId
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/:userId", notificationController.deleteAllNotifications);

module.exports = router;
