const { QueryTypes } = require("sequelize");
const sequelize = require("../config/database");
const jwt = require("jsonwebtoken");

// Створення заявки
const createApplication = async (req, res) => {
  try {
    const { user_id, title, content, idea_id, type } = req.body;

    if (!user_id || !title || !content || !idea_id || !type) {
      return res.status(400).json({ message: "Не всі необхідні дані заповнені!" });
    }

    const allowedTypes = ["idea", "problem"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Неправильний тип заявки!" });
    }

    const [newApplication] = await sequelize.query(
      `INSERT INTO applications (user_id, title, content, idea_id, type, status, created_at, updated_at)
       VALUES (:user_id, :title, :content, :idea_id, :type, 'draft', NOW(), NOW()) RETURNING *`,
      {
        replacements: { user_id, title, content, idea_id, type },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json(newApplication);
  } catch (error) {
    console.error("❌ Помилка створення заявки:", error);
    res.status(500).json({ message: "Внутрішня помилка сервера" });
  }
};

// Отримання всіх заявок разом з ім'ям і прізвищем автора
const getAllApplications = async (req, res) => {
  try {
    const applications = await sequelize.query(
      `SELECT a.*, u.first_name, u.last_name 
       FROM applications a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC`,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json(applications);
  } catch (error) {
    console.error("❌ Помилка отримання заявок:", error);
    res.status(500).json({ message: "Не вдалося отримати заявки" });
  }
};

// Отримання заявки за ID
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await sequelize.query(
      `SELECT a.*, u.first_name, u.last_name 
       FROM applications a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!application.length) {
      return res.status(404).json({ message: "Заявка не знайдена" });
    }

    res.json(application[0]);
  } catch (error) {
    console.error("❌ Помилка отримання заявки:", error);
    res.status(500).json({ message: "Не вдалося отримати заявку" });
  }
};

// Оновлення заявки
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;

    const [updated] = await sequelize.query(
      `UPDATE applications SET title = :title, content = :content, status = :status, updated_at = NOW()
       WHERE id = :id RETURNING *`,
      {
        replacements: { title, content, status, id },
        type: QueryTypes.UPDATE,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Заявка не знайдена" });
    }

    res.json({ message: "Заявку оновлено успішно" });
  } catch (error) {
    console.error("❌ Помилка оновлення заявки:", error);
    res.status(500).json({ message: "Не вдалося оновити заявку" });
  }
};

// Видалення заявки
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await sequelize.query("DELETE FROM applications WHERE id = :id RETURNING *", {
      replacements: { id },
      type: QueryTypes.DELETE,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Заявка не знайдена" });
    }

    res.json({ message: "Заявку успішно видалено" });
  } catch (error) {
    console.error("❌ Помилка видалення заявки:", error);
    res.status(500).json({ message: "Не вдалося видалити заявку" });
  }
};

// Оновлення заявки рішенням журі
const updateApplicationByJury = async (req, res) => {
  try {
    const { id } = req.params;
    const { jury_comment, decision_type, postpone, review_comment } = req.body;

    if (!jury_comment || !decision_type) {
      return res.status(400).json({ message: "Коментар журі та тип рішення обов’язкові" });
    }

    let postponedDate = null;
    if (postpone) {
      postponedDate = new Date();
      postponedDate.setMonth(postponedDate.getMonth() + 7);
    }

    const [updated] = await sequelize.query(
      `UPDATE applications 
       SET jury_comment = :jury_comment, decision_type = :decision_type, review_comment = :review_comment, 
           updated_at = NOW(), status = CASE 
             WHEN :postponedDate IS NOT NULL THEN 'postponed' 
             ELSE 'reviewed' 
           END, locked_by = NULL 
       WHERE id = :id RETURNING *`,
      {
        replacements: { jury_comment, decision_type, review_comment, postponedDate, id },
        type: QueryTypes.UPDATE,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Заявка не знайдена" });
    }

    res.json({ message: "Рішення журі збережено успішно" });
  } catch (error) {
    console.error("❌ Помилка оновлення заявки журі:", error);
    res.status(500).json({ message: "Не вдалося оновити заявку" });
  }
};

// Експорт контролера
module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  updateApplicationByJury,
};
