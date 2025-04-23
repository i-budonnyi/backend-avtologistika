const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

const getAllSecretaries = async (req, res) => {
  try {
    const secretaries = await sequelize.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone 
       FROM users u 
       INNER JOIN roles r ON u.role_id = r.id 
       WHERE r.name = 'jury_secretary'`,
      { type: QueryTypes.SELECT }
    );

    console.log("✅ Отримано всіх секретарів:", secretaries.length);
    res.status(200).json(secretaries); // ✅ Повертаємо просто масив, а не { secretaries }
  } catch (error) {
    console.error("❌ Помилка отримання секретарів:", error);
    res.status(500).json({ error: "Не вдалося отримати список секретарів." });
  }
};

module.exports = { getAllSecretaries };
