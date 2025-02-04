const Subscription = sequelize.define('Subscription', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    ideaId: { type: DataTypes.INTEGER, allowNull: true },
    problemId: { type: DataTypes.INTEGER, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'subscriptions', timestamps: false });

module.exports = Subscription;
