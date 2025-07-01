// routes/notificationRoutes.js
const express             = require("express");
const router              = express.Router();
const controller          = require("../controllers/notificationController");
const authenticateToken   = require("../middleware/authMiddleware");

/* ────────────────────────────────────────── */
/* 🔒 Отримати особисті + глобальні сповіщення */
/*    GET /api/notifications/:user_id         */
/* ────────────────────────────────────────── */
router.get("/:user_id", authenticateToken, controller.getByUser);

module.exports = router;
