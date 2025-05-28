const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");
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
      const { application_id } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const [attachment] = await sequelize.query(
        `INSERT INTO attachments (application_id, file_name, file_path)
         VALUES ($1, $2, $3)
         RETURNING *`,
        {
          bind: [application_id, file.originalname, file.path],
          type: QueryTypes.INSERT,
        }
      );

      res.status(201).json({
        message: "File uploaded successfully",
        attachment,
      });
    } catch (error) {
      console.error("❌ uploadFile error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];
