const express = require("express");
const likeController = require("../controllers/likeController");

const router = express.Router();

const { toggleLike, getLikesByEntryId, getUserLikes } = likeController;

console.log("🔹 Перевірка імпорту у likeRoutes.js:");
console.log("toggleLike:", typeof toggleLike);
console.log("getLikesByEntryId:", typeof getLikesByEntryId);
console.log("getUserLikes:", typeof getUserLikes);

if (!toggleLike || !getLikesByEntryId || !getUserLikes) {
    console.error("\x1b[31m[ERROR] Один або більше контролерів undefined!\x1b[0m");
    console.error({ toggleLike, getLikesByEntryId, getUserLikes });
    process.exit(1);
}

// ✅ Додавання або видалення лайка
router.post("/toggle-like", toggleLike);

// ✅ Отримання лайків для блогу
router.get("/likes/:entry_id", getLikesByEntryId);

// ✅ Отримання всіх лайків користувачів
router.get("/user-likes", getUserLikes);

module.exports = router;
