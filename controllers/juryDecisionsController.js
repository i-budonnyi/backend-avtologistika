const { QueryTypes } = require("sequelize");
const sequelize = require("../config/db"); // Підключення до БД

/**
 * 📌 Отримати схвалені рішення журі з інформацією про автора ідеї та журі
 */
const getApprovedJuryDecisions = async (req, res) => {
    try {
        console.log("📌 Отримуємо схвалені рішення журі...");

        const results = await sequelize.query(
            `SELECT 
                jd.id AS decision_id,
                p.id AS project_id,
                p.name AS project_name,
                p.description AS project_description,
                u.id AS author_id,
                u.first_name AS author_first_name,
                u.last_name AS author_last_name,
                jm.id AS jury_id,
                jm.first_name AS jury_first_name,
                jm.last_name AS jury_last_name,
                jd.decision,
                jd.decision_date
            FROM jury_decisions jd
            JOIN projects p ON jd.project_id = p.id
            JOIN users u ON p.created_by = u.id
            JOIN jury_members jm ON jd.jury_member_id = jm.id
            WHERE jd.decision_type = 'approved' AND jd.approved = true
            ORDER BY jd.decision_date DESC;`,
            { type: QueryTypes.SELECT }
        );

        if (results.length === 0) {
            console.warn("⚠️ Жодного схваленого рішення не знайдено.");
            return res.status(404).json({ message: "❌ Немає схвалених рішень журі." });
        }

        console.log(`✅ Знайдено ${results.length} схвалених рішень.`);
        res.status(200).json(results);
    } catch (error) {
        console.error("❌ Помилка отримання схвалених рішень журі:", error);
        res.status(500).json({ error: "Не вдалося отримати схвалені рішення журі." });
    }
};

/**
 * 📌 Отримати відхилені рішення журі
 */
const getRejectedJuryDecisions = async (req, res) => {
    try {
        console.log("📌 Отримуємо відхилені рішення журі...");

        const results = await sequelize.query(
            `SELECT 
                jd.id AS decision_id,
                p.id AS project_id,
                p.name AS project_name,
                p.description AS project_description,
                u.id AS author_id,
                u.first_name AS author_first_name,
                u.last_name AS author_last_name,
                jm.id AS jury_id,
                jm.first_name AS jury_first_name,
                jm.last_name AS jury_last_name,
                jd.decision,
                jd.decision_date
            FROM jury_decisions jd
            JOIN projects p ON jd.project_id = p.id
            JOIN users u ON p.created_by = u.id
            JOIN jury_members jm ON jd.jury_member_id = jm.id
            WHERE jd.decision_type = 'rejected'
            ORDER BY jd.decision_date DESC;`,
            { type: QueryTypes.SELECT }
        );

        if (results.length === 0) {
            console.warn("⚠️ Жодного відхиленого рішення не знайдено.");
            return res.status(404).json({ message: "❌ Немає відхилених рішень журі." });
        }

        console.log(`✅ Знайдено ${results.length} відхилених рішень.`);
        res.status(200).json(results);
    } catch (error) {
        console.error("❌ Помилка отримання відхилених рішень журі:", error);
        res.status(500).json({ error: "Не вдалося отримати відхилені рішення журі." });
    }
};

/**
 * 📌 Отримати рішення, що дозволені для перегляду
 */
const getReviewAllowedJuryDecisions = async (req, res) => {
    try {
        console.log("📌 Отримуємо рішення, що дозволені для перегляду...");

        const results = await sequelize.query(
            `SELECT 
                jd.id AS decision_id,
                p.id AS project_id,
                p.name AS project_name,
                p.description AS project_description,
                u.id AS author_id,
                u.first_name AS author_first_name,
                u.last_name AS author_last_name,
                jm.id AS jury_id,
                jm.first_name AS jury_first_name,
                jm.last_name AS jury_last_name,
                jd.decision,
                jd.decision_date
            FROM jury_decisions jd
            JOIN projects p ON jd.project_id = p.id
            JOIN users u ON p.created_by = u.id
            JOIN jury_members jm ON jd.jury_member_id = jm.id
            WHERE jd.decision_type = 'review_allowed'
            ORDER BY jd.decision_date DESC;`,
            { type: QueryTypes.SELECT }
        );

        if (results.length === 0) {
            console.warn("⚠️ Жодного рішення для перегляду не знайдено.");
            return res.status(404).json({ message: "❌ Немає рішень, що дозволені для перегляду." });
        }

        console.log(`✅ Знайдено ${results.length} рішень для перегляду.`);
        res.status(200).json(results);
    } catch (error) {
        console.error("❌ Помилка отримання рішень для перегляду:", error);
        res.status(500).json({ error: "Не вдалося отримати рішення для перегляду." });
    }
};

/**
 * 📌 Отримати рішення, що потребують доопрацювання
 */
const getNeedsRevisionJuryDecisions = async (req, res) => {
    try {
        console.log("📌 Отримуємо рішення, що потребують доопрацювання...");

        const results = await sequelize.query(
            `SELECT 
                jd.id AS decision_id,
                p.id AS project_id,
                p.name AS project_name,
                p.description AS project_description,
                u.id AS author_id,
                u.first_name AS author_first_name,
                u.last_name AS author_last_name,
                jm.id AS jury_id,
                jm.first_name AS jury_first_name,
                jm.last_name AS jury_last_name,
                jd.decision,
                jd.decision_date
            FROM jury_decisions jd
            JOIN projects p ON jd.project_id = p.id
            JOIN users u ON p.created_by = u.id
            JOIN jury_members jm ON jd.jury_member_id = jm.id
            WHERE jd.decision_type = 'needs_revision'
            ORDER BY jd.decision_date DESC;`,
            { type: QueryTypes.SELECT }
        );

        if (results.length === 0) {
            console.warn("⚠️ Жодного рішення для доопрацювання не знайдено.");
            return res.status(404).json({ message: "❌ Немає рішень, що потребують доопрацювання." });
        }

        console.log(`✅ Знайдено ${results.length} рішень для доопрацювання.`);
        res.status(200).json(results);
    } catch (error) {
        console.error("❌ Помилка отримання рішень для доопрацювання:", error);
        res.status(500).json({ error: "Не вдалося отримати рішення для доопрацювання." });
    }
};

module.exports = { 
    getApprovedJuryDecisions, 
    getRejectedJuryDecisions, 
    getReviewAllowedJuryDecisions,
    getNeedsRevisionJuryDecisions 
};
