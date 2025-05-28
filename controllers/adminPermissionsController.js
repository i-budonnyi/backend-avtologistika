const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Отримати всі записи
const getAllAdminPermissions = async (req, res) => {
  try {
    const permissions = await sequelize.query(
      `SELECT * FROM admin_permissions`,
      { type: QueryTypes.SELECT }
    );
    res.json(permissions);
  } catch (err) {
    console.error('Error getting admin permissions', err);
    res.status(500).json({ error: 'Something went wrong!' });
  }
};

// Отримати конкретний запис за ID
const getAdminPermissionById = async (req, res) => {
  const { admin_id } = req.params;
  try {
    const [permission] = await sequelize.query(
      `SELECT * FROM admin_permissions WHERE admin_id = $1`,
      { bind: [admin_id], type: QueryTypes.SELECT }
    );
    if (permission) {
      res.json(permission);
    } else {
      res.status(404).json({ error: 'Admin permission not found' });
    }
  } catch (err) {
    console.error('Error getting admin permission by ID', err);
    res.status(500).json({ error: 'Something went wrong!' });
  }
};

// Створити новий запис
const createAdminPermission = async (req, res) => {
  const { admin_id, permission_id, assigned_at } = req.body;
  try {
    const [newPermission] = await sequelize.query(
      `INSERT INTO admin_permissions (admin_id, permission_id, assigned_at)
       VALUES ($1, $2, $3) RETURNING *`,
      { bind: [admin_id, permission_id, assigned_at], type: QueryTypes.INSERT }
    );
    res.status(201).json(newPermission);
  } catch (err) {
    console.error('Error creating admin permission', err);
    res.status(500).json({ error: 'Something went wrong!' });
  }
};

// Оновити запис
const updateAdminPermission = async (req, res) => {
  const { admin_id } = req.params;
  const { permission_id, assigned_at } = req.body;
  try {
    const [updated] = await sequelize.query(
      `UPDATE admin_permissions
       SET permission_id = $1, assigned_at = $2
       WHERE admin_id = $3 RETURNING *`,
      { bind: [permission_id, assigned_at, admin_id], type: QueryTypes.UPDATE }
    );
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Admin permission not found' });
    }
  } catch (err) {
    console.error('Error updating admin permission', err);
    res.status(500).json({ error: 'Something went wrong!' });
  }
};

// Видалити запис
const deleteAdminPermission = async (req, res) => {
  const { admin_id } = req.params;
  try {
    const [deleted] = await sequelize.query(
      `DELETE FROM admin_permissions WHERE admin_id = $1 RETURNING *`,
      { bind: [admin_id], type: QueryTypes.DELETE }
    );
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Admin permission not found' });
    }
  } catch (err) {
    console.error('Error deleting admin permission', err);
    res.status(500).json({ error: 'Something went wrong!' });
  }
};

// Викликати функцію для призначення прав
const assignFullAdminPermissions = async (req, res) => {
  const { admin_id, permission_id } = req.body;
  try {
    const [result] = await sequelize.query(
      `UPDATE admin_permissions
       SET permission_id = $1, assigned_at = NOW()
       WHERE admin_id = $2 RETURNING *`,
      { bind: [permission_id, admin_id], type: QueryTypes.UPDATE }
    );
    res.json(result);
  } catch (err) {
    console.error('Error assigning full admin permissions', err);
    res.status(500).json({ error: 'Something went wrong!' });
  }
};

module.exports = {
  getAllAdminPermissions,
  getAdminPermissionById,
  createAdminPermission,
  updateAdminPermission,
  deleteAdminPermission,
  assignFullAdminPermissions,
};
