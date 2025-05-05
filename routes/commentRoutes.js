const express = require("express");
const router = express.Router();

const {
  getCommentsByEntry,
  addComment,
  deleteComment
} = require("../controllers/commentController");

const authenticateUser = require("../middleware/auth");

// 🔓 Публічний перегляд коментарів
router.get("/:entry_id", getCommentsByEntry);

// 🔒 Додавання — авторизовані
router.post("/add", authenticateUser, addComment);

// 🔒 Видалення — авторизовані
router.delete("/:id", authenticateUser, deleteComment);

module.exports = router;
