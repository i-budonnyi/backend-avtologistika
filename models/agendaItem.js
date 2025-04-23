// models/agendaItem.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AgendaItem = sequelize.define('AgendaItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  agenda_id: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('not_reviewed', 'reviewed', 'voted'), defaultValue: 'not_reviewed' },
  updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

module.exports = AgendaItem;
