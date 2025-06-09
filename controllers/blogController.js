const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/database");
const { getIO, sendNotification } = require("../socket");

// 🔐 Авторизація
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Потрібна авторизація" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id || decoded.id;
    if (!user_id) {
      return res.status(401).json({ message: "Некоректний токен" });
    }
    req.user = { user_id };
    next();
  } catch (error) {
    return res.status(403).json({ message: "Невірний або протермінований токен" });
  }
};

// 📅 Отримати всі записи (blog, idea)
const getAllEntries = async (req, res) => {
  try {
    const blogs = await sequelize.query(`SELECT b.id, b.title, b.description, b.user_id AS authorId,
      COALESCE(u.first_name, 'Невідомий') AS author_first_name,
      COALESCE(u.last_name, '') AS author_last_name,
      u.email AS author_email,
      b.created_at AS createdAt
      FROM blog b
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC`,
      { type: QueryTypes.SELECT });

    const ideas = await sequelize.query(`SELECT i.id, i.title, i.description, i.user_id AS authorId,
      COALESCE(u.first_name, 'Невідомий') AS author_first_name,
      COALESCE(u.last_name, '') AS author_last_name,
      u.email AS author_email,
      i.created_at AS createdAt
      FROM ideas i
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC`,
      { type: QueryTypes.SELECT });

    res.status(200).json({ blogs, ideas });
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання записів", error: error.message });
  }
};

// ➕ Створити запис
const createBlogEntry = async (req, res) => {
  const { title, description, type } = req.body;
  const userId = req.user.user_id;

  if (!title || !description || !type) {
    return res.status(400).json({ message: "Всі поля обов'язкові" });
  }

  const table = type === "blog" ? "blog" : "ideas";

  try {
    const [result] = await sequelize.query(
      `INSERT INTO ${table} (title, description, user_id, created_at)
       VALUES (:title, :description, :userId, NOW()) RETURNING id`,
      {
        replacements: { title, description, userId },
        type: QueryTypes.INSERT,
      }
    );

    getIO().emit("entry_created", {
      id: result[0].id,
      title,
      description,
      type,
      user_id: userId,
    });

    sendNotification(userId, `✅ ${type === "blog" ? "Блог" : "Ідея"} створено: "${title}"`);

    res.status(201).json({ message: "Запис створено", id: result[0].id });
  } catch (error) {
    res.status(500).json({ message: "Помилка створення запису", error: error.message });
  }
};

// ❌ Видалити запис
const deleteBlogEntry = async (req, res) => {
  const { entryId } = req.params;
  const userId = req.user.user_id;

  try {
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

// 💬 Додати коментар
// 💬 Додати коментар
const addComment = async (req, res) => {
  const { entry_id, entry_type, comment } = req.body;
  const user_id = req.user?.user_id;

  if (!entry_id || !entry_type || !comment || !user_id) {
    return res.status(400).json({ error: "Всі поля обов'язкові." });
  }

  const tableMap = {
    blog: "blog",
    idea: "ideas",
    problem: "problems"
  };

  const targetTable = tableMap[entry_type.toLowerCase()];
  if (!targetTable) {
    return res.status(400).json({ error: "Невідомий тип запису." });
  }

  try {
    // Перевірка чи існує запис
    const [check] = await sequelize.query(
      `SELECT id FROM ${targetTable} WHERE id = :entry_id`,
      { replacements: { entry_id }, type: QueryTypes.SELECT }
    );

    if (!check) {
      return res.status(404).json({ error: `Запис ${entry_type} з ID ${entry_id} не знайдено.` });
    }

    // Додати коментар
    await sequelize.query(
      `INSERT INTO comments (post_id, user_id, text, created_at, updated_at)
       VALUES (:entry_id, :user_id, :comment, NOW(), NOW())`,
      {
        replacements: { entry_id, user_id, comment },
        type: QueryTypes.INSERT,
      }
    );

    // Отримати останній коментар
    const [newComment] = await sequelize.query(
      `SELECT id, text AS comment, created_at AS "createdAt"
       FROM comments
       WHERE post_id = :entry_id AND user_id = :user_id
       ORDER BY created_at DESC
       LIMIT 1`,
      {
        replacements: { entry_id, user_id },
        type: QueryTypes.SELECT,
      }
    );

    // Отримати дані автора
    const [userInfo] = await sequelize.query(
      `SELECT first_name, last_name, email FROM users WHERE id = :user_id`,
      {
        replacements: { user_id },
        type: QueryTypes.SELECT,
      }
    );

    const fullComment = {
      id: newComment.id,
      comment: newComment.comment,
      createdAt: newComment.createdAt,
      author_first_name: userInfo?.first_name || "",
      author_last_name: userInfo?.last_name || "",
      author_email: userInfo?.email || "",
      user_id,
    };

    getIO().emit("new_comment", {
      entry_id,
      comment: fullComment,
    });

    res.status(201).json({ comment: fullComment });
  } catch (error) {
    console.error("[addComment] ❌", error.stack || error.message);
    res.status(500).json({ error: error.message });
  }
};



// 📅 Отримати коментарі до запису
const getCommentsByEntry = async (req, res) => {
  const { entry_id } = req.params;
  if (!entry_id) {
    return res.status(400).json({ error: "Не вказано entry_id." });
  }

  try {
    const comments = await sequelize.query(
      `SELECT 
        c.id,
        c.text,
        c.created_at AS "createdAt",
        u.id AS authorId,
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
      ORDER BY c.created_at ASC`,
      {
        replacements: { entry_id },
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({ comments });
  } catch (err) {
    console.error("[getCommentsByEntry] ❌", err.message);
    res.status(500).json({ error: err.message });
  }
};

// 📤 Експорт
module.exports = {
  authenticateUser,
  getAllEntries,
  createBlogEntry,
  deleteBlogEntry,
  addComment,
  getCommentsByEntry,
};