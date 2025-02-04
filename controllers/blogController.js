const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/database"); // ✅ Підключення до бази

// ✅ Middleware для аутентифікації
const authenticateUser = (req, res, next) => {
    console.log("\n[AUTH] 🔍 Перевірка токена...");
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("[AUTH] ⚠️ Токен відсутній, доступ тільки до публічних даних.");
        req.user = null;
        return next();
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("[AUTH] 🔑 Декодований токен:", decoded);

        // ✅ Використовуємо `decoded.user_id`, якщо він є, або `decoded.id`
        req.user = { user_id: decoded.user_id || decoded.id };

        if (!req.user.user_id) {
            console.error("[AUTH] ❌ Відсутній user_id у токені!");
            return res.status(401).json({ message: "Некоректний токен" });
        }

        console.log(`[AUTH] ✅ Авторизовано користувача ID: ${req.user.user_id}`);
        next();
    } catch (error) {
        console.error("[AUTH] ❌ Невірний або протермінований токен", error.message);
        return res.status(403).json({ message: "Невірний або протермінований токен" });
    }
};

// ✅ Отримати всі блоги та ідеї
const getAllEntries = async (req, res) => {
    try {
        console.log("\n[PROCESS] 📥 Запит отримано: GET /api/blogRoutes/entries");

        const userId = req.user?.user_id || "Гість";
        console.log(`[PROCESS] 👤 Користувач запитує записи. User ID: ${userId}`);

        let userData = null;
        if (req.user) {
            const userQuery = await sequelize.query(
                `SELECT id, first_name, last_name, email FROM users WHERE id = :userId`,
                { replacements: { userId: req.user.user_id }, type: QueryTypes.SELECT }
            );
            userData = userQuery.length ? userQuery[0] : null;
        }

        console.log(`[PROCESS] 🔍 Авторизований користувач: ${userData ? `${userData.first_name} ${userData.last_name} (Email: ${userData.email})` : "Анонім"}`);

        const blogs = await sequelize.query(
            `SELECT b.id, b.title, b.description, b.user_id AS authorId, 
                COALESCE(u.first_name, 'Невідомий') || ' ' || COALESCE(u.last_name, '') AS authorName,
                COALESCE(u.email, 'немає email') AS authorEmail,
                b.created_at AS createdAt
            FROM blog b
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY b.created_at DESC`,
            { type: QueryTypes.SELECT }
        );

        const ideas = await sequelize.query(
            `SELECT i.id, i.title, i.description, i.user_id AS authorId, 
                COALESCE(u.first_name, 'Невідомий') || ' ' || COALESCE(u.last_name, '') AS authorName,
                COALESCE(u.email, 'немає email') AS authorEmail,
                i.created_at AS createdAt
            FROM ideas i
            LEFT JOIN users u ON i.user_id = u.id
            ORDER BY i.created_at DESC`,
            { type: QueryTypes.SELECT }
        );

        if (!blogs.length && !ideas.length) {
            console.warn("[PROCESS] ⚠️ Блоги та ідеї не знайдені!");
            return res.status(404).json({ message: "Записів не знайдено" });
        }

        console.log(`[PROCESS] ✅ Отримано ${blogs.length} блогів та ${ideas.length} ідей.`);

        blogs.forEach(blog => {
            console.log(`[DB] 📝 БЛОГ | ID: ${blog.id} | Автор: "${blog.authorName}" (Email: ${blog.authorEmail}) | Назва: ${blog.title}`);
        });

        ideas.forEach(idea => {
            console.log(`[DB] 💡 ІДЕЯ | ID: ${idea.id} | Автор: "${idea.authorName}" (Email: ${idea.authorEmail}) | Назва: ${idea.title}`);
        });

        res.status(200).json({ blogs, ideas });

    } catch (error) {
        console.error("[ERROR] ❌ Помилка отримання записів:", error);
        res.status(500).json({ message: "Помилка отримання записів", error: error.message });
    }
};

// ✅ Створити новий запис (блог або ідею)
const createBlogEntry = async (req, res) => {
    try {
        console.log("[PROCESS] 📥 Запит отримано: POST /api/blogRoutes/create");

        const { title, description, type } = req.body;
        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(403).json({ message: "❌ Ви не авторизовані!" });
        }

        console.log(`[PROCESS] ✍️ Створення запису... User ID: ${userId}, Type: ${type}`);

        if (!title || !description || !type) {
            return res.status(400).json({ message: "❌ Всі поля обов'язкові." });
        }

        const tableName = type === "blog" ? "blog" : "ideas";
        const [newEntry] = await sequelize.query(
            `INSERT INTO ${tableName} (title, description, user_id, created_at) 
             VALUES (:title, :description, :userId, NOW()) RETURNING id;`,
            { replacements: { title, description, userId }, type: QueryTypes.INSERT }
        );

        console.log(`[PROCESS] ✅ Запис створено з ID: ${newEntry[0].id}`);
        res.status(201).json({ message: "Запис створено успішно.", id: newEntry[0].id });

    } catch (error) {
        console.error("[ERROR] ❌ Помилка створення запису:", error);
        res.status(500).json({ message: "Помилка створення запису", error: error.message });
    }
};

// ✅ Видалити запис
const deleteBlogEntry = async (req, res) => {
    try {
        console.log("[PROCESS] 🗑 Видалення запису...");

        const { entryId } = req.params;
        const userId = req.user?.user_id;

        if (!entryId) {
            return res.status(400).json({ message: "❌ ID запису обов'язковий." });
        }

        const result = await sequelize.query(
            `DELETE FROM blog WHERE id = :entryId AND user_id = :userId RETURNING id;
             DELETE FROM ideas WHERE id = :entryId AND user_id = :userId RETURNING id;`,
            { replacements: { entryId, userId }, type: QueryTypes.DELETE }
        );

        if (!result) {
            return res.status(404).json({ message: "❌ Запис не знайдено або у вас немає прав на видалення." });
        }

        console.log(`[PROCESS] ✅ Видалено запис ID: ${entryId}`);
        res.status(200).json({ message: "Запис видалено успішно." });

    } catch (error) {
        console.error("[ERROR] ❌ Помилка видалення запису:", error);
        res.status(500).json({ message: "Помилка видалення запису", error: error.message });
    }
};

// ✅ Експорт контролерів
module.exports = {
    authenticateUser,
    getAllEntries,
    createBlogEntry,
    deleteBlogEntry
};
