const pool = require('../config/db'); // Підключення до бази даних

// Модель для роботи з таблицею admin_permissions
const getAllAdminPermissions = async () => {
  const result = await pool.query('SELECT * FROM admin_permissions');
  return result.rows;
};

const getAdminPermissionById = async (admin_id) => {
  const result = await pool.query('SELECT * FROM admin_permissions WHERE admin_id = $1', [admin_id]);
  return result.rows[0];
};

const createAdminPermission = async (admin_id, permission_id, assigned_at) => {
  const result = await pool.query(`
    INSERT INTO admin_permissions (admin_id, permission_id, assigned_at)
    VALUES ($1, $2, $3)
    RETURNING admin_id, permission_id, assigned_at;
  `, [admin_id, permission_id, assigned_at]);
  return result.rows[0];
};

const updateAdminPermission = async (admin_id, permission_id, assigned_at) => {
  const result = await pool.query(`
    UPDATE admin_permissions
    SET permission_id = $1, assigned_at = $2
    WHERE admin_id = $3
    RETURNING admin_id, permission_id, assigned_at;
  `, [permission_id, assigned_at, admin_id]);
  return result.rows[0];
};

const deleteAdminPermission = async (admin_id) => {
  const result = await pool.query('DELETE FROM admin_permissions WHERE admin_id = $1 RETURNING admin_id', [admin_id]);
  return result.rows[0];
};

const assignFullAdminPermissions = async (admin_id, permission_id) => {
  const result = await pool.query(`
    SELECT * FROM assign_full_admin_permissions($1, $2);
  `, [admin_id, permission_id]);
  return result.rows;
};

module.exports = {
  getAllAdminPermissions,
  getAdminPermissionById,
  createAdminPermission,
  updateAdminPermission,
  deleteAdminPermission,
  assignFullAdminPermissions,
};
