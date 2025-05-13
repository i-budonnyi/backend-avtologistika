const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.post("/", notificationController.addNotification);
router.get("/", notificationController.getUserNotifications); // ✅ userId буде в query: ?userId=50
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/", notificationController.deleteAllNotifications); // ✅ теж через query: ?userId=50

module.exports = router;
