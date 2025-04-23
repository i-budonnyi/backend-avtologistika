const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Модель для таблиці `jury_logs`
const JuryLog = sequelize.define('JuryLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    jury_member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    log_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'jury_logs',
    timestamps: false,
});

module.exports = JuryLog;
