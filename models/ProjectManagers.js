// Модель для таблиці `pm_permissions`
const PmPermissions = sequelize.define('PmPermissions', {
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
    tableName: 'pm_permissions',
    timestamps: false,
});

module.exports = PmPermissions;
