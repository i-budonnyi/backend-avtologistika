const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Модель для таблиці `media_files`
const MediaFile = sequelize.define('MediaFile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    uploader_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    file_path: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    file_size: {
        type: DataTypes.BIGINT,
    },
    uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'media_files',
    timestamps: false,
});

module.exports = MediaFile;
