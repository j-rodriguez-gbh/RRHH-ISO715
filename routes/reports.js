const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');
const { authenticated, hrManagerOrAdmin } = require('../middleware/auth');

// All report routes require HR manager or admin permissions
router.use(authenticated);
router.use(hrManagerOrAdmin);

// Report routes
router.get('/new-employees', ReportController.newEmployeesReport);
router.get('/candidates-summary', ReportController.candidatesSummaryReport);

module.exports = router;