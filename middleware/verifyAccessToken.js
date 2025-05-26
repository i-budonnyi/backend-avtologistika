const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers.authorization;
  console.log("🧪 [verifyAccessToken] Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("⚠️ Відсутній або некоректний заголовок Authorization");
    return res.status(401).json({ message: "Доступ заборонено: токен відсутній або некоректний." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log("✅ [verifyAccessToken] Токен валідний. Декодований користувач:", decoded);
    next();
  } catch (error) {
    console.error("❌ [verifyAccessToken] Помилка перевірки токена:", error.message);
    return res.status(403).json({ message: "Недійсний або прострочений токен.", error: error.message });
  }
};

module.exports = verifyAccessToken;
