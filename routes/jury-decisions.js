const express = require("express");
const router = express.Router();
const { 
    getApprovedJuryDecisions, 
    getRejectedJuryDecisions, 
    getReviewAllowedJuryDecisions, 
    getNeedsRevisionJuryDecisions 
} = require("../controllers/juryDecisionsController");
const authenticat = require("../middleware/auth"); // Middleware для авторизації

// ✅ Отримати схвалені рішення журі
router.get("/jury-decisions/approved", authenticat, getApprovedJuryDecisions);

// ✅ Отримати відхилені рішення журі
router.get("/jury-decisions/rejected", authenticat, getRejectedJuryDecisions);

// ✅ Отримати рішення, що дозволені для перегляду
router.get("/jury-decisions/review-allowed", authenticat, getReviewAllowedJuryDecisions);

// ✅ Отримати рішення, що потребують доопрацювання
router.get("/jury-decisions/needs-revision", authenticat, getNeedsRevisionJuryDecisions);

module.exports = router;
