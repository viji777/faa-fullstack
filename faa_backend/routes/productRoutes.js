const express = require('express');
const router = express.Router();
const { protect, adminAndSupport } = require('../middleware/authMiddleware');
const {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Public routes
router.route('/')
  .get(getProducts);

router.route('/slug/:slug')
  .get(getProductBySlug);

router.route('/:id')
  .get(getProductById);

// Admin & Support only routes
router.use(protect);
router.use(adminAndSupport);

router.route('/')
  .post(createProduct);

router.route('/:id')
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
