// Імпортуємо необхідні залежності
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Визначаємо модель `Permissions`
const Permissions = sequelize.define('Permissions', {
    id: {
        type: DataTypes.INTEGER, // Поле `id` з автоматичним збільшенням
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING, // Назва дозволу
        allowNull: false,
        unique: true, // Назва має бути унікальною
    },
    description: {
        type: DataTypes.TEXT, // Опис дозволу
    },
}, {
    tableName: 'permissions', // Вказуємо ім'я таблиці
    timestamps: false, // Вимикаємо автоматичні поля `createdAt` та `updatedAt`
});

// Експортуємо модель
module.exports = Permissions;
