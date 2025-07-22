const express = require('express');
const router = express.Router();
const userAuth = require('../../middleware/userAuth');
const userDashboardController = require('../../controller/user/userDashboard.controller');

// User dashboard routes
router.get('/user/dashboard/api', userAuth, (req, res) => userDashboardController.getUserDashboard(req, res));
router.get('/user/employees', userAuth, (req, res) => userDashboardController.getAvailableEmployees(req, res));
router.get('/user/slots', userAuth, (req, res) => userDashboardController.getAvailableSlots(req, res));
router.post('/user/meetings/book', userAuth, (req, res) => userDashboardController.bookMeeting(req, res));
router.get('/user/meetings', userAuth, (req, res) => userDashboardController.getUserMeetings(req, res));
router.delete('/user/meetings/:meetingId/cancel', userAuth, (req, res) => userDashboardController.cancelMeeting(req, res));
router.get('/user/profile', userAuth, (req, res) => userDashboardController.getUserProfile(req, res));
router.put('/user/profile', userAuth, (req, res) => userDashboardController.updateUserProfile(req, res));
router.get('/user/payments', userAuth, (req, res) => userDashboardController.getUserPayments(req, res));

module.exports = router; 