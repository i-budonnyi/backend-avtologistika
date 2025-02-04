const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SupervisorProjects = sequelize.define('SupervisorProjects', {
    supervisor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    assigned_by_pm_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'supervisor_projects',
    timestamps: false,
});

module.exports = SupervisorProjects;
