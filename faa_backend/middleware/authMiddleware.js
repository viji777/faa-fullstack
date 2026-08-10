const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin only middleware
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 1) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Admin and Support only middleware
exports.adminAndSupport = (req, res, next) => {
  if (req.user && (req.user.role === 1 || req.user.role === 2)) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized, requires Admin or Support role' });
  }
};
