const express = require('express');
const router = express.Router();
const {
    createMediaFile,
    updateMediaFile,
    deleteMediaFile,
    getMediaFiles,
} = require('../controllers/mediaController');

// Роут для створення публікації
router.post('/', createMediaFile);

// Роут для оновлення публікації
router.put('/:id', updateMediaFile);

// Роут для видалення публікації
router.delete('/:id', deleteMediaFile);

// Роут для отримання списку файлів
router.get('/', getMediaFiles);

module.exports = router;
