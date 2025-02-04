const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Модель для таблиці `login_attempts`
const LoginAttempt = sequelize.define('LoginAttempt', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER, // ID користувача, якщо відомо
        allowNull: true,
    },
    login_time: {
        type: DataTypes.DATE, // Час спроби входу
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.STRING, // Статус спроби: success або failed
        allowNull: false,
    },
    ip_address: {
        type: DataTypes.STRING, // IP-адреса спроби входу
        allowNull: false,
    },
}, {
    tableName: 'login_attempts',
    timestamps: false,
});

module.exports = LoginAttempt;
