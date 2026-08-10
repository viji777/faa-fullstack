const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// All cart routes require authentication (logged in user)
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:itemId')
  .put(updateCartItemQuantity)
  .delete(removeFromCart);

module.exports = router;
