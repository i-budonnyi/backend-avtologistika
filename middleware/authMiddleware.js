const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    console.log("[authMiddleware] 🔍 Перевірка заголовка авторизації:", authHeader);

    if (!authHeader) {
        console.warn("[authMiddleware] ❌ Відсутній заголовок Authorization!");
        return res.status(401).json({ message: "Неавторизований: відсутній токен" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        console.warn("[authMiddleware] ❌ Невірний формат токена!");
        return res.status(401).json({ message: "Помилка авторизації: неправильний формат токена" });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("[authMiddleware] ✅ Токен успішно розшифрований:", JSON.stringify(decoded, null, 2));

        if (!decoded.id) {
            console.warn("[authMiddleware] ❌ Токен не містить `id`!");
            return res.status(401).json({ message: "Недійсний токен: відсутній id у токені" });
        }

        req.user = {
            id: decoded.id,
            first_name: decoded.first_name || null,
            last_name: decoded.last_name || null,
            email: decoded.email || null,
            phone: decoded.phone || null
        };

        console.log("[authMiddleware] ✅ Авторизація пройдена, користувач:", req.user);
        next();
    } catch (error) {
        console.error("[authMiddleware] ❌ Недійсний токен!", error);
        return res.status(401).json({ message: "Недійсний токен", error: error.message });
    }
};

module.exports = authenticateToken;
