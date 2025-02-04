const express = require("express");
const router = express.Router();
const { createAmbassador, getAllAmbassadors } = require("../controllers/ambassadorController");

// Роут для створення амбасадора
router.post("/ambassadors", createAmbassador);

// Роут для отримання всіх амбасадорів
router.get("/ambassadors", getAllAmbassadors);

module.exports = router;
