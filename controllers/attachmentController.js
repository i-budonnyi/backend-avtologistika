// controllers/attachmentController.js
const Attachment = require("../models/attachment");
const multer = require("multer");
const path = require("path");

// Налаштування для зберігання файлів
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Директорія для збереження файлів
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Унікальна назва файлу
  },
});

// Middleware для завантаження файлів
const upload = multer({ storage });

// Завантаження файлу та запис у БД
exports.uploadFile = [
  upload.single("file"), // Очікуємо один файл із ключем "file"
  async (req, res) => {
    try {
      const { application_id } = req.body; // ID заявки
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Зберігаємо інформацію про файл у БД
      const attachment = await Attachment.create({
        application_id,
        file_name: file.originalname,
        file_path: file.path,
      });

      res.status(201).json({
        message: "File uploaded successfully",
        attachment,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
];
