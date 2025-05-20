const express = require("express");
const router = express.Router();
const selfController = require("../controllers/selfController");
const { authenticateUser } = require("../middleware/authenticateToken");

router.get("/profile", authenticateUser, selfController.getOwnProfile);
router.patch("/profile", authenticateUser, selfController.updateOwnProfile);

module.exports = router;
