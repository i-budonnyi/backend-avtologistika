const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./users"); // Підключаємо модель User 

const Blog = sequelize.define("Blog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "blog",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

// 🔥 Асоціація з User
Blog.belongsTo(User, { foreignKey: "user_id", as: "author" });
User.hasMany(Blog, { foreignKey: "user_id", as: "blogs" }); // ✅ Замінено userBlogs → blogs

module.exports = Blog;
