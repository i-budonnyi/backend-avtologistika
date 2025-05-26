const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers["authorization"];
  console.log("🧪 [verifyAccessToken] Authorization header:", authHeader);

  // 🔒 Перевірка формату заголовка
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("⛔ Невірний заголовок Authorization");
    return res.status(401).json({
      message: "Доступ заборонено: токен відсутній або некоректний.",
      example: "Authorization: Bearer <your_token>"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // 🧾 Перевірка наявності обов'язкових полів
    if (!decoded?.id) {
      console.warn("⚠️ Токен не містить ID користувача:", decoded);
      return res.status(403).json({
        message: "Недійсний токен: відсутній user ID у payload.",
        decoded
      });
    }

    req.user = decoded;
    console.log("✅ Токен валідний:", decoded);
    next();
  } catch (error) {
    console.error("❌ Помилка перевірки токена:", error.message);
    return res.status(403).json({
      message: "Недійсний або прострочений токен.",
      error: error.message
    });
  }
};

module.exports = verifyAccessToken;
