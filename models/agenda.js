// models/agenda.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agenda = sequelize.define('Agenda', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  meeting_date: { type: DataTypes.DATE, allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('draft', 'published'), defaultValue: 'draft' },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

module.exports = Agenda;
