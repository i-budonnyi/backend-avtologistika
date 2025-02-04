const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Treasurer = sequelize.define('Treasurer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'treasurers',
  timestamps: false,
});

module.exports = Treasurer;
