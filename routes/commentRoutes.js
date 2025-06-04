const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  getCommentsByEntry,
  addComment,
  deleteComment
} = require("../controllers/commentController");

// 🔎 Отримати коментарі до одного запису
router.get("/:entry_id", getCommentsByEntry);

// ➕ Додати коментар (авторизація обов’язкова)
router.post("/add", authenticateUser, (req, res, next) => {
  console.log("✅ POST /add викликано, тіло:", req.body);
  next();
}, addComment);

// 🗑 Видалити коментар (авторизація обов’язкова)
router.delete("/:id", authenticateUser, deleteComment);

module.exports = router;
