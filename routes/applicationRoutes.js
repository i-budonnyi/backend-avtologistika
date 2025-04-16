const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware"); // якщо потрібна авторизація

// ✅ Створення нової заявки (змінив "/submit" на "/")
router.post("/", authMiddleware, applicationController.createApplication);

// ✅ Отримання всіх заявок
router.get("/", authMiddleware, applicationController.getAllApplications);

// ✅ Отримання конкретної заявки за ID
router.get("/:id", authMiddleware, applicationController.getApplicationById);

// ✅ Оновлення заявки
router.put("/:id", authMiddleware, applicationController.updateApplication);

// ✅ Оновлення заявки з рішенням журі
router.put("/:id/jury", authMiddleware, applicationController.updateApplicationByJury);

// ✅ Видалення заявки
router.delete("/:id", authMiddleware, applicationController.deleteApplication);

module.exports = router;
