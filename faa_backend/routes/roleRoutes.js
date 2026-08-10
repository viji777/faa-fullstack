const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateSelf
} = require('../controllers/roleManagementController');

// All routes require authentication and admin privileges
router.use(protect);
router.use(adminOnly);

router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

router.route('/profile')
  .put(updateSelf);

module.exports = router;
