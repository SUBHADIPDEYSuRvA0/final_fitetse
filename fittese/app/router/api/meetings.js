const express = require('express');
const router = express.Router();
const userMeetingController = require('../../controller/user/userMeeting.controller');
const bookingController = require('../../controller/user/booking');
const Slot = require('../../model/slots');

// Get available slots
router.get('/slots', async (req, res) => {
  try {
    const now = new Date();
    const slots = await Slot.find({ 
      status: 'available', 
      start: { $gte: now } 
    }).sort({ start: 1 });
    
    res.json(slots);
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching slots'
    });
  }
});

// Book a meeting
router.post('/book', async (req, res) => {
  try {
    await bookingController.book(req, res);
  } catch (error) {
    console.error('Book meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during booking'
    });
  }
});

// Get user meetings
router.get('/user/:userId', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    await userMeetingController.getUserMeetings(req, res);
  } catch (error) {
    console.error('Get user meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all meetings (admin only)
router.get('/', async (req, res) => {
  try {
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    await userMeetingController.getAllMeetings(req, res);
  } catch (error) {
    console.error('Get all meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update meeting status
router.put('/:id/status', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    await userMeetingController.updateMeetingStatus(req, res);
  } catch (error) {
    console.error('Update meeting status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel meeting
router.delete('/:id', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    await userMeetingController.cancelMeeting(req, res);
  } catch (error) {
    console.error('Cancel meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
