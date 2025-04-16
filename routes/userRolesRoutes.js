const express = require("express");
const router = express.Router();
const rolesController = require("../controllers/rolesController");
const ambassadorController = require("../controllers/ambassadorController");
const authenticateToken = require("../middleware/authMiddleware");

console.log("[userRolesRoutes] 📌 Ініціалізація маршрутів...");

router.get("/profile", authenticateToken, async (req, res) => {
    try {
        console.log(`[userRolesRoutes] 🟢 Отримано запит GET /profile від IP: ${req.ip}`);

        if (!req.user || !req.user.userId) {
            console.warn("[userRolesRoutes] ❌ Токен є, але відсутній userId!");
            return res.status(401).json({ message: "ID користувача не знайдено в токені" });
        }

        const userId = req.user.userId;
        console.log(`[userRolesRoutes] 🔎 UserID: ${userId}`);

        // Отримуємо профіль користувача
        const userProfile = await rolesController.getUserRole(userId);
        if (!userProfile) {
            console.warn(`[userRolesRoutes] ❌ Користувача не знайдено в users! ID=${userId}`);
            return res.status(404).json({ message: "Користувач не знайдений" });
        }

        console.log(`[userRolesRoutes] 🔹 Роль користувача: ${userProfile.role}`);

        // Якщо роль - амбасадор, шукаємо в таблиці амбасадорів
        let ambassadorData = {};
        if (userProfile.role === "ambassador") {
            console.log(`[userRolesRoutes] 🔍 Користувач є амбасадором, шукаємо додаткові дані...`);
            ambassadorData = await ambassadorController.getLoggedAmbassador(userId);

            if (!ambassadorData) {
                console.warn(`[userRolesRoutes] ❌ Амбасадора НЕ знайдено в таблиці ambassadors! userID=${userId}`);
                return res.status(404).json({ message: "Амбасадора не знайдено" });
            }
        }

        res.status(200).json({
            firstName: userProfile.first_name || "Невідоме ім'я",
            lastName: userProfile.last_name || "Невідоме прізвище",
            role: userProfile.role || "Користувач",
            email: userProfile.email || "Немає email",
            phone: ambassadorData.phone || "Немає телефону",
            position: ambassadorData.position || "",
            profilePicture: userProfile.profile_picture || ""
        });
    } catch (error) {
        console.error("[userRolesRoutes] ❌ Помилка отримання профілю:", error);
        res.status(500).json({ message: "Помилка отримання профілю", error: error.message });
    }
});

console.log("[userRolesRoutes] ✅ Маршрути userRoles підключені.");
module.exports = router;
