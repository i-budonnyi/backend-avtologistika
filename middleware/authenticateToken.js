const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Ambassador = require("../models/Ambassador");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.error("[AUTH] Відсутній токен авторизації.");
    return res.status(401).json({ message: "Авторизація потрібна." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Підвантаження користувача разом із амбасадором
    const user = await User.findByPk(decoded.user_id, {
      include: [
        {
          model: Ambassador,
          as: "user_ambassador", // Унікальний псевдонім для зв’язку
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] }, // Виключаємо ці поля
    });

    if (!user) {
      console.error("[AUTH] Невалідний токен або користувач не існує.");
      return res.status(401).json({ message: "Невалідний токен або користувач не існує." });
    }

    req.user = user; // Зберігаємо користувача в req
    next();
  } catch (error) {
    console.error("[AUTH] Помилка перевірки токена:", error.message);
    return res.status(403).json({ message: "Невалідний токен", error: error.message });
  }
};

module.exports = { authenticateUser };
