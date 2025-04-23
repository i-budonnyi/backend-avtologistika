const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db"); // Використовуємо підключення до БД

const JuryVotingController = {
  async vote(req, res) {
    try {
      const { agenda_id, decision_type, comment, bonus_amount, review_date } = req.body;

      console.log("📌 Отримано дані голосування:", req.body);

      // Перевіряємо, чи вже є рішення по цьому порядку денному
      const existingVote = await sequelize.query(
        `SELECT id FROM jury_decisions WHERE agenda_id = :agendaId LIMIT 1`,
        {
          replacements: { agendaId: agenda_id },
          type: QueryTypes.SELECT,
        }
      );

      if (existingVote.length > 0) {
        console.warn(`⚠️ Голосування по agenda_id=${agenda_id} вже проведено`);
        return res.status(403).json({ message: "Голосування по цьому питанню вже проведено" });
      }

      // Отримуємо ID користувача з авторизації
      const user_id = req.user.id;

      // Отримуємо ID журі
      const juryResult = await sequelize.query(
        `SELECT id FROM jury_members WHERE user_id = :userId LIMIT 1`,
        {
          replacements: { userId: user_id },
          type: QueryTypes.SELECT,
        }
      );

      if (juryResult.length === 0) {
        console.warn("⚠️ Член журі не знайдений:", user_id);
        return res.status(404).json({ message: "Член журі не знайдений" });
      }

      const jury_member_id = juryResult[0].id;

      // Визначаємо статус оплати
      let paymentStatus = "pending";
      const bonus = Number(bonus_amount) || 0;
      if (bonus > 0) {
        paymentStatus = "approved";
      }

      // Вставка голосу у таблицю jury_decisions
      const result = await sequelize.query(
        `INSERT INTO jury_decisions 
          (agenda_id, user_id, jury_member_id, decision_text, decision_type, decision, bonus_amount, submission_date, payment_status, review_date)
         VALUES (:agendaId, :userId, :juryMemberId, :comment, :decisionType, :decisionType, :bonusAmount, NOW(), :paymentStatus, :reviewDate)
         RETURNING *;`,
        {
          replacements: {
            agendaId: agenda_id,
            userId: user_id,
            juryMemberId: jury_member_id,
            comment: comment,
            decisionType: decision_type,
            decision: decision_type,
            bonusAmount: bonus,
            paymentStatus: paymentStatus,
            reviewDate: review_date || null,
          },
          type: QueryTypes.INSERT,
        }
      );

      // 🔄 Оновлюємо статус у `agenda`
      await sequelize.query(
        `UPDATE agenda SET decision_type = :decisionType WHERE id = :agendaId`,
        {
          replacements: { decisionType: decision_type, agendaId: agenda_id },
          type: QueryTypes.UPDATE,
        }
      );

      console.log("✅ Голосування успішно збережено:", result[0]);
      return res.status(201).json({ message: "Голос успішно збережено", decision: result[0] });
    } catch (error) {
      console.error("❌ ПОМИЛКА при голосуванні:", error);
      return res.status(500).json({ message: "Помилка сервера" });
    }
  },

  // Отримання списку порядку денного зі статусом рішень
  async getAgendaWithDecisions(req, res) {
    try {
      const { filterBy } = req.query;
      let filterCondition = "";

      if (filterBy === "approved") {
        filterCondition = "WHERE a.decision_type IS NOT NULL";
      } else if (filterBy === "pending") {
        filterCondition = "WHERE a.decision_type IS NULL";
      }

      const agenda = await sequelize.query(
        `SELECT a.*, jd.decision_type
         FROM agenda a
         LEFT JOIN jury_decisions jd ON a.id = jd.agenda_id
         ${filterCondition}`,
        { type: QueryTypes.SELECT }
      );

      console.log("✅ Отримано порядок денний із рішеннями:", agenda.length);
      res.status(200).json(agenda);
    } catch (error) {
      console.error("❌ ПОМИЛКА при отриманні порядку денного:", error);
      res.status(500).json({ message: "Помилка сервера" });
    }
  },
};

module.exports = JuryVotingController;
