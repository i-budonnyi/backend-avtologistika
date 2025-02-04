const db = require('../config/db'); // Правильний шлях до файлу db.js

// Отримати всіх адміністраторів
exports.getAllAdministrators = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM administrators ORDER BY id');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching administrators:', error);
    res.status(500).json({ error: 'Failed to fetch administrators' });
  }
};

// Додати нового адміністратора
exports.createAdministrator = async (req, res) => {
  const { first_name, last_name, phone, email, password } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO administrators (first_name, last_name, phone, email, password, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [first_name, last_name, phone, email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating administrator:', error);
    res.status(500).json({ error: 'Failed to create administrator' });
  }
};

// Видалити адміністратора за ID
exports.deleteAdministrator = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM administrators WHERE id = $1', [id]);
    res.status(204).send(); // Успішно, без контенту
  } catch (error) {
    console.error('Error deleting administrator:', error);
    res.status(500).json({ error: 'Failed to delete administrator' });
  }
};
