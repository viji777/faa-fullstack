const express = require('express');
const router = express.Router();
const { protect, adminAndSupport } = require('../middleware/authMiddleware');
const { 
  processCustomerCheckout,
  getCustomers,
  getCustomerById,
  getCustomerOrders
} = require('../controllers/customerController');

// Public route for placing orders / saving customer details
router.post('/checkout', processCustomerCheckout);

// Admin & Support Routes
router.use(protect);
router.use(adminAndSupport);

router.route('/')
  .get(getCustomers);

router.route('/:id')
  .get(getCustomerById);

router.route('/:id/orders')
  .get(getCustomerOrders);

module.exports = router;
