const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const { getIO } = require("../socket");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// 🔐 Middleware авторизації
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Токен відсутній або некоректний." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded.user_id;
    if (!userId) throw new Error("ID користувача не знайдено в токені");

    req.user = { id: userId };
    next();
  } catch (err) {
    console.error("[AUTH] ❌", err.message);
    return res.status(403).json({ message: "Невірний або протермінований токен" });
  }
};

// 📥 Отримати всі коментарі для запису
const getCommentsByEntry = async (req, res) => {
  const { entry_id } = req.params;
  if (!entry_id) return res.status(400).json({ error: "Не вказано entry_id." });

  try {
    const comments = await sequelize.query(
      `SELECT 
        c.id, 
        c.text,
        c.created_at AS "createdAt",
        u.id AS user_id,
        u.first_name AS author_first_name,
        u.last_name AS author_last_name,
        u.email AS author_email,
        CASE 
          WHEN b.id IS NOT NULL THEN 'blog'
          WHEN i.id IS NOT NULL THEN 'idea'
          WHEN p.id IS NOT NULL THEN 'problem'
          ELSE 'unknown'
        END AS entry_type
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN blog b ON c.post_id = b.id
      LEFT JOIN ideas i ON c.post_id = i.id
      LEFT JOIN problems p ON c.post_id = p.id
      WHERE c.post_id = :entry_id
      ORDER BY c.created_at DESC`,
      { replacements: { entry_id }, type: QueryTypes.SELECT }
    );

    res.status(200).json({ comments });
  } catch (err) {
    console.error("[getCommentsByEntry] ❌", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ➕ Додати коментар
const addComment = async (req, res) => {
  console.log("🟡 [addComment] Вхідний запит:");
  console.log("➡️ req.body:", req.body);
  console.log("➡️ req.user:", req.user);

  const { entry_id, entry_type, comment } = req.body;
  const user_id = req.user?.id;

  if (!entry_id || !entry_type || !comment || !user_id) {
    console.warn("⚠️ Недостатньо полів:", { entry_id, entry_type, comment, user_id });
    return res.status(400).json({
      error: "Всі поля обов'язкові (entry_id, entry_type, comment, user_id).",
    });
  }

  const tableMap = {
    blog: "blog",
    idea: "ideas",
    problem: "problems"
  };

  const targetTable = tableMap[entry_type.toLowerCase()];
  if (!targetTable) {
    console.warn("⚠️ Невідомий тип запису:", entry_type);
    return res.status(400).json({ error: "Невідомий тип запису." });
  }

  try {
    console.log("🔎 Перевірка наявності запису у таблиці:", targetTable);
    const [check] = await sequelize.query(
      `SELECT id FROM ${targetTable} WHERE id = :entry_id`,
      { replacements: { entry_id }, type: QueryTypes.SELECT }
    );

    if (!check) {
      console.warn(`❌ Запис не знайдено: ${entry_type} → ID ${entry_id}`);
      return res.status(404).json({ error: `Запис ${entry_type} з ID ${entry_id} не знайдено.` });
    }

    console.log("✅ Запис знайдено. Додаємо коментар...");
    const [[inserted]] = await sequelize.query(
      `INSERT INTO comments (post_id, user_id, text, created_at, updated_at)
       VALUES (:entry_id, :user_id, :comment, NOW(), NOW())
       RETURNING id, text, created_at`,
      {
        replacements: { entry_id, user_id, comment },
        type: QueryTypes.INSERT,
      }
    );

    console.log("✅ Коментар збережено:", inserted);

    const [author] = await sequelize.query(
      `SELECT first_name, last_name, email FROM users WHERE id = :user_id`,
      { replacements: { user_id }, type: QueryTypes.SELECT }
    );

    console.log("👤 Автор коментаря:", author);

    const fullComment = {
      id: inserted.id,
      comment: inserted.text,
      createdAt: inserted.created_at,
      user_id,
      author_first_name: author?.first_name || "Анонім",
      author_last_name: author?.last_name || "",
      author_email: author?.email || "",
    };

    console.log("📢 Надсилаємо коментар через WebSocket...");
    getIO().emit("new_comment", {
      entry_id,
      comment: fullComment
    });

    console.log("✅ Коментар успішно повертається у відповідь.");
    res.status(201).json({ comment: fullComment });
  } catch (err) {
    console.error("🔥 [addComment] Виникла помилка:");
    console.error(err.stack || err.message || err);
    res.status(500).json({ error: "Помилка при додаванні коментаря: " + err.message });
  }
};

// 🗑 Видалити коментар
const deleteComment = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user?.id;

  if (!id || !user_id) {
    return res.status(400).json({ error: "ID коментаря або авторизація відсутні." });
  }

  try {
    const [comment] = await sequelize.query(
      `SELECT id, user_id FROM comments WHERE id = :comment_id`,
      { replacements: { comment_id: id }, type: QueryTypes.SELECT }
    );

    if (!comment) return res.status(404).json({ error: "Коментар не знайдено." });
    if (comment.user_id !== user_id)
      return res.status(403).json({ error: "Це не ваш коментар." });

    await sequelize.query(
      `DELETE FROM comments WHERE id = :comment_id`,
      { replacements: { comment_id: id }, type: QueryTypes.DELETE }
    );

    res.status(200).json({ message: "Коментар видалено." });
  } catch (err) {
    console.error("[deleteComment] ❌", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  authenticateUser,
  getCommentsByEntry,
  addComment,
  deleteComment,
};
