const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Process customer checkout details
// @route   POST /api/customers/checkout
// @access  Public
exports.processCustomerCheckout = async (req, res) => {
  try {
    const { name, email, phone, addressLine1, addressLine2, city, state, country, pincode, password } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists, we might want to update their address/phone if they provide new ones during checkout
      user.phone = phone || user.phone;
      if (addressLine1) {
        user.address = {
          addressLine1,
          addressLine2,
          city,
          state,
          country,
          pincode
        };
      }
      // If they provided a password (creating an account from checkout), and didn't have one before
      if (password && !user.password) {
        user.password = password;
      }
      
      await user.save();
    } else {
      // Create new Guest Customer (Role 3)
      user = await User.create({
        name,
        email,
        phone,
        password: password || undefined, // undefined if they didn't provide one
        role: 3,
        isVerified: false, // Guests don't need verification unless they sign up fully
        address: {
          addressLine1,
          addressLine2,
          city,
          state,
          country,
          pincode
        }
      });
    }

    res.status(200).json({
      message: 'Customer details saved successfully',
      customer: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin/Support
exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 3 }).select('-password');
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single customer by ID
// @route   GET /api/customers/:id
// @access  Private/Admin/Support
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 3 }).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders for a specific customer
// @route   GET /api/customers/:id/orders
// @access  Private/Admin/Support
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
