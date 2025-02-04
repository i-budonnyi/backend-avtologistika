const sequelize = require("../config/database");

// ✅ Створення нового амбасадора через SQL
const createAmbassador = async (req, res) => {
  try {
    const { phone, position, email, first_name, last_name } = req.body;

    console.log("[createAmbassador] Отримано запит на створення амбасадора...");

    // SQL-запит для вставки нового амбасадора
    await sequelize.query(
      `INSERT INTO ambassadors (phone, position, email, first_name, last_name)
       VALUES (:phone, :position, :email, :first_name, :last_name)`,
      {
        replacements: { phone, position, email, first_name, last_name },
        type: sequelize.QueryTypes.INSERT,
      }
    );

    console.log("[createAmbassador] ✅ Амбасадор успішно створений.");
    res.status(201).json({ message: "Амбасадор успішно створений" });
  } catch (error) {
    console.error("[createAmbassador] ❌ Помилка створення амбасадора:", error);
    res.status(500).json({ message: "Помилка створення амбасадора", error });
  }
};

// ✅ Отримання всіх амбасадорів через SQL
const getAllAmbassadors = async (req, res) => {
  try {
    console.log("[getAllAmbassadors] 🚀 Запит отримано...");

    // SQL-запит для отримання всіх амбасадорів
    const ambassadors = await sequelize.query(
      `SELECT id, phone, position, email, first_name, last_name FROM ambassadors`,
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log(`[getAllAmbassadors] ✅ Отримано ${ambassadors.length} амбасадорів.`);
    res.status(200).json(ambassadors);
  } catch (error) {
    console.error("[getAllAmbassadors] ❌ Помилка:", error);
    res.status(500).json({ message: "Помилка отримання списку амбасадорів", error });
  }
};

module.exports = { createAmbassador, getAllAmbassadors };
