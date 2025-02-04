const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Модель для таблиці `pm_logs`
const PmLogs = sequelize.define('PmLogs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    pm_id: {
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
    tableName: 'pm_logs',
    timestamps: false, // Вимкнено автоматичне оновлення createdAt та updatedAt
});

module.exports = PmLogs;
