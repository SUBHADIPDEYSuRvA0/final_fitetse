const express = require('express');
const router = express.Router();
const VideoCallController = require('../../controller/videcall/videocall.controller');
const auth = require('../../middleware/auth');

// Video calling routes
router.get('/join/:meetingId', async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    // Check if videoRooms model exists
    let VideoRoom;
    try {
      VideoRoom = require('../../model/videoRooms');
    } catch (error) {
      console.error('VideoRooms model not found:', error);
      return res.status(404).json({ 
        error: 'Video calling service not available',
        message: 'Meeting not found'
      });
    }
    
    const videoRoom = await VideoRoom.findByMeetingId(meetingId);
    
    if (!videoRoom) {
      return res.status(404).json({ 
        error: 'Meeting not found',
        message: 'The requested meeting does not exist'
      });
    }

    // Check if meeting is active or scheduled
    if (videoRoom.status === 'ended' || videoRoom.status === 'cancelled') {
      return res.status(400).json({ 
        error: 'Meeting ended',
        message: 'Meeting has ended or been cancelled'
      });
    }

    // Get user info (from session or guest)
    let user = null;
    if (req.session && req.session.userId) {
      try {
        const User = require('../../model/user');
        user = await User.findById(req.session.userId);
      } catch (error) {
        console.error('Error finding user:', error);
      }
    }

    if (!user) {
      // Guest user
      user = {
        id: 'guest_' + Date.now(),
        name: 'Guest User',
        email: 'guest@example.com',
        role: 'participant'
      };
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        roomId: videoRoom.roomId,
        meetingId: videoRoom.meetingId,
        participantId: user.id,
        role: user.role || 'participant'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.render('videocall/meeting', {
      room: {
        roomId: videoRoom.roomId,
        meetingId: videoRoom.meetingId,
        title: videoRoom.title,
        settings: videoRoom.settings
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'participant'
      },
      token
    });

  } catch (error) {
    console.error('Error rendering meeting page:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to load meeting'
    });
  }
});

router.get('/host/:meetingId', auth, async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    // Check if videoRooms model exists
    let VideoRoom;
    try {
      VideoRoom = require('../../model/videoRooms');
    } catch (error) {
      console.error('VideoRooms model not found:', error);
      return res.status(404).json({ 
        error: 'Video calling service not available',
        message: 'Meeting not found'
      });
    }
    
    const videoRoom = await VideoRoom.findByMeetingId(meetingId);
    
    if (!videoRoom) {
      return res.status(404).json({ 
        error: 'Meeting not found',
        message: 'The requested meeting does not exist'
      });
    }

    // Check if user is the host
    if (videoRoom.host.toString() !== req.user.id) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Only the host can access this page'
      });
    }

    // Generate JWT token for host
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        roomId: videoRoom.roomId,
        meetingId: videoRoom.meetingId,
        participantId: req.user.id,
        role: 'host'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.render('videocall/meeting', {
      room: {
        roomId: videoRoom.roomId,
        meetingId: videoRoom.meetingId,
        title: videoRoom.title,
        settings: videoRoom.settings
      },
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: 'host'
      },
      token
    });

  } catch (error) {
    console.error('Error rendering host meeting page:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to load meeting'
    });
  }
});

// API routes
router.post('/api/rooms', auth, VideoCallController.createRoom);
router.get('/api/rooms/:meetingId', VideoCallController.getRoomDetails);
router.post('/api/rooms/:meetingId/join', VideoCallController.joinRoom);
router.post('/api/rooms/:meetingId/host', auth, VideoCallController.hostRoom);
router.post('/api/rooms/:meetingId/end', auth, VideoCallController.endRoom);
router.get('/api/user/rooms', auth, VideoCallController.getUserRooms);

// Webhook for meeting updates
router.post('/api/webhook/meeting-update', async (req, res) => {
  try {
    const { meetingId, status, participants } = req.body;
    
    let VideoRoom;
    try {
      VideoRoom = require('../../model/videoRooms');
    } catch (error) {
      console.error('VideoRooms model not found:', error);
      return res.status(500).json({ success: false, error: 'Service not available' });
    }
    
    const videoRoom = await VideoRoom.findByMeetingId(meetingId);
    
    if (videoRoom) {
      if (status === 'started') {
        videoRoom.startMeeting();
      } else if (status === 'ended') {
        videoRoom.endMeeting();
      }
      
      await videoRoom.save();
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
});

module.exports = router; 