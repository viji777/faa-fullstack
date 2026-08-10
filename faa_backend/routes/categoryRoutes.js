const express = require('express');
const router = express.Router();
const { protect, adminAndSupport } = require('../middleware/authMiddleware');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Public routes
router.route('/')
  .get(getCategories);

router.route('/:id')
  .get(getCategoryById);

// Admin & Support only routes
router.use(protect);
router.use(adminAndSupport);

router.route('/')
  .post(createCategory);

router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
