﻿const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(403).json({ message: "Access denied, no token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Access denied, malformed token" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Зберігаємо розшифровану інформацію про користувача
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token", error: error.message });
    }
};

module.exports = authenticateToken;
