const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.error("[AUTH] ❌ Відсутній токен авторизації.");
      return res.status(401).json({ message: "Авторизація потрібна." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    console.log("[AUTH] ✅ Токен підтверджено, user_id:", decoded.user_id);

    req.user = { id: decoded.user_id, role: decoded.role || null };
    next();
  } catch (error) {
    console.error("[AUTH] ❌ Помилка перевірки токена:", error.message);
    return res.status(403).json({ message: "Невалідний токен", error: error.message });
  }
};

module.exports = { authenticateUser };
