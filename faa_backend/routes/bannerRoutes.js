const express = require('express');
const router = express.Router();
const { protect, adminAndSupport } = require('../middleware/authMiddleware');
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');

// Public route
router.route('/')
  .get(getBanners);

// Admin & Support only routes
router.use(protect);
router.use(adminAndSupport);

router.route('/')
  .post(createBanner);

router.route('/:id')
  .put(updateBanner)
  .delete(deleteBanner);

module.exports = router;
