const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');

const adminPagesController = require('../../controller/admin/adminpages.controller');

// Protected admin routes - require authentication
router.get('/dashboard', adminAuth, adminPagesController.dashboard);
router.get('/calendar', adminAuth, adminPagesController.calendar);
router.get('/calender', (req, res) => {
    // Redirect the old typo route to the correct one
    res.redirect('/admin/calendar');
});
router.get('/users', adminAuth, adminPagesController.users);
router.get('/mymeet', adminAuth, adminPagesController.mymeet);
router.get('/questions', adminAuth, adminPagesController.questions);
router.get('/employeetype', adminAuth, adminPagesController.employeetype);
router.get('/addemployee', adminAuth, adminPagesController.addemployee);
router.get('/recordings', adminAuth, adminPagesController.recordings);

// Group meeting routes
router.get('/users-list', adminAuth, adminPagesController.getUsersList);
router.post('/create-meeting', adminAuth, adminPagesController.createMeeting);

module.exports = router;