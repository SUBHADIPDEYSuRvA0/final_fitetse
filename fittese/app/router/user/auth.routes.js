const express = require('express');
const router = express.Router();
const userAuthController = require('../../controller/user/auth');

// Render login page
router.get('/user/login', (req, res) => {
  res.render('user/login', { error: null, success: null });
});

// Render signup page
router.get('/user/signup', (req, res) => {
  res.render('user/signup', { error: null, success: null });
});

// Handle login (API)
router.post('/user/login', userAuthController.login);

// Handle signup (API)
router.post('/user/signup', userAuthController.register);

// Password reset routes
router.get('/user/forgot', (req, res) => {
  res.render('user/forgot', { error: null, success: null });
});
router.post('/user/forgot', userAuthController.forgotPassword);
router.get('/user/reset/:token', userAuthController.renderResetForm);
router.post('/user/reset/:token', userAuthController.resetPassword);

module.exports = router; 