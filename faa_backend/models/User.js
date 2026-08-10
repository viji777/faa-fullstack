const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    // Not required for Guest Customers
    required: false,
    minlength: 6,
    select: false // Do not return password by default
  },
  role: {
    type: Number,
    enum: [1, 2, 3], // 1: Admin, 2: Support, 3: Customer
    default: 2
  },
  phone: {
    type: String
  },
  address: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  },
  lastOtpSentAt: {
    type: Date
  }
}, { timestamps: true });

// Encrypt password using bcrypt
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
