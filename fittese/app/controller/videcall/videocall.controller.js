const VideoRoom = require('../../model/videoRooms');
const User = require('../../model/user');
const Meeting = require('../../model/meetings');
const sendEmail = require('../../utils/email');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class VideoCallController {
  
  /**
   * Create a new video room
   */
  static async createRoom(req, res) {
    try {
      const {
        title,
        description,
        scheduledAt,
        duration = 60,
        maxParticipants = 10,
        settings = {},
        category = 'fitness',
        tags = []
      } = req.body;

      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Validate scheduled time
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ success: false, message: 'Scheduled time must be in the future' });
      }

      // Generate unique room ID
      const roomId = this.generateRoomId();
      
      // Create video room
      const videoRoom = new VideoRoom({
        roomId,
        title,
        description,
        host: userId,
        hostEmail: user.email,
        hostName: user.name,
        scheduledAt: scheduledDate,
        duration,
        maxParticipants,
        settings: {
          allowJoinBeforeHost: settings.allowJoinBeforeHost || false,
          muteOnEntry: settings.muteOnEntry !== false,
          videoOnEntry: settings.videoOnEntry !== false,
          allowChat: settings.allowChat !== false,
          allowScreenShare: settings.allowScreenShare !== false,
          allowRecording: settings.allowRecording || false,
          requirePassword: settings.requirePassword || false,
          password: settings.requirePassword ? this.generatePassword() : null,
          waitingRoom: settings.waitingRoom !== false,
          autoRecord: settings.autoRecord || false
        },
        category,
        tags
      });

      await videoRoom.save();

      // Send email notifications to participants if any
      if (req.body.participants && req.body.participants.length > 0) {
        await this.sendMeetingInvitations(videoRoom, req.body.participants);
      }

      res.json({
        success: true,
        message: 'Video room created successfully',
        room: {
          id: videoRoom._id,
          roomId: videoRoom.roomId,
          meetingId: videoRoom.meetingId,
          title: videoRoom.title,
          joinUrl: videoRoom.joinUrl,
          hostUrl: videoRoom.hostUrl,
          scheduledAt: videoRoom.formattedScheduledAt,
          settings: videoRoom.settings
        }
      });

    } catch (error) {
      console.error('Error creating video room:', error);
      res.status(500).json({ success: false, message: 'Failed to create video room' });
    }
  }

  /**
   * Join a video room
   */
  static async joinRoom(req, res) {
    try {
      const { meetingId } = req.params;
      const { password, name, email } = req.body;

      const videoRoom = await VideoRoom.findByMeetingId(meetingId);
      if (!videoRoom) {
        return res.status(404).json({ success: false, message: 'Meeting not found' });
      }

      // Check if meeting is active or scheduled
      if (videoRoom.status === 'ended' || videoRoom.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Meeting has ended or been cancelled' });
      }

      // Check password if required
      if (videoRoom.settings.requirePassword && videoRoom.settings.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid password' });
      }

      // Check participant limit
      const currentParticipants = videoRoom.currentParticipants.length;
      if (currentParticipants >= videoRoom.maxParticipants) {
        return res.status(400).json({ success: false, message: 'Meeting is full' });
      }

      // Check if user can join before host
      if (!videoRoom.settings.allowJoinBeforeHost && videoRoom.status === 'scheduled') {
        return res.status(400).json({ success: false, message: 'Host has not started the meeting yet' });
      }

      // Generate JWT token for the participant
      const participantToken = jwt.sign(
        {
          roomId: videoRoom.roomId,
          meetingId: videoRoom.meetingId,
          participantId: req.user?.id || 'guest',
          role: 'participant'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Joining meeting',
        room: {
          id: videoRoom._id,
          roomId: videoRoom.roomId,
          meetingId: videoRoom.meetingId,
          title: videoRoom.title,
          status: videoRoom.status,
          settings: videoRoom.settings,
          currentParticipants: currentParticipants,
          maxParticipants: videoRoom.maxParticipants
        },
        token: participantToken
      });

    } catch (error) {
      console.error('Error joining room:', error);
      res.status(500).json({ success: false, message: 'Failed to join room' });
    }
  }

  /**
   * Host a video room
   */
  static async hostRoom(req, res) {
    try {
      const { meetingId } = req.params;
      const userId = req.user?.id || req.session?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const videoRoom = await VideoRoom.findByMeetingId(meetingId);
      if (!videoRoom) {
        return res.status(404).json({ success: false, message: 'Meeting not found' });
      }

      // Check if user is the host
      if (videoRoom.host.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Only the host can start the meeting' });
      }

      // Start the meeting if it's scheduled
      if (videoRoom.status === 'scheduled') {
        videoRoom.status = 'active';
        videoRoom.startedAt = new Date();
        await videoRoom.save();
      }

      // Generate JWT token for the host
      const hostToken = jwt.sign(
        {
          roomId: videoRoom.roomId,
          meetingId: videoRoom.meetingId,
          participantId: userId,
          role: 'host'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Hosting meeting',
        room: {
          id: videoRoom._id,
          roomId: videoRoom.roomId,
          meetingId: videoRoom.meetingId,
          title: videoRoom.title,
          status: videoRoom.status,
          settings: videoRoom.settings,
          currentParticipants: videoRoom.currentParticipants.length,
          maxParticipants: videoRoom.maxParticipants
        },
        token: hostToken
      });

    } catch (error) {
      console.error('Error hosting room:', error);
      res.status(500).json({ success: false, message: 'Failed to host room' });
    }
  }

  /**
   * Get room details
   */
  static async getRoomDetails(req, res) {
    try {
      const { meetingId } = req.params;

      const videoRoom = await VideoRoom.findByMeetingId(meetingId)
        .populate('host', 'name email')
        .populate('participants.userId', 'name email');

      if (!videoRoom) {
        return res.status(404).json({ success: false, message: 'Meeting not found' });
      }

      res.json({
        success: true,
        room: {
          id: videoRoom._id,
          roomId: videoRoom.roomId,
          meetingId: videoRoom.meetingId,
          title: videoRoom.title,
          description: videoRoom.description,
          host: videoRoom.host,
          status: videoRoom.status,
          scheduledAt: videoRoom.formattedScheduledAt,
          startedAt: videoRoom.startedAt,
          endedAt: videoRoom.endedAt,
          duration: videoRoom.formattedDuration,
          currentParticipants: videoRoom.currentParticipants.length,
          maxParticipants: videoRoom.maxParticipants,
          settings: videoRoom.settings,
          joinUrl: videoRoom.joinUrl,
          hostUrl: videoRoom.hostUrl,
          category: videoRoom.category,
          tags: videoRoom.tags
        }
      });

    } catch (error) {
      console.error('Error getting room details:', error);
      res.status(500).json({ success: false, message: 'Failed to get room details' });
    }
  }

  /**
   * Get user's video rooms
   */
  static async getUserRooms(req, res) {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { page = 1, limit = 10, status } = req.query;

      const query = {
        $or: [
          { host: userId },
          { 'participants.userId': userId }
        ]
      };

      if (status) {
        query.status = status;
      }

      const rooms = await VideoRoom.find(query)
        .populate('host', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await VideoRoom.countDocuments(query);

      res.json({
        success: true,
        rooms: rooms.map(room => ({
          id: room._id,
          roomId: room.roomId,
          meetingId: room.meetingId,
          title: room.title,
          host: room.host,
          status: room.status,
          scheduledAt: room.scheduledAt,
          startedAt: room.startedAt,
          currentParticipants: room.participants.filter(p => !p.leftAt).length,
          maxParticipants: room.maxParticipants,
          joinUrl: room.joinUrl,
          hostUrl: room.hostUrl,
          isHost: room.host._id.toString() === userId
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      });

    } catch (error) {
      console.error('Error getting user rooms:', error);
      res.status(500).json({ success: false, message: 'Failed to get user rooms' });
    }
  }

  /**
   * End a video room
   */
  static async endRoom(req, res) {
    try {
      const { meetingId } = req.params;
      const userId = req.user?.id || req.session?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const videoRoom = await VideoRoom.findByMeetingId(meetingId);
      if (!videoRoom) {
        return res.status(404).json({ success: false, message: 'Meeting not found' });
      }

      // Check if user is the host
      if (videoRoom.host.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Only the host can end the meeting' });
      }

      videoRoom.endMeeting();
      await videoRoom.save();

      res.json({
        success: true,
        message: 'Meeting ended successfully'
      });

    } catch (error) {
      console.error('Error ending room:', error);
      res.status(500).json({ success: false, message: 'Failed to end room' });
    }
  }

  /**
   * Send meeting invitations
   */
  static async sendMeetingInvitations(videoRoom, participants) {
    try {
      const invitations = participants.map(async (participant) => {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0b3d2e;">Meeting Invitation</h2>
            <p>You have been invited to join a video meeting.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Meeting Details:</h3>
              <p><strong>Title:</strong> ${videoRoom.title}</p>
              <p><strong>Date:</strong> ${videoRoom.formattedScheduledAt}</p>
              <p><strong>Duration:</strong> ${videoRoom.duration} minutes</p>
              <p><strong>Host:</strong> ${videoRoom.hostName}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${videoRoom.joinUrl}" 
                 style="background: #0b3d2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Join Meeting
              </a>
            </div>
            
            <p><strong>Meeting ID:</strong> ${videoRoom.meetingId}</p>
            <p><strong>Join URL:</strong> <a href="${videoRoom.joinUrl}">${videoRoom.joinUrl}</a></p>
            
            ${videoRoom.settings.requirePassword ? 
              `<p><strong>Password:</strong> ${videoRoom.settings.password}</p>` : ''
            }
          </div>
        `;

        await sendEmail({
          to: participant.email,
          subject: `Meeting Invitation: ${videoRoom.title}`,
          html: emailContent
        });

        // Add to notifications
        videoRoom.notifications.participantsNotified.push({
          email: participant.email,
          notifiedAt: new Date()
        });
      });

      await Promise.all(invitations);
      await videoRoom.save();

    } catch (error) {
      console.error('Error sending meeting invitations:', error);
    }
  }

  /**
   * Generate unique room ID
   */
  static generateRoomId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Generate meeting password
   */
  static generatePassword() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Cleanup expired meetings
   */
  static async cleanupExpiredMeetings() {
    try {
      const result = await VideoRoom.cleanupExpiredMeetings();
      console.log(`Cleaned up ${result.modifiedCount} expired meetings`);
    } catch (error) {
      console.error('Error cleaning up expired meetings:', error);
    }
  }
}

module.exports = VideoCallController;



