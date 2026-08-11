const express = require('express');
const router = express.Router();
const { protect, adminAndSupport } = require('../middleware/authMiddleware');
const { 
  processCustomerCheckout,
  getCustomers,
  getCustomerById,
  getCustomerOrders,
  getMe,
  updateMyProfile,
  updateMyAddress,
  updateMyPassword
} = require('../controllers/customerController');

// Public route for placing orders / saving customer details
router.post('/checkout', processCustomerCheckout);

// Protected routes (Customer & Admin)
router.use(protect);

router.get('/me', getMe);
router.put('/me/profile', updateMyProfile);
router.put('/me/address', updateMyAddress);
router.put('/me/password', updateMyPassword);

// Admin & Support Routes
router.use(adminAndSupport);

router.route('/')
  .get(getCustomers);

router.route('/:id')
  .get(getCustomerById);

router.route('/:id/orders')
  .get(getCustomerOrders);

module.exports = router;
