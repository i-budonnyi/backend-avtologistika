const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Модель для таблиці `jury_decisions`
const JuryDecision = sequelize.define('JuryDecision', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    jury_member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    decision: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bonus_amount: {
        type: DataTypes.NUMERIC,
        allowNull: true,
    },
    decision_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    payment_status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
    },
}, {
    tableName: 'jury_decisions',
    timestamps: false,
});

module.exports = JuryDecision;
