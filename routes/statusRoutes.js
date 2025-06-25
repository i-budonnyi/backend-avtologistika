const express = require("express");
const router = express.Router();
const { getStatusesByType } = require("../controllers/statusController");

// Отримати всі статуси (або фільтровані за типом: post, idea, problem)
router.get("/get-statuses", getStatusesByType);

module.exports = router;
