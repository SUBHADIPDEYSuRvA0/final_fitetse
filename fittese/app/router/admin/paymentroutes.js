const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const paymentsController = require('../../controller/admin/payments.controller');

// Payment routes
router.get('/admin/payments', adminAuth, (req, res) => paymentsController.getPaymentsDashboard(req, res));
router.get('/admin/payments/api', adminAuth, (req, res) => paymentsController.getPaymentsAPI(req, res));
router.get('/admin/paid-users/api', adminAuth, (req, res) => paymentsController.getPaidUsersAPI(req, res));

module.exports = router; 