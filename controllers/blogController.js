const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/database");
const { io } = require("../index"); // 📡 WebSocket-підключення
const { sendNotification } = require("../index"); // 🔔 Підключаємо функцію для персональних сповіщень

// ✅ Middleware для обов'язкової авторизації
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Потрібна авторизація" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { user_id: decoded.user_id || decoded.id };
    if (!req.user.user_id) {
      return res.status(401).json({ message: "Некоректний токен" });
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Невірний або протермінований токен" });
  }
};

// ✅ Отримати всі блоги та ідеї
const getAllEntries = async (req, res) => {
  try {
    const blogs = await sequelize.query(
      `SELECT b.id, b.title, b.description, b.user_id AS authorId,
              COALESCE(u.first_name, 'Невідомий') AS author_first_name,
              COALESCE(u.last_name, '') AS author_last_name,
              u.email AS author_email,
              b.created_at AS createdAt
       FROM blog b
       LEFT JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`,
      { type: QueryTypes.SELECT }
    );

    const ideas = await sequelize.query(
      `SELECT i.id, i.title, i.description, i.user_id AS authorId,
              COALESCE(u.first_name, 'Невідомий') AS author_first_name,
              COALESCE(u.last_name, '') AS author_last_name,
              u.email AS author_email,
              i.created_at AS createdAt
       FROM ideas i
       LEFT JOIN users u ON i.user_id = u.id
       ORDER BY i.created_at DESC`,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json({ blogs, ideas });
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання записів", error: error.message });
  }
};

// ✅ Створити блог або ідею
const createBlogEntry = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const userId = req.user.user_id;

    if (!title || !description || !type) {
      return res.status(400).json({ message: "Всі поля обов'язкові" });
    }

    const table = type === "blog" ? "blog" : "ideas";

    const [result] = await sequelize.query(
      `INSERT INTO ${table} (title, description, user_id, created_at)
       VALUES (:title, :description, :userId, NOW()) RETURNING id`,
      {
        replacements: { title, description, userId },
        type: QueryTypes.INSERT,
      }
    );

    // 📡 WebSocket — широкомовне повідомлення
    io.emit("entry_created", {
      id: result[0].id,
      title,
      description,
      type,
      user_id: userId,
    });

    // 🔔 Персональне сповіщення
    sendNotification(userId, `✅ ${type === "blog" ? "Блог" : "Ідея"} успішно створено: "${title}"`);

    res.status(201).json({ message: "Запис створено", id: result[0].id });
  } catch (error) {
    res.status(500).json({ message: "Помилка створення запису", error: error.message });
  }
};

// ✅ Видалити блог або ідею
const deleteBlogEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.user_id;

    const [deletedBlog] = await sequelize.query(
      `DELETE FROM blog WHERE id = :entryId AND user_id = :userId RETURNING id`,
      { replacements: { entryId, userId }, type: QueryTypes.DELETE }
    );

    if (deletedBlog.length) {
      return res.status(200).json({ message: "Блог видалено" });
    }

    const [deletedIdea] = await sequelize.query(
      `DELETE FROM ideas WHERE id = :entryId AND user_id = :userId RETURNING id`,
      { replacements: { entryId, userId }, type: QueryTypes.DELETE }
    );

    if (deletedIdea.length) {
      return res.status(200).json({ message: "Ідею видалено" });
    }

    res.status(404).json({ message: "Запис не знайдено або немає прав" });
  } catch (error) {
    res.status(500).json({ message: "Помилка видалення", error: error.message });
  }
};

// ✅ Додати коментар з іменем
const addComment = async (req, res) => {
  const { entry_id, entry_type, comment } = req.body;
  const user_id = req.user?.user_id;

  if (!entry_id || !entry_type || !comment || !user_id) {
    return res.status(400).json({
      error: "Всі поля обов'язкові (entry_id, entry_type, comment, user_id).",
    });
  }

  const column =
    entry_type === "blog"
      ? "blog_id"
      : entry_type === "idea"
      ? "idea_id"
      : entry_type === "problem"
      ? "problem_id"
      : null;

  if (!column) {
    return res.status(400).json({ error: "Невідомий тип запису." });
  }

  try {
    await sequelize.query(
      `INSERT INTO comments (${column}, user_id, comment, created_at, updated_at)
       VALUES (:entry_id, :user_id, :comment, NOW(), NOW())`,
      {
        replacements: { entry_id, user_id, comment },
        type: QueryTypes.INSERT,
      }
    );

    console.log(`[addComment] ✅ Коментар додано`);

    // 📡 WebSocket: широкомовно всім
    io.emit("new_comment", {
      entry_id,
      entry_type,
      comment,
      user_id,
    });

    res.status(201).json({ message: "Коментар успішно додано." });
  } catch (err) {
    console.error("[addComment] ❌", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  authenticateUser,
  getAllEntries,
  createBlogEntry,
  deleteBlogEntry,
  addComment,
};
