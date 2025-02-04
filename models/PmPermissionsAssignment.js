// Модель для таблиці `pm_permissions_assignment`
const PmPermissionsAssignment = sequelize.define('PmPermissionsAssignment', {
    pm_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    granted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'pm_permissions_assignment',
    timestamps: false,
});

module.exports = PmPermissionsAssignment;
