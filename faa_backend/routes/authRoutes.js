const express = require('express');
const router = express.Router();
const {
  signup,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  customerSignup,
  customerLogin,
  customerGoogleLogin
} = require('../controllers/authController');

router.post('/admin/signup', signup);
router.post('/admin/verify-otp', verifyOtp);
router.post('/admin/resend-otp', resendOtp);
router.post('/admin/login', login);
router.post('/admin/forgot-password', forgotPassword);
router.post('/admin/reset-password', resetPassword);

// Customer Routes
router.post('/customer/signup', customerSignup);
router.post('/customer/login', customerLogin);
router.post('/customer/google', customerGoogleLogin);

module.exports = router;
