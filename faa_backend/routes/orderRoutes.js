const express = require('express');
const router = express.Router();
const { protect, adminAndSupport } = require('../middleware/authMiddleware');
const {
  placeOrder,
  getOrders,
  getMyOrders,
  updateOrderStatus
} = require('../controllers/orderController');

// All order routes require authentication
router.use(protect);

// Customer routes
router.route('/')
  .post(placeOrder);

router.route('/myorders')
  .get(getMyOrders);

// Admin & Support only routes
router.use(adminAndSupport);

router.route('/')
  .get(getOrders);

router.route('/:id/status')
  .put(updateOrderStatus);

module.exports = router;
