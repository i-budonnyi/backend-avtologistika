const express = require("express");
const router = express.Router();

const {
  getCommentsByEntry,
  addComment,
  deleteComment,
} = require("../controllers/commentController");

const { authenticateUser } = require("../middleware/auth");

// 🔹 Публічно: Отримати всі коментарі для запису (ідея, блог, проблема)
router.get("/:entry_id", getCommentsByEntry);

// 🔒 Авторизовано: Додати коментар
router.post("/add", authenticateUser, addComment);

// 🔒 Авторизовано: Видалити коментар
router.delete("/:id", authenticateUser, deleteComment);

module.exports = router;
