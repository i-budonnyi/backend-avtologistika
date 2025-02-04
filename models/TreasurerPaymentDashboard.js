const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TreasurerPaymentDashboard = sequelize.define('TreasurerPaymentDashboard', {
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
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'treasurer_payment_dashboard',
  timestamps: false,
});

module.exports = TreasurerPaymentDashboard;
