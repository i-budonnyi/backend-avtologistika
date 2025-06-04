const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// 📁 Очікуваний шлях до blogController
const controllerPath = path.join(__dirname, "../controllers/blogController");

// ❗ Перевіряємо існування контролера
if (!fs.existsSync(controllerPath + ".js")) {
  console.error("\n❌ [ERROR] Файл blogController.js не знайдено!");
  console.error(`   📂 Очікуваний шлях: ${controllerPath}.js`);
  process.exit(1);
}

// ✅ Імпортуємо контролер
const blogController = require(controllerPath);

// 🧩 Витягуємо функції
const {
  authenticateUser,
  getAllEntries,
  createBlogEntry,
  deleteBlogEntry
} = blogController;

// ❌ Якщо якась функція відсутня — лог + вихід
if (
  typeof authenticateUser !== "function" ||
  typeof getAllEntries !== "function" ||
  typeof createBlogEntry !== "function" ||
  typeof deleteBlogEntry !== "function"
) {
  console.error("\n❌ [ERROR] Неможливо підключити маршрут blogRoutes.js:");
  console.error("   Один або більше контролерів `undefined`!");
  console.error(`   📂 Шлях до контролера: ${controllerPath}.js`);
  process.exit(1);
}

// ✅ Маршрути
router.get("/entries", authenticateUser, getAllEntries);
router.post("/create", authenticateUser, createBlogEntry);
router.delete("/delete/:entryId", authenticateUser, deleteBlogEntry);

console.log("✅ [ROUTES] blogRoutes.js підключено успішно");

module.exports = router;
