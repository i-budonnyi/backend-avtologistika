const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

// ✅ Додати новий коментар
const addFeedbackMessage = async (req, res) => {
    try {
        console.log(`[REQUEST] POST /feedbackRoutes/add`);
        
        console.log(`[DEBUG] 🔍 req.user:`, JSON.stringify(req.user, null, 2));

        if (!req.user || !req.user.id) {
            console.error(`[ERROR] ❌ req.user або req.user.id не визначено!`);
            return res.status(401).json({ 
                message: "Користувач не авторизований. Відсутній user_id у токені.", 
                user_data: req.user 
            });
        }

        const { idea_id, text } = req.body;
        const sender_id = req.user.id;
        const sender_role = req.user.role || "user"; 

        console.log(`[INPUT] sender_id=${sender_id}, sender_role=${sender_role}, idea_id=${idea_id}, text=${text}`);

        if (!text || text.trim() === "") {
            console.error(`[ERROR] ❌ Коментар не може бути порожнім.`);
            return res.status(400).json({ message: "Коментар не може бути порожнім." });
        }

        if (!idea_id) {
            console.error(`[ERROR] ❌ Необхідно вказати idea_id.`);
            return res.status(400).json({ message: "Необхідно вказати idea_id." });
        }

        await sequelize.query(
            `INSERT INTO feedback_messages (idea_id, sender_id, sender_role, text, created_at)
             VALUES (:idea_id, :sender_id, :sender_role, :text, NOW())`,
            { replacements: { idea_id, sender_id, sender_role, text }, type: QueryTypes.INSERT }
        );

        console.log(`[SUCCESS] ✅ Коментар успішно додано.`);
        res.status(201).json({ message: "Коментар успішно додано." });

    } catch (error) {
        console.error("[ERROR] ❌ Помилка додавання коментаря:", error);
        res.status(500).json({ message: "Помилка додавання коментаря", error: error.message });
    }
};

// ✅ Отримати всі коментарі до ідеї (видимі всім)
const getFeedbackMessages = async (req, res) => {
    try {
        console.log(`[REQUEST] GET /feedbackRoutes/list`);
        
        console.log(`[DEBUG] 🔍 req.user:`, JSON.stringify(req.user, null, 2));

        if (!req.user || !req.user.id) {
            console.error(`[ERROR] ❌ req.user або req.user.id не визначено!`);
            return res.status(401).json({ 
                message: "Користувач не авторизований. Відсутній user_id у токені.", 
                user_data: req.user 
            });
        }

        const { idea_id } = req.query;

        if (!idea_id) {
            console.error(`[ERROR] ❌ Не вказано idea_id.`);
            return res.status(400).json({ message: "Необхідно вказати idea_id." });
        }

        console.log(`[PROCESS] 🔍 Отримання коментарів для ідеї ID=${idea_id}`);

        const messages = await sequelize.query(
            `SELECT fm.id, fm.idea_id, fm.sender_id, fm.sender_role, fm.text, fm.created_at,
                   u.first_name AS sender_first_name, u.last_name AS sender_last_name
            FROM feedback_messages fm
            LEFT JOIN users u ON fm.sender_id = u.id
            WHERE fm.idea_id = :idea_id
            ORDER BY fm.created_at ASC`,
            { replacements: { idea_id }, type: QueryTypes.SELECT }
        );

        console.log(`[SUCCESS] ✅ Отримано ${messages.length} повідомлень.`);
        res.status(200).json(messages);
    } catch (error) {
        console.error("[ERROR] ❌ Помилка отримання коментарів:", error);
        res.status(500).json({ message: "Помилка отримання коментарів", error: error.message });
    }
};

// ✅ Вибір ідеї для створення заявки
const selectIdeaForApplication = async (req, res) => {
    try {
        console.log(`[REQUEST] POST /feedbackRoutes/select-idea`);

        if (!req.user || !req.user.id) {
            console.error(`[ERROR] ❌ req.user або req.user.id не визначено!`);
            return res.status(401).json({ message: "Користувач не авторизований." });
        }

        const { idea_id } = req.body;
        const user_id = req.user.id;

        if (!idea_id) {
            console.error(`[ERROR] ❌ Необхідно вказати idea_id.`);
            return res.status(400).json({ message: "Необхідно вказати idea_id." });
        }

        console.log(`[PROCESS] 🔍 Користувач ${user_id} вибрав ідею ${idea_id} для заявки.`);

        // Зберігаємо вибір у тимчасову таблицю або сесію
        await sequelize.query(
            `INSERT INTO selected_ideas (user_id, idea_id, selected_at)
             VALUES (:user_id, :idea_id, NOW())
             ON CONFLICT (user_id) DO UPDATE SET idea_id = EXCLUDED.idea_id, selected_at = NOW()`,
            { replacements: { user_id, idea_id }, type: QueryTypes.INSERT }
        );

        console.log(`[SUCCESS] ✅ Вибір ідеї збережено.`);
        res.status(200).json({ message: "Ідея вибрана для заявки." });

    } catch (error) {
        console.error("[ERROR] ❌ Помилка вибору ідеї:", error);
        res.status(500).json({ message: "Помилка вибору ідеї", error: error.message });
    }
};

module.exports = { addFeedbackMessage, getFeedbackMessages, selectIdeaForApplication };
