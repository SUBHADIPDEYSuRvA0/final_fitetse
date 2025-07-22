const express = require('express');
const router = express.Router();
const EmployeePagesController = require('../../controller/employee/employee.pagesconteroller');
const employeeAuth = require('../../middleware/employeeAuth');

// Dashboard
router.get('/home', employeeAuth, EmployeePagesController.home);
// Login page (no auth)
router.get('/', EmployeePagesController.login);
// Upcoming meetings
router.get('/meetings/upcoming', employeeAuth, EmployeePagesController.upcomingMeetings);
// Past meetings
router.get('/meetings/past', employeeAuth, EmployeePagesController.pastMeetings);
// Meeting details
router.get('/meetings/:id', employeeAuth, EmployeePagesController.meetingDetails);
// Availability
router.get('/availability', employeeAuth, EmployeePagesController.availability);
router.post('/availability', employeeAuth, EmployeePagesController.setAvailability);
// Notifications
router.get('/notifications', employeeAuth, EmployeePagesController.notifications);
// Profile
router.get('/profile', employeeAuth, EmployeePagesController.profile);
// Change password
router.get('/change-password', employeeAuth, EmployeePagesController.changePasswordForm);
router.post('/change-password', employeeAuth, EmployeePagesController.changePassword);

module.exports = router;