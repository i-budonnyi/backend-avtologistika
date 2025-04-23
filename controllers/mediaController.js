const MediaFile = require('../models/MediaFile');

// Створення публікації
exports.createMediaFile = async (req, res) => {
    try {
        const { uploader_id, file_name, file_path, file_size } = req.body;

        if (!uploader_id || !file_name || !file_path) {
            return res.status(400).json({ message: 'Усі поля є обов’язковими.' });
        }

        const mediaFile = await MediaFile.create({
            uploader_id,
            file_name,
            file_path,
            file_size,
        });

        res.status(201).json({ message: 'Файл успішно опубліковано.', mediaFile });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Оновлення публікації
exports.updateMediaFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { file_name, file_path } = req.body;

        const updatedFile = await MediaFile.update(
            { file_name, file_path },
            { where: { id } }
        );

        if (!updatedFile[0]) {
            return res.status(404).json({ message: 'Файл не знайдено.' });
        }

        res.status(200).json({ message: 'Інформацію про файл успішно оновлено.' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Видалення публікації
exports.deleteMediaFile = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedFile = await MediaFile.destroy({
            where: { id },
        });

        if (!deletedFile) {
            return res.status(404).json({ message: 'Файл не знайдено.' });
        }

        res.status(200).json({ message: 'Файл успішно видалено.' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};

// Отримання списку файлів
exports.getMediaFiles = async (req, res) => {
    try {
        const files = await MediaFile.findAll();
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
