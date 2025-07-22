const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const meetingsController = require('../../controller/admin/meetingshedule');

// Render meetings management page
router.get('/meetings', adminAuth, meetingsController.renderMeetingsPage);

module.exports = router;