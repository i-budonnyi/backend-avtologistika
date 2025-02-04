const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Roles = sequelize.define('Roles', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'roles',
    timestamps: false,
});

module.exports = Roles;
