// models/blogPost.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BlogPost = sequelize.define("BlogPost", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT },
  author_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { 
    type: DataTypes.ENUM("draft", "published", "archived"), 
    defaultValue: "draft" 
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = BlogPost;
