const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ─── Helper: Generate JWT Token ───────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, mobile, password, confirmPassword, role } = req.body;

    // ── Validation ──
    if (!firstName || !lastName || !email || !mobile || !password || !role) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (!['agency', 'model', 'client'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role selected.' });
    }

    // ── Check if email already exists ──
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered. Please login.' });
    }

    // ── Create user ──
    const user = await User.create({
      firstName,
      middleName: middleName || '',
      lastName,
      email,
      mobile,
      password,       // will be hashed by pre-save hook
      role,
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user,
    });

  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user & return JWT
// @access  Public
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // ── Find user ──
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // ── Check if account is active ──
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    // ── Compare password ──
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, user.role);

    // ── Role-based redirect path ──
    const redirectMap = {
      agency: '/CastingModellingAgency',
      model:  '/ModelOnboarding',
      client: '/ClientPage',
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user,
      redirectTo: redirectMap[user.role],
    });

  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

module.exports = { register, login };