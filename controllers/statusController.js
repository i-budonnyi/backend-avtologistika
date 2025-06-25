const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

let reqId = 0;

const getStatusesByType = async (req, res) => {
  const id = ++reqId;
  const startedAt = Date.now();
  console.info(`🛈 [${id}] ▶️  getStatuses START`);

  const { type } = req.query;
  let sql = "SELECT DISTINCT status FROM statuses";
  const replacements = {};

  if (type) {
    sql += " WHERE type = :type";
    replacements.type = type;
  }
  sql += " ORDER BY status;";

  console.info(`🛈 [${id}] SQL:\n${sql}`);

  try {
    const rows = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
      replacements,
    });

    console.info(`🛈 [${id}] ✓ raw rows:`, rows);

    const statuses = rows
      .map((r) => String(r.status || "").trim())
      .filter((s) => s && s.length > 0);

    console.info(`🛈 [${id}] ✓ cleaned statuses:`, statuses);

    res.status(200).json(statuses);
  } catch (err) {
    console.error(`❌ [${id}] DB error:`, err.message);
    res.status(500).json({
      error: "Помилка при отриманні статусів",
      details: err.message,
    });
  } finally {
    const ms = Date.now() - startedAt;
    console.info(`🛈 [${id}] ⏹  getStatuses END (took ${ms} ms)`);
  }
};

module.exports = { getStatusesByType };
