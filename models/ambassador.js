const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Ambassador extends Model {}

Ambassador.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    sequelize,
    modelName: "Ambassador",
    tableName: "ambassadors",
    timestamps: false,
  }
);

console.log("✅ Ambassador модель завантажено успішно!");

module.exports = Ambassador;
