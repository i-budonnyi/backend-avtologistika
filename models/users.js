const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // НЕ { sequelize }

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "users",
  timestamps: false,
});

module.exports = User;
