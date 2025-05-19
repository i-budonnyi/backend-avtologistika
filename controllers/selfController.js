const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// 🔧 Вбудована модель Users (без models/)
const User = sequelize.define("users", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  edited_once: DataTypes.BOOLEAN,
}, {
  timestamps: false,
  freezeTableName: true,
});

// 🔄 Оновлення власного профілю
exports.updateOwnProfile = async (req, res) => {
  const user_id = req.user?.id;
  const { first_name, last_name, email, phone, edited_once } = req.body;

  if (!user_id) {
    console.warn("[SELF] ❌ Токен не містить user_id");
    return res.status(401).json({ message: "Неавторизовано" });
  }

  try {
    const [updated] = await User.update(
      {
        first_name,
        last_name,
        email,
        phone,
        edited_once,
      },
      { where: { id: user_id } }
    );

    if (!updated) {
      console.warn("[SELF] ⚠️ Користувача не знайдено:", user_id);
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const updatedUser = await User.findByPk(user_id);
    console.info("[SELF] ✅ Профіль оновлено:", updatedUser);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("[SELF] ❌ Помилка при оновленні:", error.message);
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};
