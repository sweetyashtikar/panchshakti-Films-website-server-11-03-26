const User = require('../models/User.model');

// ─────────────────────────────────────────────────────────────
// @route   GET /api/user/me
// @desc    Get logged-in user profile
// @access  Protected
// ─────────────────────────────────────────────────────────────
const getMyProfile = async (req, res) => {
  try {
    return res.status(200).json({ success: true, user: req.user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/user/me
// @desc    Update logged-in user profile
// @access  Protected
// ─────────────────────────────────────────────────────────────
const updateMyProfile = async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'middleName', 'lastName', 'mobile'];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: 'Profile updated.', user: updatedUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────────
// @route   GET /api/user/all  (Agency only)
// @desc    Get all models/clients
// @access  Protected + Agency Role
// ─────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query; // filter by role if needed
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password');
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getMyProfile, updateMyProfile, getAllUsers };