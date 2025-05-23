﻿const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Доступ заборонено: токен відсутній." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // прикріплюємо payload до запиту
    next();
  } catch (error) {
    return res.status(403).json({ message: "Недійсний або прострочений токен." });
  }
};

module.exports = verifyAccessToken;
