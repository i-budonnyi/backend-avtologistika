// routes/attachmentRoutes.js
const express = require("express");
const router = express.Router();
const attachmentController = require("../controllers/attachmentController");

// Завантаження файлу
router.post("/upload", attachmentController.uploadFile);

module.exports = router;
