const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const VideoRoom = require('../model/videoRooms');
const TurnServerConfig = require('./turnServer');
const VideoOptimizer = require('./videoOptimizer');
const User = require('../model/user');
const recordingService = require('./recordingService');

// Configurable participant limit
const PARTICIPANT_LIMIT = process.env.PARTICIPANT_LIMIT ? parseInt(process.env.PARTICIPANT_LIMIT, 10) : 10;

class SocketServer {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6,
      transports: ['websocket', 'polling']
    });

    this.rooms = new Map(); // Active rooms
    this.participants = new Map(); // Active participants
    this.turnConfig = new TurnServerConfig();
    this.videoOptimizer = new VideoOptimizer();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        socket.userId = decoded.participantId;
        socket.roomId = decoded.roomId;
        socket.meetingId = decoded.meetingId;
        socket.role = decoded.role;
        
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected to room ${socket.roomId}`);

      // Join room
      socket.on('join-room', async (data) => {
        await this.handleJoinRoom(socket, data);
      });

      // WebRTC signaling
      socket.on('offer', (data) => {
        this.handleOffer(socket, data);
      });

      socket.on('answer', (data) => {
        this.handleAnswer(socket, data);
      });

      socket.on('ice-candidate', (data) => {
        this.handleIceCandidate(socket, data);
      });

      // Participant controls
      socket.on('toggle-audio', (data) => {
        this.handleToggleAudio(socket, data);
      });

      socket.on('toggle-video', (data) => {
        this.handleToggleVideo(socket, data);
      });

      socket.on('toggle-screen-share', (data) => {
        this.handleToggleScreenShare(socket, data);
      });

      // Chat
      socket.on('send-message', async (data) => {
        await this.handleSendMessage(socket, data);
      });

      // Room management
      socket.on('request-join', (data) => {
        this.handleRequestJoin(socket, data);
      });

      // Request ICE servers configuration
      socket.on('request-ice-servers', () => {
        this.handleRequestIceServers(socket);
      });

      // Network quality reporting
      socket.on('network-quality-update', (data) => {
        this.handleNetworkQualityUpdate(socket, data);
      });

      // Bandwidth adaptation
      socket.on('request-quality-adaptation', (data) => {
        this.handleQualityAdaptation(socket, data);
      });

      socket.on('approve-join', (data) => {
        this.handleApproveJoin(socket, data);
      });

      socket.on('reject-join', (data) => {
        this.handleRejectJoin(socket, data);
      });

      socket.on('kick-participant', (data) => {
        this.handleKickParticipant(socket, data);
      });

      socket.on('mute-participant', (data) => {
        this.handleMuteParticipant(socket, data);
      });

      // Recording
      socket.on('start-recording', (data) => {
        this.handleStartRecording(socket, data);
      });

      socket.on('stop-recording', (data) => {
        this.handleStopRecording(socket, data);
      });

      // Connection quality
      socket.on('connection-quality', (data) => {
        this.handleConnectionQuality(socket, data);
      });

      // Disconnect
      socket.on('disconnect', async () => {
        await this.handleDisconnect(socket);
      });
    });
  }

  async handleJoinRoom(socket, data) {
    try {
      const { name, email, isAudioEnabled = true, isVideoEnabled = true } = data;

      // Get or create room
      let room = this.rooms.get(socket.roomId);
      if (!room) {
        room = {
          id: socket.roomId,
          meetingId: socket.meetingId,
          participants: new Map(),
          chat: [],
          isRecording: false,
          recordingStartedAt: null
        };
        this.rooms.set(socket.roomId, room);
      }

      // Check participant limit
      if (room.participants.size >= PARTICIPANT_LIMIT) {
        socket.emit('room-full', { message: 'Room is at maximum capacity' });
        return;
      }

      // Add participant to room
      const participant = {
        id: socket.userId,
        socketId: socket.id,
        name,
        email,
        role: socket.role,
        isAudioEnabled,
        isVideoEnabled,
        isScreenSharing: false,
        joinedAt: new Date(),
        connectionQuality: 'good'
      };

      room.participants.set(socket.userId, participant);
      this.participants.set(socket.id, participant);

      // Join socket room
      socket.join(socket.roomId);

      // Update database
      await this.updateParticipantInDatabase(socket.roomId, socket.userId, participant);

      // Check if we should start automatic recording
      const participantCount = room.participants.size;
      if (participantCount >= 2 && !room.isRecording) {
        const recording = await recordingService.checkAndStartRecording(socket.roomId, participantCount);
        if (recording) {
          room.isRecording = true;
          room.recordingStartedAt = new Date();
          
          // Notify all participants that recording has started
          this.io.to(socket.roomId).emit('recording-started', {
            recordingId: recording._id,
            startedAt: recording.recordingInfo.startedAt,
            message: 'Recording started automatically (minimum 2 participants)'
          });
        }
      }

      // Notify other participants
      socket.to(socket.roomId).emit('participant-joined', {
        participant: {
          id: participant.id,
          name: participant.name,
          role: participant.role,
          isAudioEnabled: participant.isAudioEnabled,
          isVideoEnabled: participant.isVideoEnabled
        }
      });

      // Send room info to new participant
      const participantsList = Array.from(room.participants.values()).map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        isAudioEnabled: p.isAudioEnabled,
        isVideoEnabled: p.isVideoEnabled,
        isScreenSharing: p.isScreenSharing,
        connectionQuality: p.connectionQuality
      }));

      socket.emit('room-joined', {
        room: {
          id: room.id,
          meetingId: room.meetingId,
          isRecording: room.isRecording,
          recordingStartedAt: room.recordingStartedAt,
          participants: participantsList,
          chat: room.chat
        }
      });

      // Send participant list to all
      this.io.to(socket.roomId).emit('participants-updated', {
        participants: participantsList
      });

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  handleOffer(socket, data) {
    const { target, offer } = data;
    socket.to(target).emit('offer', {
      from: socket.userId,
      offer
    });
  }

  handleAnswer(socket, data) {
    const { target, answer } = data;
    socket.to(target).emit('answer', {
      from: socket.userId,
      answer
    });
  }

  handleIceCandidate(socket, data) {
    const { target, candidate } = data;
    socket.to(target).emit('ice-candidate', {
      from: socket.userId,
      candidate
    });
  }

  handleToggleAudio(socket, data) {
    const { isEnabled } = data;
    const participant = this.participants.get(socket.id);
    
    if (participant) {
      participant.isAudioEnabled = isEnabled;
      socket.to(socket.roomId).emit('participant-audio-toggled', {
        participantId: socket.userId,
        isEnabled
      });
    }
  }

  handleToggleVideo(socket, data) {
    const { isEnabled } = data;
    const participant = this.participants.get(socket.id);
    
    if (participant) {
      participant.isVideoEnabled = isEnabled;
      socket.to(socket.roomId).emit('participant-video-toggled', {
        participantId: socket.userId,
        isEnabled
      });
    }
  }

  handleToggleScreenShare(socket, data) {
    const { isSharing } = data;
    const participant = this.participants.get(socket.id);
    
    if (participant) {
      participant.isScreenSharing = isSharing;
      socket.to(socket.roomId).emit('participant-screen-share-toggled', {
        participantId: socket.userId,
        isSharing
      });
    }
  }

  async handleSendMessage(socket, data) {
    try {
      const { message, type = 'text' } = data;
      const participant = this.participants.get(socket.id);
      
      if (!participant) return;

      const chatMessage = {
        id: Date.now().toString(),
        sender: {
          id: participant.id,
          name: participant.name
        },
        message,
        type,
        timestamp: new Date()
      };

      const room = this.rooms.get(socket.roomId);
      if (room) {
        room.chat.push(chatMessage);
        
        // Keep only last 100 messages
        if (room.chat.length > 100) {
          room.chat = room.chat.slice(-100);
        }
      }

      // Broadcast to all participants in room
      this.io.to(socket.roomId).emit('new-message', chatMessage);

      // Save to database
      await this.saveChatMessage(socket.roomId, participant.id, participant.name, message, type);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  handleRequestJoin(socket, data) {
    const { participantId } = data;
    const room = this.rooms.get(socket.roomId);
    
    if (room && socket.role === 'host') {
      const participant = room.participants.get(participantId);
      if (participant) {
        socket.to(participant.socketId).emit('join-request', {
          from: socket.userId,
          roomId: socket.roomId
        });
      }
    }
  }

  handleApproveJoin(socket, data) {
    const { participantId } = data;
    const room = this.rooms.get(socket.roomId);
    
    if (room && socket.role === 'host') {
      const participant = room.participants.get(participantId);
      if (participant) {
        socket.to(participant.socketId).emit('join-approved', {
          roomId: socket.roomId
        });
      }
    }
  }

  handleRejectJoin(socket, data) {
    const { participantId, reason } = data;
    const room = this.rooms.get(socket.roomId);
    
    if (room && socket.role === 'host') {
      const participant = room.participants.get(participantId);
      if (participant) {
        socket.to(participant.socketId).emit('join-rejected', {
          reason: reason || 'Join request rejected by host'
        });
      }
    }
  }

  handleKickParticipant(socket, data) {
    const { participantId } = data;
    const room = this.rooms.get(socket.roomId);
    
    if (room && socket.role === 'host') {
      const participant = room.participants.get(participantId);
      if (participant) {
        socket.to(participant.socketId).emit('kicked', {
          reason: 'You have been removed from the meeting by the host'
        });
        
        // Remove from room
        room.participants.delete(participantId);
        this.participants.delete(participant.socketId);
      }
    }
  }

  handleMuteParticipant(socket, data) {
    const { participantId, isMuted } = data;
    const room = this.rooms.get(socket.roomId);
    
    if (room && socket.role === 'host') {
      const participant = room.participants.get(participantId);
      if (participant) {
        participant.isAudioEnabled = !isMuted;
        socket.to(participant.socketId).emit('force-mute', { isMuted });
        socket.to(socket.roomId).emit('participant-audio-toggled', {
          participantId,
          isEnabled: !isMuted
        });
      }
    }
  }

  handleStartRecording(socket, data) {
    if (socket.role === 'host') {
      const room = this.rooms.get(socket.roomId);
      if (room && !room.isRecording) {
        // Use recording service to start recording
        recordingService.checkAndStartRecording(socket.roomId, room.participants.size)
          .then(recording => {
            if (recording) {
              room.isRecording = true;
              room.recordingStartedAt = new Date();
              
              this.io.to(socket.roomId).emit('recording-started', {
                recordingId: recording._id,
                startedAt: recording.recordingInfo.startedAt,
                message: 'Recording started by host'
              });
            }
          })
          .catch(error => {
            console.error('Error starting recording:', error);
            socket.emit('error', { message: 'Failed to start recording' });
          });
      }
    }
  }

  handleStopRecording(socket, data) {
    if (socket.role === 'host') {
      const room = this.rooms.get(socket.roomId);
      if (room && room.isRecording) {
        // Use recording service to stop recording
        recordingService.stopRecording(socket.roomId)
          .then(recording => {
            if (recording) {
              room.isRecording = false;
              
              this.io.to(socket.roomId).emit('recording-stopped', {
                recordingId: recording._id,
                stoppedAt: recording.recordingInfo.endedAt,
                duration: recording.recordingInfo.duration,
                message: 'Recording stopped by host'
              });
            }
          })
          .catch(error => {
            console.error('Error stopping recording:', error);
            socket.emit('error', { message: 'Failed to stop recording' });
          });
      }
    }
  }

  handleConnectionQuality(socket, data) {
    const { quality } = data;
    const participant = this.participants.get(socket.id);
    
    if (participant) {
      participant.connectionQuality = quality;
      socket.to(socket.roomId).emit('participant-connection-quality', {
        participantId: socket.userId,
        quality
      });
    }
  }

  async handleDisconnect(socket) {
    try {
      const participant = this.participants.get(socket.id);
      if (!participant) return;

      const room = this.rooms.get(socket.roomId);
      if (room) {
        // Remove participant from room
        room.participants.delete(participant.id);
        
        // Check if we should stop recording (less than 2 participants)
        if (room.participants.size < 2 && room.isRecording) {
          const recording = await recordingService.stopRecording(socket.roomId);
          if (recording) {
            room.isRecording = false;
            
            // Notify remaining participants that recording has stopped
            this.io.to(socket.roomId).emit('recording-stopped', {
              recordingId: recording._id,
              stoppedAt: recording.recordingInfo.endedAt,
              duration: recording.recordingInfo.duration,
              message: 'Recording stopped (insufficient participants)'
            });
          }
        }
        
        // Notify other participants
        socket.to(socket.roomId).emit('participant-left', {
          participantId: participant.id,
          name: participant.name
        });

        // If room is empty, clean it up
        if (room.participants.size === 0) {
          this.rooms.delete(socket.roomId);
          console.log(`Room ${socket.roomId} cleaned up (empty)`);
        }
      }

      // Remove from participants map
      this.participants.delete(socket.id);

      // Update database
      await this.removeParticipantFromDatabase(socket.roomId, participant.id);

      console.log(`User ${participant.name} disconnected from room ${socket.roomId}`);

    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  async updateParticipantInDatabase(roomId, userId, participant) {
    try {
      const videoRoom = await VideoRoom.findOne({ roomId });
      if (videoRoom) {
        videoRoom.updateParticipantActivity(userId, {
          socketId: participant.socketId,
          isAudioEnabled: participant.isAudioEnabled,
          isVideoEnabled: participant.isVideoEnabled,
          lastActivity: new Date()
        });
        await videoRoom.save();
      }
    } catch (error) {
      console.error('Error updating participant in database:', error);
    }
  }

  async removeParticipantFromDatabase(roomId, userId) {
    try {
      const videoRoom = await VideoRoom.findOne({ roomId });
      if (videoRoom) {
        videoRoom.removeParticipant(userId);
        await videoRoom.save();
      }
    } catch (error) {
      console.error('Error removing participant from database:', error);
    }
  }

  async saveChatMessage(roomId, senderId, senderName, message, type) {
    try {
      const videoRoom = await VideoRoom.findOne({ roomId });
      if (videoRoom) {
        videoRoom.addChatMessage(senderId, senderName, message, type);
        await videoRoom.save();
      }
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  // Handle ICE servers request
  handleRequestIceServers(socket) {
    const iceServers = this.turnConfig.getRTCConfiguration();
    const participantCount = this.getParticipantCount(socket.roomId);
    const optimizedConfig = {
      ...iceServers,
      ...this.videoOptimizer.getOptimalConstraints(participantCount)
    };
    
    socket.emit('ice-servers-config', optimizedConfig);
  }

  // Handle network quality update
  handleNetworkQualityUpdate(socket, data) {
    const participant = this.participants.get(socket.userId);
    if (participant) {
      participant.networkQuality = data.quality;
      participant.networkStats = data.stats;
      
      // Broadcast quality update to room
      socket.to(socket.roomId).emit('participant-quality-update', {
        participantId: socket.userId,
        quality: data.quality,
        stats: data.stats
      });
    }
  }

  // Handle quality adaptation request
  handleQualityAdaptation(socket, data) {
    const participantCount = this.getParticipantCount(socket.roomId);
    const adaptationSettings = this.videoOptimizer.getAdaptiveBitrateSettings(
      participantCount, 
      data.networkQuality
    );
    
    socket.emit('quality-adaptation-settings', adaptationSettings);
  }

  // Handle screen share toggle
  handleToggleScreenShare(socket, data) {
    const { isSharing } = data;
    const participant = this.participants.get(socket.userId);
    
    if (participant) {
      participant.isScreenSharing = isSharing;
      
      // Broadcast to all participants in room
      socket.to(socket.roomId).emit('participant-screen-share-toggled', {
        participantId: socket.userId,
        name: participant.name,
        isSharing
      });
    }
  }

  // Get participant count for a room
  getParticipantCount(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.participants.size : 0;
  }

  // Set load balancer instance
  setLoadBalancer(loadBalancer) {
    this.loadBalancer = loadBalancer;
  }

  // Set performance optimizer instance
  setPerformanceOptimizer(performanceOptimizer) {
    this.performanceOptimizer = performanceOptimizer;
  }

  // Update room load metrics
  updateRoomLoadMetrics(roomId) {
    if (this.loadBalancer) {
      const room = this.rooms.get(roomId);
      if (room) {
        const participants = Array.from(room.participants.values());
        const bandwidth = participants.reduce((total, p) => total + (p.bandwidth || 0), 0);
        const cpuImpact = participants.length * 10; // Rough estimate
        
        this.loadBalancer.updateRoomLoad(roomId, participants.length, bandwidth, cpuImpact);
      }
    }
  }

  // Get room statistics
  getRoomStats() {
    const stats = {
      totalRooms: this.rooms.size,
      totalParticipants: this.participants.size,
      rooms: Array.from(this.rooms.values()).map(room => ({
        id: room.id,
        meetingId: room.meetingId,
        participantCount: room.participants.size,
        isRecording: room.isRecording
      }))
    };
    return stats;
  }
}

module.exports = SocketServer; 