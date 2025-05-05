const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

// ✅ Отримати всі ідеї (з іменами авторів)
const getAllIdeas = async (req, res) => {
  try {
    const ideas = await sequelize.query(`
      SELECT i.*, 
             u.first_name AS author_first_name, 
             u.last_name AS author_last_name
      FROM ideas i
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
    `, {
      type: QueryTypes.SELECT,
    });
    res.status(200).json(ideas);
  } catch (error) {
    console.error("[getAllIdeas] ❌", error);
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

// ✅ Отримати ідеї користувача
const getUserIdeas = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Авторизація обов'язкова" });

    const ideas = await sequelize.query(
      `SELECT * FROM ideas WHERE user_id = :userId ORDER BY created_at DESC`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );
    res.status(200).json(ideas);
  } catch (error) {
    console.error("[getUserIdeas] ❌", error);
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

// ✅ Ідеї конкретного амбасадора
const getIdeasByAmbassador = async (req, res) => {
  try {
    const { ambassadorId } = req.params;
    if (!ambassadorId) {
      return res.status(400).json({ message: "Необхідно вказати ID амбасадора." });
    }

    const ideas = await sequelize.query(
      `SELECT i.*, u.first_name AS author_first_name, u.last_name AS author_last_name
       FROM ideas i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.ambassador_id = :ambassadorId
       ORDER BY i.created_at DESC`,
      { replacements: { ambassadorId }, type: QueryTypes.SELECT }
    );

    res.status(200).json(ideas);
  } catch (error) {
    console.error("[getIdeasByAmbassador] ❌", error);
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

// ✅ Додати коментар до ідеї
const addCommentToIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user?.id;

    if (!comment?.trim()) {
      return res.status(400).json({ message: "Коментар не може бути порожнім." });
    }

    await sequelize.query(
      `INSERT INTO comments (idea_id, user_id, comment_text) VALUES (:id, :userId, :comment)`,
      { replacements: { id, userId, comment }, type: QueryTypes.INSERT }
    );

    res.status(201).json({ message: "Коментар успішно додано" });
  } catch (error) {
    console.error("[addCommentToIdea] ❌", error);
    res.status(500).json({ message: "Помилка додавання коментаря", error: error.message });
  }
};

// ✅ Створити нову ідею
const createIdea = async (req, res) => {
  try {
    const { ambassador_id, title, description } = req.body;
    const user_id = req.user?.id;

    await sequelize.query(
      `INSERT INTO ideas (user_id, ambassador_id, title, description, status)
       VALUES (:user_id, :ambassador_id, :title, :description, 'pending')`,
      { replacements: { user_id, ambassador_id, title, description }, type: QueryTypes.INSERT }
    );

    res.status(201).json({ message: "Ідея успішно подана" });
  } catch (error) {
    console.error("[createIdea] ❌", error);
    res.status(500).json({ message: "Помилка створення ідеї", error: error.message });
  }
};

// ✅ Оновити статус
const updateIdeaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "ID і статус обов'язкові." });
    }

    await sequelize.query(
      `UPDATE ideas SET status = :status WHERE id = :id`,
      { replacements: { status, id }, type: QueryTypes.UPDATE }
    );

    res.status(200).json({ message: "Статус ідеї успішно оновлено." });
  } catch (error) {
    console.error("[updateIdeaStatus] ❌", error);
    res.status(500).json({ message: "Помилка оновлення статусу", error: error.message });
  }
};

// ✅ Отримати всіх амбасадорів
const getAllAmbassadors = async (req, res) => {
  try {
    const ambassadors = await sequelize.query(
      `SELECT id, first_name, last_name, email FROM users WHERE role = 'ambassador'`,
      { type: QueryTypes.SELECT }
    );
    res.status(200).json(ambassadors);
  } catch (error) {
    console.error("[getAllAmbassadors] ❌", error);
    res.status(500).json({ message: "Не вдалося отримати амбасадорів", error: error.message });
  }
};

module.exports = {
  getAllIdeas,
  getUserIdeas,
  getIdeasByAmbassador,
  addCommentToIdea,
  createIdea,
  updateIdeaStatus,
  getAllAmbassadors,
};
