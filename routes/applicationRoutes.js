// routes/applicationRoutes.js
const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");

// Створення заявки
router.post("/", applicationController.createApplication);

// Отримання заявок для амбасадора
router.get("/", applicationController.getApplicationsForAmbassador);

// Оновлення заявки
router.put("/:id", applicationController.updateApplication);

module.exports = router;
