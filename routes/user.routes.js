const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, getAllUsers } = require('../controllers/user.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

// GET  /api/user/me  → Any logged-in user
router.get('/me', protect, getMyProfile);

// PUT  /api/user/me  → Any logged-in user
router.put('/me', protect, updateMyProfile);

// GET  /api/user/all → Only Agency can see all users
router.get('/all', protect, authorizeRoles('agency'), getAllUsers);

module.exports = router;