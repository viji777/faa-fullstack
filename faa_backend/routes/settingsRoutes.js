const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, adminAndSupport } = require('../middleware/authMiddleware');

// Define routes
router.get('/', getSettings);
// Only Admin can update global settings. Currently adminAndSupport allows both.
// Let's create an adminOnly middleware if needed, but for now we can use adminAndSupport 
// and check inside the controller, or we just rely on the frontend hiding it.
// Actually, let's use a custom middleware to ensure only Admin (role=1) can update settings.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 1) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

router.put('/', protect, adminOnly, updateSettings);

module.exports = router;
