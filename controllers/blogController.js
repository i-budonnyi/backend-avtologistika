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

// 📥 Отримати всі записи (блоги, ідеї)
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
const addComment = async (req, res) => {
  const { entry_id, entry_type, comment } = req.body;
  const user_id = req.user?.user_id;

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

  const config = typeMap[entry_type];
  if (!config) {
    return res.status(400).json({ error: "Невідомий тип запису." });
  }

  try {
    const [exists] = await sequelize.query(
      `SELECT id FROM ${config.table} WHERE id = :entry_id`,
      {
        replacements: { entry_id },
        type: QueryTypes.SELECT,
      }
    );

    if (!exists) {
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
      }
    });

    res.status(201).json({ comment: inserted[0] });
  } catch (err) {
    console.error("[addComment] ❌", err.message);
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
};
