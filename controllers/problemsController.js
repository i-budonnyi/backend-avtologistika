const sequelize = require("../config/database"); // ✅ Підключення до БД
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Middleware для перевірки JWT
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[authenticateUser] ❌ Відсутній токен авторизації.");
    return res.status(401).json({ message: "Необхідно авторизуватися" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log("[authenticateUser] ✅ Авторизація успішна:", req.user);
    next();
  } catch (error) {
    console.error("[authenticateUser] ❌ Помилка перевірки токена:", error);
    return res.status(403).json({ message: "Невірний або протермінований токен" });
  }
};

// ✅ Отримати список амбасадорів
const getAllAmbassadors = async (req, res) => {
  try {
    console.log("[getAllAmbassadors] 🚀 Отримання списку амбасадорів...");

    const ambassadors = await sequelize.query(
      `SELECT id, first_name, last_name, email FROM ambassadors`,
      { type: QueryTypes.SELECT }
    );

    console.log("[getAllAmbassadors] ✅ Відправляємо список амбасадорів:", ambassadors);
    res.status(200).json(ambassadors);
  } catch (error) {
    console.error("[getAllAmbassadors] ❌ Помилка:", error);
    res.status(500).json({ message: "Помилка отримання списку амбасадорів", error: error.message });
  }
};

// ✅ Отримати всі проблеми
const getAllProblems = async (req, res) => {
  try {
    console.log("[getAllProblems] Запит отримано...");

    const problems = await sequelize.query(
      `SELECT p.id, p.title, p.description, p.status, 
              u.first_name AS user_first_name, u.last_name AS user_last_name,
              a.id AS ambassador_id, a.first_name AS ambassador_first_name, a.last_name AS ambassador_last_name
       FROM problems p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN ambassadors a ON p.ambassador_id = a.id`,
      { type: QueryTypes.SELECT }
    );

    console.log(`[getAllProblems] ✅ Отримано ${problems.length} проблем.`);
    res.status(200).json(problems);
  } catch (error) {
    console.error("[getAllProblems] ❌ Помилка:", error);
    res.status(500).json({ message: "Помилка отримання проблем", error: error.message });
  }
};

// ✅ Отримати проблеми конкретного користувача
const getUserProblems = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      console.error("[PROBLEMS] ❌ Не вдалося отримати user_id з req.user.");
      return res.status(401).json({ message: "Необхідно авторизуватися." });
    }

    const userId = req.user.user_id;
    console.log(`[PROBLEMS] 🔍 Отримання проблем для user_id = ${userId}`);

    const problems = await sequelize.query(
      `SELECT * FROM problems WHERE user_id = :userId ORDER BY created_at DESC`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    if (!problems || problems.length === 0) {
      console.warn("[PROBLEMS] ⚠️ Користувач ще не подав жодної проблеми.");
      return res.status(404).json({ message: "У вас ще немає поданих проблем." });
    }

    console.log(`[PROBLEMS] ✅ Отримано ${problems.length} проблем.`);
    res.status(200).json(problems);
  } catch (error) {
    console.error("[ERROR] ❌ Помилка отримання проблем користувача:", error);
    res.status(500).json({ message: "Помилка отримання проблем", error: error.message });
  }
};

// ✅ Створити нову проблему
const createProblem = async (req, res) => {
  try {
    console.log("[createProblem] Запит на створення нової проблеми...");

    if (!req.user || !req.user.user_id) {
      console.error("[createProblem] ❌ Не вдалося отримати user_id з req.user.");
      return res.status(401).json({ message: "Авторизація потрібна." });
    }

    const { ambassador_id, title, description } = req.body;
    const user_id = req.user.user_id;

    await sequelize.query(
      `INSERT INTO problems (user_id, ambassador_id, title, description, status, created_at, updated_at)
       VALUES (:user_id, :ambassador_id, :title, :description, 'pending', NOW(), NOW())`,
      { replacements: { user_id, ambassador_id, title, description }, type: QueryTypes.INSERT }
    );

    console.log("[createProblem] ✅ Проблема успішно створена.");
    res.status(201).json({ message: "Проблема успішно подана" });
  } catch (error) {
    console.error("[createProblem] ❌ Помилка створення проблеми:", error);
    res.status(500).json({ message: "Помилка створення проблеми", error: error.message });
  }
};

// ✅ Видалити проблему
const deleteProblem = async (req, res) => {
  try {
    console.log("[deleteProblem] Запит отримано...");
    const { id } = req.params;

    const result = await sequelize.query(
      `DELETE FROM problems WHERE id = :id`,
      { replacements: { id }, type: QueryTypes.DELETE }
    );

    if (!result || result[0] === 0) {
      console.error(`[deleteProblem] ❌ Проблему з ID ${id} не знайдено.`);
      return res.status(404).json({ message: "Проблема не знайдена" });
    }

    console.log(`[deleteProblem] ✅ Проблему з ID ${id} видалено.`);
    res.status(200).json({ message: "Проблему успішно видалено" });
  } catch (error) {
    console.error("[deleteProblem] ❌ Помилка видалення проблеми:", error);
    res.status(500).json({ message: "Помилка видалення проблеми", error: error.message });
  }
};

// ✅ Експортуємо функції
module.exports = {
  getAllProblems,
  getUserProblems,
  createProblem,
  deleteProblem, // 🛠️ Переконайтесь, що функція правильно експортується
  getAllAmbassadors,
  authenticateUser,
};
