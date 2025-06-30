// backend/controllers/applicationController.js
const { QueryTypes } = require("sequelize");
const sequelize      = require("../config/database");
const { io }         = require("../index");

/* ────────────────────────────────────────── */
/* 1. Створення заявки                       */
/* ────────────────────────────────────────── */
const createApplication = async (req, res) => {
  console.group("🚀  [POST] /api/applicationRoutes  ▸  createApplication");
  try {
    /* 1-A. Вхідні дані */
    const { user_id, title, content, idea_id, type } = req.body;
    console.log("📥 Вхідні:", { user_id, title, content, idea_id, type });

    /* 1-B. Валідація */
    if (!user_id || !title || !content || !idea_id || !type) {
      console.warn("⚠️ Не всі дані заповнені");
      return res.status(400).json({ message: "Не всі необхідні дані заповнені!" });
    }
    if (!["idea", "problem"].includes(type)) {
      console.warn("⚠️ Недопустимий тип", type);
      return res.status(400).json({ message: "Неправильний тип заявки!" });
    }

    /* 1-C. Перевірка на дубль */
    console.log("🔄 Перевіряємо дубль…");
    const duplicate = await sequelize.query(
      `SELECT id FROM applications WHERE user_id = :user_id AND idea_id = :idea_id`,
      { replacements: { user_id, idea_id }, type: QueryTypes.SELECT }
    );
    console.log("🔄 Результат перевірки:", duplicate);

    if (duplicate.length) {
      console.warn("🚫 Дубль знайдено");
      return res.status(409).json({ message: "Заявку вже створено для цієї ідеї." });
    }

    /* 1-D. Створення заявки */
    console.log("🧾 Створюємо запис у БД…");
    const [rows] = await sequelize.query(
      `INSERT INTO applications 
       (user_id, title, content, idea_id, type, status, created_at, updated_at)
       VALUES (:user_id, :title, :content, :idea_id, :type, 'draft', NOW(), NOW())
       RETURNING *`,
      { replacements: { user_id, title, content, idea_id, type }, type: QueryTypes.INSERT }
    );

    const newApplication = rows?.[0];
    console.log("✅ Запис створено:", newApplication);

    if (!newApplication) {
      console.error("❌ INSERT повернув порожній масив");
      return res.status(500).json({ message: "Помилка збереження заявки." });
    }

    /* 1-E. Оновлення статусу ідеї */
    console.log("🔧 Оновлюємо статус ідеї …");
    await sequelize.query(
      `UPDATE ideas SET status = 'applied', updated_at = NOW() WHERE id = :idea_id`,
      { replacements: { idea_id }, type: QueryTypes.UPDATE }
    );
    console.log("🟢 Статус ідеї оновлено");

    /* 1-F. WebSocket повідомлення */
    try {
      console.log("📡 Відправляємо подію WS …");
      io.emit("application_created", { idea_id, user_id, title, type });
      console.log("📡 Подію надіслано");
    } catch (wsErr) {
      console.warn("⚠️ WS помилка:", wsErr.message);
    }

    console.log("🎉 Заявку створено успішно");
    res.status(201).json(newApplication);
  } catch (err) {
    console.error("❌ Помилка createApplication:", err);
    res.status(500).json({ message: "Внутрішня помилка сервера" });
  } finally {
    console.groupEnd();
  }
};

/* ────────────────────────────────────────── */
/* 2. Отримання всіх заявок                  */
/* ────────────────────────────────────────── */
const getAllApplications = async (req, res) => {
  console.group("📄  getAllApplications");
  try {
    const applications = await sequelize.query(
      `SELECT a.*, u.first_name, u.last_name
       FROM applications a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC`,
      { type: QueryTypes.SELECT }
    );
    console.log("🔢 Рядків:", applications.length);
    res.json(applications);
  } catch (err) {
    console.error("❌ Помилка getAllApplications:", err);
    res.status(500).json({ message: "Не вдалося отримати заявки" });
  } finally {
    console.groupEnd();
  }
};

