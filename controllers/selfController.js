const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

// GET /api/self/profile
exports.getOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user] = await sequelize.query(
      `SELECT id, name AS first_name, surname AS last_name, email, phone
       FROM users
       WHERE id = :userId
       LIMIT 1`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT
      }
    );

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Помилка при отриманні профілю:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

// PATCH /api/self/profile
exports.updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, surname, email, phone, password } = req.body;

    const updates = [];
    if (name) updates.push(`name = :name`);
    if (surname) updates.push(`surname = :surname`);
    if (email) updates.push(`email = :email`);
    if (phone) updates.push(`phone = :phone`);
    if (password) updates.push(`password = crypt(:password, gen_salt('bf'))`);

    if (updates.length === 0) {
      return res.status(400).json({ message: "Немає даних для оновлення" });
    }

    const updateQuery = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = :userId
    `;

    await sequelize.query(updateQuery, {
      replacements: { userId, name, surname, email, phone, password },
      type: QueryTypes.UPDATE
    });

    const [updatedUser] = await sequelize.query(
      `SELECT id, name AS first_name, surname AS last_name, email, phone
       FROM users
       WHERE id = :userId
       LIMIT 1`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT
      }
    );

    res.json({
      message: "Профіль оновлено успішно",
      user: updatedUser
    });
  } catch (error) {
    console.error("❌ Помилка при оновленні профілю:", error);
    res.status(500).json({ message: "Не вдалося оновити профіль" });
  }
};
