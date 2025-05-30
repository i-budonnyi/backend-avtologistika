const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  getCommentsByEntry,
  addComment,
  deleteComment
} = require("../controllers/commentController");

router.get("/:entry_id", getCommentsByEntry);
router.post("/add", authenticateUser, addComment);
router.delete("/:id", authenticateUser, deleteComment);

module.exports = router;
