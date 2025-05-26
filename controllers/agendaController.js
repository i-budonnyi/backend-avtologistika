const { QueryTypes } = require("sequelize");
const sequelize = require("../config/database");
const { io } = require("../index"); // ⬅️ Імпорт WebSocket-серверу

/**
 * ✅ Створення нового порядку денного
 */
const createAgenda = async (req, res) => {
  try {
    const { title, description, meeting_date, created_by } = req.body;

    if (!title || !description || !meeting_date || !created_by) {
      return res.status(400).json({ message: "❌ Всі поля є обов'язковими." });
    }

    console.log(`📌 Створення порядку денного: ${title}`);

    const [agenda] = await sequelize.query(
      `INSERT INTO agenda (title, description, meeting_date, created_by, created_at)
       VALUES (:title, :description, :meeting_date, :created_by, NOW()) RETURNING *`,
      {
        replacements: { title, description, meeting_date, created_by },
        type: QueryTypes.INSERT,
      }
    );

    console.log("✅ Порядок  створено:", agenda);

    // 📡 WebSocket-подія для фронтенду
    io.emit("agenda_updated", agenda); // ← сюди підключені клієнти реагують

    res.status(201).json({
      message: "✅ Порядок денний успішно створено!",
      agenda
    });
  } catch (error) {
    console.error("[ERROR] ❌ Помилка створення порядку денного:", error);
    res.status(500).json({
      message: "❌ Помилка створення порядку денного.",
      error: error.message
    });
  }
};

/**
 * ✅ Отримання всіх записів порядку денного з їхнім рішенням (decision_type)
 */
const getAllAgendas = async (req, res) => {
  try {
    console.log("📌 Отримання всіх записів порядку денного...");

    const agendas = await sequelize.query(
      `SELECT a.*, jd.decision_type 
       FROM agenda a
       LEFT JOIN jury_decisions jd ON a.id = jd.agenda_id
       ORDER BY a.meeting_date DESC`,
      { type: QueryTypes.SELECT }
    );

    console.log(`✅ Отримано ${agendas.length} записів.`);
    res.status(200).json(agendas);
  } catch (error) {
    console.error("[ERROR] ❌ Помилка отримання всіх записів порядку денного:", error);
    res.status(500).json({
      message: "❌ Помилка отримання записів порядку денного.",
      error: error.message
    });
  }
};

/**
 * ✅ Отримання конкретного порядку денного за ID з його рішенням (decision_type)
 */
const getAgendaById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "❌ ID порядку денного не передано." });
    }

    console.log(`📌 Отримання порядку денного за ID=${id}`);

    const agenda = await sequelize.query(
      `SELECT a.*, jd.decision_type 
       FROM agenda a
       LEFT JOIN jury_decisions jd ON a.id = jd.agenda_id
       WHERE a.id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!agenda.length) {
      console.warn(`❌ Порядок денний не знайдено ID=${id}`);
      return res.status(404).json({ message: "❌ Порядок денний не знайдено." });
    }

    console.log("✅ Порядок денний знайдено:", agenda[0]);
    res.status(200).json(agenda[0]);
  } catch (error) {
    console.error("[ERROR] ❌ Помилка отримання порядку денного:", error);
    res.status(500).json({
      message: "❌ Помилка отримання порядку денного.",
      error: error.message
    });
  }
};

module.exports = {
  createAgenda,
  getAllAgendas,
  getAgendaById
};
