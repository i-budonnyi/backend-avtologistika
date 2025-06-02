const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

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
        to_char(c.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "createdAt",
        u.id AS authorId,
        u.first_name AS author_first_name,
        u.last_name AS author_last_name,
        u.email AS author_email,
        CASE 
          WHEN c.blog_id = :entry_id THEN 'blog'
          WHEN c.idea_id = :entry_id THEN 'idea'
          WHEN c.problem_id = :entry_id THEN 'problem'
        END AS entry_type
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.blog_id = :entry_id OR c.idea_id = :entry_id OR c.problem_id = :entry_id
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
  const { entry_id, entry_type, comment } = req.body;
  const user_id = req.user?.id || req.user?.user_id;

  if (!entry_id || !entry_type || !comment || !user_id) {
    return res.status(400).json({
      error: "Всі поля обов'язкові (entry_id, entry_type, comment, user_id).",
    });
  }

  const typeMap = {
    blog: { column: "blog_id", table: "blog" },
    idea: { column: "idea_id", table: "ideas" },
    problem: { column: "problem_id", table: "problems" },
  };

  const config = typeMap[entry_type.toLowerCase()];
  if (!config) {
    return res.status(400).json({ error: "Невідомий тип запису." });
  }

  try {
    const [check] = await sequelize.query(
      `SELECT id FROM ${config.table} WHERE id = :entry_id`,
      {
        replacements: { entry_id },
        type: QueryTypes.SELECT,
      }
    );

    if (!check) {
      return res.status(404).json({ error: `Запис ${entry_type} з ID ${entry_id} не знайдено.` });
    }

    const [inserted] = await sequelize.query(
      `INSERT INTO comments (${config.column}, user_id, text, created_at, updated_at)
       VALUES (:entry_id, :user_id, :comment, NOW(), NOW())
       RETURNING id, text, created_at`,
      {
        replacements: { entry_id, user_id, comment },
        type: QueryTypes.INSERT,
      }
    );

    getIO().emit("new_comment", {
      entryId: entry_id,
      entryType: entry_type,
      comment: {
        id: inserted[0].id,
        text: inserted[0].text,
        createdAt: inserted[0].created_at,
        author_first_name: "Анонім",
        author_last_name: "",
        author_email: "",
      }
    });

    res.status(201).json({ comment: inserted[0] });
  } catch (err) {
    console.error("[addComment] ❌", err.message);
    res.status(500).json({ error: err.message });
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
