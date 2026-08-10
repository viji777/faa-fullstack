const express = require('express');
const router = express.Router();
const { protect, adminAndSupport } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

// Apply middleware to all dashboard routes
router.use(protect);
router.use(adminAndSupport);

// @route   GET /api/dashboard/stats
router.route('/stats').get(getDashboardStats);

module.exports = router;
