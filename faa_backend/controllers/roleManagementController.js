const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all support and customer users
// @route   GET /api/admin/roles/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Get all users except admins (role 1)
    const users = await User.find({ role: { $ne: 1 } }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new support staff or user
// @route   POST /api/admin/roles/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Prevent creating admin accounts via this route, default to Support (2)
    const userRole = role === 1 ? 2 : (role || 2);

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      isVerified: true // Admin created users are pre-verified
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update support staff or customer
// @route   PUT /api/admin/roles/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 1) {
      return res.status(403).json({ message: 'Cannot update other admins through this route' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password; // pre-save hook will hash it
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/roles/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 1) {
      return res.status(403).json({ message: 'Cannot delete an admin' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update own admin profile (email, name, password)
// @route   PUT /api/admin/roles/profile
// @access  Private/Admin
exports.updateSelf = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.phone) {
      user.phone = req.body.phone;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
