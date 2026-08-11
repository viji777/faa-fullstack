const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new admin/support user
// @route   POST /api/auth/admin/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role (first user is admin)
    const count = await User.countDocuments();
    const role = count === 0 ? 1 : 2;

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      otp,
      otpExpiry,
      lastOtpSentAt: new Date()
    });

    if (user) {
      // Send Email
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #333;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="background-color: #0d3b26; padding: 30px; text-align: center; border-bottom: 3px solid #d4af37;">
              <img src="https://res.cloudinary.com/r15ilp4c/image/upload/v1785316371/faa_assets/faa_logo.jpg" alt="Faa Nuts Logo" style="max-width: 120px; border-radius: 8px;" />
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #0d3b26; font-size: 24px; margin-top: 0; text-align: center;">Welcome to Faa Admin!</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555; text-align: center;">Thank you for registering. To verify your account, please use the One-Time Password (OTP) below:</p>
              <div style="text-align: center; margin: 35px 0;">
                <span style="display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px;">${otp}</span>
              </div>
              <p style="font-size: 14px; color: #888; text-align: center; margin-bottom: 0;">This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Faa Nuts. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Admin Panel - Verify Your Email',
          html: emailHtml
        });
      } catch (error) {
        // We do not fail the registration if email fails, but we should inform them.
        console.error('Email failed to send for signup:', error);
      }

      res.status(201).json({
        message: 'User registered successfully. Please check your email for the OTP.',
        email: user.email
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/admin/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      message: 'Account verified successfully',
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/admin/resend-otp
// @access  Public
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Check 60s cooldown
    const now = new Date();
    if (user.lastOtpSentAt) {
      const diffInSeconds = (now - user.lastOtpSentAt) / 1000;
      if (diffInSeconds < 60) {
        return res.status(429).json({ 
          message: `Please wait ${Math.ceil(60 - diffInSeconds)} seconds before requesting another OTP` 
        });
      }
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.lastOtpSentAt = now;
    await user.save();

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #333;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background-color: #0d3b26; padding: 30px; text-align: center; border-bottom: 3px solid #d4af37;">
            <img src="https://res.cloudinary.com/r15ilp4c/image/upload/v1785316371/faa_assets/faa_logo.jpg" alt="Faa Nuts Logo" style="max-width: 120px; border-radius: 8px;" />
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #0d3b26; font-size: 24px; margin-top: 0; text-align: center;">Your New OTP</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555; text-align: center;">As requested, here is your new One-Time Password (OTP) for account verification:</p>
            <div style="text-align: center; margin: 35px 0;">
              <span style="display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center; margin-bottom: 0;">This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Faa Nuts. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Admin Panel - New OTP',
      html: emailHtml
    });

    res.status(200).json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/admin/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    const isMatch = await user.matchPassword(password);

    if (user && isMatch) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/admin/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Check 60s cooldown
    const now = new Date();
    if (user.lastOtpSentAt) {
      const diffInSeconds = (now - user.lastOtpSentAt) / 1000;
      if (diffInSeconds < 60) {
        return res.status(429).json({ 
          message: `Please wait ${Math.ceil(60 - diffInSeconds)} seconds before requesting another OTP` 
        });
      }
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.lastOtpSentAt = now;
    await user.save();

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #333;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background-color: #0d3b26; padding: 30px; text-align: center; border-bottom: 3px solid #d4af37;">
            <img src="https://res.cloudinary.com/r15ilp4c/image/upload/v1785316371/faa_assets/faa_logo.jpg" alt="Faa Nuts Logo" style="max-width: 120px; border-radius: 8px;" />
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #0d3b26; font-size: 24px; margin-top: 0; text-align: center;">Password Reset Request</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555; text-align: center;">We received a request to reset your password. Use the One-Time Password (OTP) below to proceed:</p>
            <div style="text-align: center; margin: 35px 0;">
              <span style="display: inline-block; background-color: #fffbeb; border: 1px solid #fde68a; color: #b45309; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center; margin-bottom: 0;">This OTP is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Faa Nuts. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Admin Panel - Password Reset OTP',
      html: emailHtml
    });

    res.status(200).json({ message: 'Password reset OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/admin/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    user.password = newPassword; // Pre-save hook will hash it
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Customer Signup
// @route   POST /api/auth/customer/signup
// @access  Public
exports.customerSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create Customer (Role 3). 
    // They don't need verification, so we can set isVerified to true or just ignore it for role 3.
    const user = await User.create({
      name,
      email,
      password,
      role: 3,
      isVerified: true 
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Customer Login
// @route   POST /api/auth/customer/login
// @access  Public
exports.customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role !== 3) {
      return res.status(403).json({ message: 'Please use the Admin/Support login portal.' });
    }

    const isMatch = await user.matchPassword(password);

    if (user && isMatch) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Customer Google Login
// @route   POST /api/auth/customer/google
// @access  Public
exports.customerGoogleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({ message: 'Google Token is missing' });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      // User exists, just log them in
      if (user.role !== 3) {
        return res.status(403).json({ message: 'Email is registered as Admin/Support. Please use the Admin portal.' });
      }
      
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      // New user, create them
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: 3,
        isVerified: true
      });

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Google Authentication failed' });
  }
};
