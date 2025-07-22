const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const adminAuthController = require('../../controller/admin/adminAuth.controller');

// Admin Signup Page
router.get('/signup', (req, res) => {
  res.render('admin/signup', {
    title: 'Admin Signup'
  });
});

// Admin Signup Handler
router.post('/signup', adminAuthController.signup);

// Admin Login Page
router.get('/login', (req, res) => {
  // If already logged in, redirect to dashboard
  if (adminAuth.isAuthenticated(req)) {
    return res.redirect('/admin/dashboard');
  }
  
  res.render('admin/login', {
    title: 'Admin Login',
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// Admin Login Handler
router.post('/login', adminAuthController.login);

// Admin Logout
router.post('/logout', adminAuth, adminAuthController.logout);

// Get Current User
router.get('/me', adminAuth, adminAuthController.getCurrentUser);

// Change Password
router.post('/change-password', adminAuth, adminAuthController.changePassword);

// Forgot Password
router.post('/forgot-password', adminAuthController.forgotPassword);

// Reset Password
router.post('/reset-password/:token', adminAuthController.resetPassword);

// Verify Token
router.post('/verify-token', adminAuthController.verifyToken);

module.exports = router; 