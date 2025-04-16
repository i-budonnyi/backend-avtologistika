const express = require("express");
const router = express.Router();
const problemsController = require("../controllers/problemsController");

// Middleware для перевірки авторизації
const { authenticateUser } = problemsController;

// ✅ Отримати всі проблеми
router.get("/", authenticateUser, problemsController.getAllProblems);

// ✅ Отримати проблеми конкретного користувача
router.get("/user-problems", authenticateUser, problemsController.getUserProblems);

// ✅ Створити нову проблему
router.post("/", authenticateUser, problemsController.createProblem);

// ✅ Видалити проблему
router.delete("/:id", authenticateUser, problemsController.deleteProblem);

// ✅ Отримати всіх амбасадорів
router.get("/ambassadors", authenticateUser, problemsController.getAllAmbassadors);

module.exports = router;
