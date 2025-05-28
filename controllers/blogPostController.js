const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Створення посту
exports.createPost = async (req, res) => {
  try {
    const { title, content, author_id } = req.body;

    const [post] = await sequelize.query(
      `INSERT INTO blog_posts (title, content, author_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      {
        bind: [title, content, author_id],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json(post);
  } catch (error) {
    console.error('❌ createPost error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Оновлення статусу посту
exports.updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [updated] = await sequelize.query(
      `UPDATE blog_posts
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      {
        bind: [status, id],
        type: QueryTypes.UPDATE,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post status updated successfully" });
  } catch (error) {
    console.error('❌ updatePostStatus error:', error);
    res.status(500).json({ error: error.message });
  }
};
