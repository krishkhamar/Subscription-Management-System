const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { validatePasswordStrength } = require('../utils/passwordValidate');

const clientBaseUrl = () =>
  process.env.CLIENT_URL || 'http://localhost:3000';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const pw = validatePasswordStrength(password);
    if (!pw.ok) {
      return res.status(400).json({ message: pw.message });
    }

    // Public signup is always portal; internal users are created by admin only
    const user = await User.create({ name, email, password, role: 'portal' });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim()?.toLowerCase();
    const user = email ? await User.findOne({ email }) : null;

    if (user) {
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
      await user.save();

      const resetUrl = `${clientBaseUrl()}/reset-password/${resetToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Password Reset - Subscription Management System',
        html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to choose a new password.</p><p>This link expires in 30 minutes.</p>`
      });
    }

    // Same response whether or not the email exists (avoid account enumeration)
    res.json({
      message:
        'If an account exists for that email, we sent password reset instructions.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const pw = validatePasswordStrength(req.body.password);
    if (!pw.ok) {
      return res.status(400).json({ message: pw.message });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful', token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, getMe };
