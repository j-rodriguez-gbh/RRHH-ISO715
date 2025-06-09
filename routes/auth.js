const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticated } = require('../middleware/auth');

// Authentication routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/profile', authenticated, AuthController.profile);

module.exports = router; 