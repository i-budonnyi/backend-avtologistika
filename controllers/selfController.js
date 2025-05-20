const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

// GET /api/self/profile
exports.getOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user] = await sequelize.query(
      "SELECT id, name, email FROM users WHERE id = :userId LIMIT 1",
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
    const { name, email } = req.body;

    // Оновити дані
    await sequelize.query(
      `UPDATE users SET name = :name, email = :email WHERE id = :userId`,
      {
        replacements: { name, email, userId },
        type: QueryTypes.UPDATE
      }
    );

    // Повторно зчитати оновлені дані
    const [updatedUser] = await sequelize.query(
      "SELECT id, name, email FROM users WHERE id = :userId LIMIT 1",
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
