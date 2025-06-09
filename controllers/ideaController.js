const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

// ✅ Отримати всі ідеї
const getAllIdeas = async (req, res) => {
  try {
    const ideas = await sequelize.query(
      `SELECT i.*, u.first_name AS author_first_name, u.last_name AS author_last_name
       FROM ideas i
       LEFT JOIN users u ON i.user_id = u.id
       ORDER BY i.created_at DESC`,
      { type: QueryTypes.SELECT }
    );
    res.status(200).json(ideas);
  } catch (error) {
    console.error("[getAllIdeas] ❌", error);
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

// ✅ Створити нову ідею (через JWT)
const createIdea = async (req, res) => {
  const { ambassador_id, title, description } = req.body;
  const user_id = req.user?.id;

  if (!title || !description || !ambassador_id || !user_id) {
    return res.status(400).json({ message: "Всі поля обов'язкові" });
  }

  console.log("📝 createIdea ->", { user_id, ambassador_id, title, description });

  try {
    await sequelize.query(
      `INSERT INTO ideas (user_id, ambassador_id, title, description, status, created_at, updated_at)
       VALUES (:user_id, :ambassador_id, :title, :description, 'pending', NOW(), NOW())`,
      {
        replacements: { user_id, ambassador_id, title, description },
        type: QueryTypes.INSERT
      }
    );

    res.status(201).json({ message: "Ідея успішно створена" });
  } catch (error) {
    console.error("[createIdea] ❌", error);
    res.status(500).json({ message: "Помилка при створенні ідеї", error: error.message });
  }
};

// ✅ Ідеї користувача
const getUserIdeas = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Авторизація обов'язкова" });

    const ideas = await sequelize.query(
      "SELECT * FROM ideas WHERE user_id = :userId ORDER BY created_at DESC",
      { replacements: { userId }, type: QueryTypes.SELECT }
    );
    res.status(200).json(ideas);
  } catch (error) {
    console.error("[getUserIdeas] ❌", error);
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

// ✅ Ідеї певного амбасадора
const getIdeasByAmbassador = async (req, res) => {
  const { ambassadorId } = req.params;
  if (!ambassadorId) return res.status(400).json({ message: "Необхідно ID амбасадора" });

  try {
    const ideas = await sequelize.query(
      `SELECT i.*, u.first_name AS author_first_name, u.last_name AS author_last_name
       FROM ideas i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.ambassador_id = :ambassadorId
       ORDER BY i.created_at DESC`,
      {
        replacements: { ambassadorId },
        type: QueryTypes.SELECT
      }
    );
    res.status(200).json(ideas);
  } catch (error) {
    console.error("[getIdeasByAmbassador] ❌", error);
    res.status(500).json({ message: "Помилка отримання ідей", error: error.message });
  }
};

// ✅ Оновити статус ідеї
const updateIdeaStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!id || !status) return res.status(400).json({ message: "ID і статус обов'язкові" });

  try {
    await sequelize.query(
      `UPDATE ideas SET status = :status, updated_at = NOW() WHERE id = :id`,
      { replacements: { status, id }, type: QueryTypes.UPDATE }
    );
    res.status(200).json({ message: "Статус оновлено" });
  } catch (error) {
    console.error("[updateIdeaStatus] ❌", error);
    res.status(500).json({ message: "Помилка оновлення статусу", error: error.message });
  }
};

// ✅ Список амбасадорів
const getAllAmbassadors = async (req, res) => {
  try {
    const data = await sequelize.query(
      "SELECT id, first_name, last_name, email FROM users WHERE role = 'ambassador'",
      { type: QueryTypes.SELECT }
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("[getAllAmbassadors] ❌", error);
    res.status(500).json({ message: "Помилка отримання амбасадорів", error });
  }
};

module.exports = {
  getAllIdeas,
  createIdea,
  getUserIdeas,
  updateIdeaStatus,
  getIdeasByAmbassador,
  getAllAmbassadors
};