/* ────────────────────────────────────────── */
/* 3. Отримання однієї заявки                */
/* ────────────────────────────────────────── */
const getApplicationById = async (req, res) => {
  console.group("🔍  getApplicationById");
  try {
    const { id } = req.params;
    console.log("ID =", id);

    const [app] = await sequelize.query(
      `SELECT a.*, u.first_name, u.last_name
       FROM applications a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!app) {
      console.warn("🚫 Не знайдено");
      return res.status(404).json({ message: "Заявка не знайдена" });
    }
    res.json(app);
  } catch (err) {
    console.error("❌ Помилка getApplicationById:", err);
    res.status(500).json({ message: "Не вдалося отримати заявку" });
  } finally {
    console.groupEnd();
  }
};

/* ────────────────────────────────────────── */
/* 4. Оновлення заявки                       */
/* ────────────────────────────────────────── */
const updateApplication = async (req, res) => {
  console.group("✏️  updateApplication");
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;
    console.log("➡️", { id, title, content, status });

    const [updated] = await sequelize.query(
      `UPDATE applications
       SET title = :title, content = :content, status = :status, updated_at = NOW()
       WHERE id = :id RETURNING *`,
      { replacements: { title, content, status, id }, type: QueryTypes.UPDATE }
    );

    if (!updated) {
      console.warn("🚫 Не знайдено запис для update");
      return res.status(404).json({ message: "Заявка не знайдена" });
    }

    console.log("✅ Оновлено:", updated);
    res.json({ message: "Заявку оновлено успішно" });
  } catch (err) {
    console.error("❌ Помилка updateApplication:", err);
    res.status(500).json({ message: "Не вдалося оновити заявку" });
  } finally {
    console.groupEnd();
  }
};

/* ────────────────────────────────────────── */
/* 5. Видалення заявки                       */
/* ────────────────────────────────────────── */
const deleteApplication = async (req, res) => {
  console.group("🗑️  deleteApplication");
  try {
    const { id } = req.params;
    console.log("ID =", id);

    const [deleted] = await sequelize.query(
      `DELETE FROM applications WHERE id = :id RETURNING *`,
      { replacements: { id }, type: QueryTypes.DELETE }
    );

    if (!deleted) {
      console.warn("🚫 Не знайдено для delete");
      return res.status(404).json({ message: "Заявка не знайдена" });
    }

    console.log("✅ Видалено:", deleted);
    res.json({ message: "Заявку успішно видалено" });
  } catch (err) {
    console.error("❌ Помилка deleteApplication:", err);
    res.status(500).json({ message: "Не вдалося видалити заявку" });
  } finally {
    console.groupEnd();
  }
};

/* ────────────────────────────────────────── */
/* 6. Оновлення заявки рішенням журі         */
/* ────────────────────────────────────────── */
const updateApplicationByJury = async (req, res) => {
  console.group("🏆  updateApplicationByJury");
  try {
    const { id } = req.params;
    const { jury_comment, decision_type, postpone, review_comment } = req.body;
    console.log("➡️", { id, jury_comment, decision_type, postpone, review_comment });

    if (!jury_comment || !decision_type) {
      console.warn("⚠️ Не заповнено обовʼязкові поля журі");
      return res.status(400).json({ message: "Коментар журі та тип рішення обов’язкові" });
    }

    let postponedDate = null;
    if (postpone) {
      postponedDate = new Date();
      postponedDate.setMonth(postponedDate.getMonth() + 7);
    }

    const [updated] = await sequelize.query(
      `UPDATE applications 
       SET jury_comment = :jury_comment, decision_type = :decision_type, review_comment = :review_comment,
           updated_at = NOW(), status = CASE
             WHEN :postponedDate IS NOT NULL THEN 'postponed'
             ELSE 'reviewed'
           END, locked_by = NULL
       WHERE id = :id RETURNING *`,
      {
        replacements: { jury_comment, decision_type, review_comment, postponedDate, id },
        type: QueryTypes.UPDATE,
      }
    );

    if (!updated) {
      console.warn("🚫 Не знайдено для updateByJury");
      return res.status(404).json({ message: "Заявка не знайдена" });
    }

    console.log("✅ Оновлено рішенням журі:", updated);
    res.json({ message: "Рішення журі збережено успішно" });
  } catch (err) {
    console.error("❌ Помилка updateApplicationByJury:", err);
    res.status(500).json({ message: "Не вдалося оновити заявку" });
  } finally {
    console.groupEnd();
  }
};

/* ────────────────────────────────────────── */
module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  updateApplicationByJury,
};
