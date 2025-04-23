const express = require("express");
const router = express.Router();
const {
  toggleLike,
  getLikesByEntryId,
  getUserLikes
} = require("../controllers/likeController");

router.post("/toggle-like", toggleLike);
router.get("/likes/:entry_id", getLikesByEntryId);
router.get("/user-likes", getUserLikes);

module.exports = router;
