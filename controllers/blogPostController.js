// controllers/blogPostController.js
const BlogPost = require("../models/blogPost");

// Створення посту
exports.createPost = async (req, res) => {
  try {
    const { title, content, author_id } = req.body;
    const post = await BlogPost.create({ title, content, author_id });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Оновлення статусу посту
exports.updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await BlogPost.update({ status }, { where: { id } });
    res.status(200).json({ message: "Post status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
