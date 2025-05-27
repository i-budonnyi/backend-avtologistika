const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token відсутній." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // ⚠️ ОБОВʼЯЗКОВО
    console.log("🟢 Токен валідний:", req.user);
    next();
  } catch (error) {
    console.error("❌ JWT-помилка:", error.message);
    return res.status(403).json({ message: "Недійсний токен." });
  }
};

module.exports = verifyAccessToken;
