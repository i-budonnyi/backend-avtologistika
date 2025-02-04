const express = require("express");
const { authenticateUser, getCommentsByEntry, addComment, deleteComment } = require("../controllers/commentController");

const router = express.Router();

// ✅ Отримати всі коментарі для конкретного запису (блогу або ідеї)
router.get("/:entry_id", authenticateUser, getCommentsByEntry);

// ✅ Додати коментар до блогу чи ідеї
router.post("/add", authenticateUser, addComment);

// ✅ Видалити коментар (тільки автор може видаляти свої коментарі)
router.delete("/:id", authenticateUser, deleteComment);

module.exports = router;
