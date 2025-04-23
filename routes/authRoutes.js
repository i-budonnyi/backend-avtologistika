const express = require("express");
const { register, login, notFound } = require("../controllers/authController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ✅ Публічні маршрути
router.post("/register", register);
router.post("/login", login);

// ✅ Приклад захищеного маршруту
router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Ти увійшов", user: req.user });
});

// ❌ Обробка неіснуючих маршрутів
router.all("*", notFound);

module.exports = router;
