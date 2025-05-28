const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Створення публікації
exports.createMediaFile = async (req, res) => {
  try {
    const { uploader_id, file_name, file_path, file_size } = req.body;

    if (!uploader_id || !file_name || !file_path) {
      return res.status(400).json({ message: 'Усі поля є обов’язковими.' });
    }

    const [mediaFile] = await sequelize.query(
      `INSERT INTO media_files (uploader_id, file_name, file_path, file_size, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      {
        bind: [uploader_id, file_name, file_path, file_size],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: 'Файл успішно опубліковано.', mediaFile });
  } catch (error) {
    console.error('❌ createMediaFile error:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

// Оновлення публікації
exports.updateMediaFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { file_name, file_path } = req.body;

    const [updatedFile] = await sequelize.query(
      `UPDATE media_files
       SET file_name = $1, file_path = $2
       WHERE id = $3
       RETURNING *`,
      {
        bind: [file_name, file_path, id],
        type: QueryTypes.UPDATE,
      }
    );

    if (!updatedFile) {
      return res.status(404).json({ message: 'Файл не знайдено.' });
    }

    res.status(200).json({ message: 'Інформацію про файл успішно оновлено.' });
  } catch (error) {
    console.error('❌ updateMediaFile error:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

// Видалення публікації
exports.deleteMediaFile = async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedFile] = await sequelize.query(
      `DELETE FROM media_files WHERE id = $1 RETURNING *`,
      {
        bind: [id],
        type: QueryTypes.DELETE,
      }
    );

    if (!deletedFile) {
      return res.status(404).json({ message: 'Файл не знайдено.' });
    }

    res.status(200).json({ message: 'Файл успішно видалено.' });
  } catch (error) {
    console.error('❌ deleteMediaFile error:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};

// Отримання списку файлів
exports.getMediaFiles = async (req, res) => {
  try {
    const files = await sequelize.query(
      `SELECT * FROM media_files`,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json(files);
  } catch (error) {
    console.error('❌ getMediaFiles error:', error);
    res.status(500).json({ message: 'Помилка сервера.', error });
  }
};
