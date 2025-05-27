const express = require("express");
const router = express.Router();

const {
  addNotification,
  getUserNotifications,
  getNotificationsByUserId,
  updateNotificationStatus,
  markAsRead,
  addCommentToNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController");

const {
  getUserProfile,
  logout
} = require("../controllers/userController");

const authenticate = require("../middleware/verifyAccessToken"); // ✅ Має додавати req.user

// 📌 Переконайся, що у verifyAccessToken є щось на кшталт:
// req.user = decodedToken;

//
// -------------------- ПРОФІЛЬ --------------------
//
router.get("/user/profile", authenticate, getUserProfile);
router.post("/user/logout", authenticate, logout);

//
// ------------------ СПОВІЩЕННЯ ------------------
//
router.post("/", authenticate, addNotification);
router.get("/me", authenticate, getUserNotifications);
router.get("/user/:id", authenticate, getNotificationsByUserId);
router.patch("/:id/status", authenticate, updateNotificationStatus);
router.patch("/:id/read", authenticate, markAsRead);
router.patch("/:id/comment", authenticate, addCommentToNotification);
router.delete("/me", authenticate, deleteAllNotifications);

module.exports = router;
