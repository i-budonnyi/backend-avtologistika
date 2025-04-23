const Problem = sequelize.define('Problem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ideaId: { type: DataTypes.INTEGER, allowNull: false },
    severityLevel: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'problems', timestamps: false });

module.exports = Problem;
