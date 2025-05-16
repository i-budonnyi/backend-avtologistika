const express = require("express");
const router = express.Router();
const problemsController = require("../controllers/problemsController");
const authenticateUser = require("../middleware/authMiddleware"); // ✅ ІМПОРТ ФУНКЦІЇ ЯК ФУНКЦІЇ

router.get("/", authenticateUser, problemsController.getAllProblems);
router.get("/user-problems", authenticateUser, problemsController.getUserProblems);
router.post("/", authenticateUser, problemsController.createProblem);
router.delete("/:id", authenticateUser, problemsController.deleteProblem);
router.get("/ambassadors", authenticateUser, problemsController.getAllAmbassadors);

module.exports = router;
