const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// 🔐 Middleware для перевірки JWT токена
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("[authMiddleware] 🔍 Перевірка заголовка Authorization:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[authMiddleware] ❌ Відсутній або некоректний заголовок Authorization!");
    return res.status(401).json({ message: "Неавторизований: відсутній або неправильний токен" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.id) {
      console.warn("[authMiddleware] ❌ Токен не містить 'id' користувача!");
      return res.status(401).json({ message: "Недійсний токен: відсутній id" });
    }

    req.user = {
      id: decoded.id,
      first_name: decoded.first_name || null,
      last_name: decoded.last_name || null,
      email: decoded.email || null
    };

    console.log("[authMiddleware] ✅ Авторизація пройдена:", req.user);
    next();
  } catch (error) {
    console.error("[authMiddleware] ❌ Помилка перевірки токена:", error.message);
    return res.status(403).json({ message: "Недійсний або протермінований токен" });
  }
};

module.exports = { authenticateUser };
