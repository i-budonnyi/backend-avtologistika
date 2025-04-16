const express = require("express");
const router = express.Router();
const JuryVotingController = require("../controllers/JuryVotingController");
const auth = require("../middleware/auth"); // Підключаємо авторизацію

// ✅ Роут для голосування з перевіркою авторизації
router.post("/vote", auth, JuryVotingController.vote);

console.log("🟢 Маршрут `juryVotingRoutes.js` успішно підключено!");
module.exports = router; // ✅ Ось це важливо!





