const adminPermissionsModel = require('../models/adminPermissionsModel');

// Отримати всі записи
const getAllAdminPermissions = async (req, res) => {
  try {
    const permissions = await adminPermissionsModel.getAllAdminPermissions();
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
    const permission = await adminPermissionsModel.getAdminPermissionById(admin_id);
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
    const newPermission = await adminPermissionsModel.createAdminPermission(admin_id, permission_id, assigned_at);
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
    const updatedPermission = await adminPermissionsModel.updateAdminPermission(admin_id, permission_id, assigned_at);
    if (updatedPermission) {
      res.json(updatedPermission);
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
    const deletedPermission = await adminPermissionsModel.deleteAdminPermission(admin_id);
    if (deletedPermission) {
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
    const result = await adminPermissionsModel.assignFullAdminPermissions(admin_id, permission_id);
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
