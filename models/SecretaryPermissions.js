const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SecretaryPermissions = sequelize.define('SecretaryPermissions', {
    secretary_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'secretary_permissions',
    timestamps: false,
});

module.exports = SecretaryPermissions;
