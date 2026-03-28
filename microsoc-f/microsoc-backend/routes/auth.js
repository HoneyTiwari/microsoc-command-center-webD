const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private (will add middleware later)
router.get('/me', authController.getMe);

// @route   GET /api/auth/demo
// @desc    Get demo credentials
// @access  Public
router.get('/demo', authController.getDemoCredentials);

module.exports = router;