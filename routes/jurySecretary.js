const express = require("express");
const router = express.Router();
const { getAllSecretaries } = require("../controllers/jurySecretaryController"); // Переконайся, що шлях правильний

// 📌 Отримати всіх секретарів
router.get("/jury-secretaries", getAllSecretaries);

module.exports = router;