const { QueryTypes } = require("sequelize");
const sequelize = require("../config/database");
const { io } = require("../index"); // Імпортуємо io для WebSocket

// ✅ Додати рішення журі
const addDecision = async (req, res) => {
  try {
    const { project_id, user_id, jury_member_id, decision, bonus_amount } = req.body;

    if (!project_id || !user_id || !jury_member_id || !decision) {
      return res.status(400).json({ message: "Необхідно вказати всі обов’язкові поля." });
    }

    const [newDecision] = await sequelize.query(
      `INSERT INTO jury_decisions (project_id, user_id, jury_member_id, decision, bonus_amount, created_at)
       VALUES (:project_id, :user_id, :jury_member_id, :decision, :bonus_amount, NOW())
       RETURNING *`,
      {
        replacements: { project_id, user_id, jury_member_id, decision, bonus_amount },
        type: QueryTypes.INSERT,
      }
    );

    await sequelize.query(
      `INSERT INTO jury_logs (jury_member_id, action, created_at)
       VALUES (:jury_member_id, 'added decision', NOW())`,
      {
        replacements: { jury_member_id },
        type: QueryTypes.INSERT,
      }
    );

    // 📡 Вебсокет повідомлення
    io.emit("jury_decision_added", { decision: newDecision });

    res.status(201).json({ message: "Рішення успішно додано.", newDecision });
  } catch (error) {
    console.error("❌ Помилка при додаванні рішення:", error);
    res.status(500).json({ message: "Помилка сервера.", error: error.message });
  }
};

// ✅ Отримати рішення для проєкту
const getDecisionsForProject = async (req, res) => {
  try {
    const { project_id } = req.params;

    if (!project_id) {
      return res.status(400).json({ message: "Необхідно вказати project_id." });
    }

    const decisions = await sequelize.query(
      `SELECT * FROM jury_decisions WHERE project_id = :project_id`,
      {
        replacements: { project_id },
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(decisions);
  } catch (error) {
    console.error("❌ Помилка при отриманні рішень:", error);
    res.status(500).json({ message: "Помилка сервера.", error: error.message });
  }
};

// ✅ Отримати лог дій журі
const getJuryLogs = async (req, res) => {
  try {
    const { jury_member_id } = req.params;

    if (!jury_member_id) {
      return res.status(400).json({ message: "Необхідно вказати jury_member_id." });
    }

    const logs = await sequelize.query(
      `SELECT * FROM jury_logs WHERE jury_member_id = :jury_member_id ORDER BY created_at DESC`,
      {
        replacements: { jury_member_id },
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(logs);
  } catch (error) {
    console.error("❌ Помилка при отриманні логів:", error);
    res.status(500).json({ message: "Помилка сервера.", error: error.message });
  }
};

// ✅ Додати нового члена журі
const addJuryMember = async (req, res) => {
  try {
    const { name, role } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: "Необхідно вказати ім’я та роль." });
    }

    const [newJuryMember] = await sequelize.query(
      `INSERT INTO jury_members (name, role, created_at)
       VALUES (:name, :role, NOW())
       RETURNING *`,
      {
        replacements: { name, role },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: "Член журі успішно доданий.", newJuryMember });
  } catch (error) {
    console.error("❌ Помилка при додаванні члена журі:", error);
    res.status(500).json({ message: "Помилка сервера.", error: error.message });
  }
};

module.exports = {
  addDecision,
  getDecisionsForProject,
  getJuryLogs,
  addJuryMember,
};
