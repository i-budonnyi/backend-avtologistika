const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProjectBudgets = sequelize.define('ProjectBudgets', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    treasurer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    allocated_amount: {
        type: DataTypes.NUMERIC,
        allowNull: false,
    },
    spent_amount: {
        type: DataTypes.NUMERIC,
        defaultValue: 0,
    },
    description: {
        type: DataTypes.TEXT,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'project_budgets',
    timestamps: false,
});

module.exports = ProjectBudgets;
