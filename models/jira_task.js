const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Підключення до БД

const JiraTask = sequelize.define('JiraTask', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Open', 'In Progress', 'Review', 'Done', 'Closed']],
        },
    },
    assigned_to: {
        type: DataTypes.INTEGER,
    },
    created_by_pm_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    priority: {
        type: DataTypes.STRING,
        validate: {
            isIn: [['Low', 'Medium', 'High', 'Critical']],
        },
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
    tableName: 'jira_tasks',
    timestamps: false,
});

module.exports = JiraTask;
