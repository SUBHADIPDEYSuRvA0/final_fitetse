const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['host', 'participant', 'moderator'],
    default: 'participant'
  },
  socketId: String,
  isAudioEnabled: {
    type: Boolean,
    default: true
  },
  isVideoEnabled: {
    type: Boolean,
    default: true
  },
  isScreenSharing: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: Date,
  connectionQuality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

const chatMessageSchema = new mongoose.Schema({
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['text', 'file', 'system'],
    default: 'text'
  },
  fileUrl: String,
  fileName: String
});

const videoRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  meetingId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 500
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostEmail: {
    type: String,
    required: true
  },
  hostName: {
    type: String,
    required: true
  },
  participants: [participantSchema],
  maxParticipants: {
    type: Number,
    default: 10,
    min: 1,
    max: 50
  },
  status: {
    type: String,
    enum: ['scheduled', 'waiting', 'active', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  startedAt: Date,
  endedAt: Date,
  duration: {
    type: Number, // in minutes
    default: 60
  },
  settings: {
    allowJoinBeforeHost: {
      type: Boolean,
      default: false
    },
    muteOnEntry: {
      type: Boolean,
      default: true
    },
    videoOnEntry: {
      type: Boolean,
      default: true
    },
    allowChat: {
      type: Boolean,
      default: true
    },
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    allowRecording: {
      type: Boolean,
      default: false
    },
    requirePassword: {
      type: Boolean,
      default: false
    },
    password: String,
    waitingRoom: {
      type: Boolean,
      default: true
    },
    autoRecord: {
      type: Boolean,
      default: false
    }
  },
  chat: [chatMessageSchema],
  recording: {
    isRecording: {
      type: Boolean,
      default: false
    },
    startedAt: Date,
    endedAt: Date,
    fileUrl: String,
    duration: Number,
    size: Number,
    recordingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recording'
    },
    autoRecord: {
      type: Boolean,
      default: true
    },
    minParticipantsForRecording: {
      type: Number,
      default: 2
    }
  },
  notifications: {
    emailSent: {
      type: Boolean,
      default: false
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    participantsNotified: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      email: String,
      notifiedAt: Date
    }]
  },
  analytics: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    peakParticipants: {
      type: Number,
      default: 0
    },
    averageDuration: Number,
    connectionIssues: [{
      participantId: String,
      issue: String,
      timestamp: Date
    }]
  },
  metadata: {
    type: Map,
    of: String
  },
  tags: [String],
  category: {
    type: String,
    enum: ['fitness', 'consultation', 'training', 'assessment', 'other'],
    default: 'fitness'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
videoRoomSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

videoRoomSchema.virtual('isScheduled').get(function() {
  return this.status === 'scheduled';
});

videoRoomSchema.virtual('isEnded').get(function() {
  return this.status === 'ended';
});

videoRoomSchema.virtual('currentParticipants').get(function() {
  return this.participants.filter(p => !p.leftAt);
});

videoRoomSchema.virtual('activeParticipants').get(function() {
  return this.participants.filter(p => !p.leftAt && p.socketId);
});

const BASE_URL = process.env.BASE_URL || require('../../config').BASE_URL || 'http://localhost:3000';

videoRoomSchema.virtual('joinUrl').get(function() {
  return `${BASE_URL}/video/join/${this.meetingId}`;
});

videoRoomSchema.virtual('hostUrl').get(function() {
  return `${BASE_URL}/video/host/${this.meetingId}`;
});

videoRoomSchema.virtual('formattedDuration').get(function() {
  if (!this.startedAt || !this.endedAt) return '0 min';
  const duration = Math.round((this.endedAt - this.startedAt) / (1000 * 60));
  return `${duration} min`;
});

videoRoomSchema.virtual('formattedScheduledAt').get(function() {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(this.scheduledAt);
});

// Indexes for better performance
videoRoomSchema.index({ roomId: 1 });
videoRoomSchema.index({ meetingId: 1 });
videoRoomSchema.index({ host: 1, status: 1 });
videoRoomSchema.index({ status: 1, scheduledAt: 1 });
videoRoomSchema.index({ 'participants.userId': 1 });
videoRoomSchema.index({ scheduledAt: 1, status: 1 });

// Pre-save middleware
videoRoomSchema.pre('save', function(next) {
  // Generate meeting ID if not exists
  if (!this.meetingId) {
    this.meetingId = this.generateMeetingId();
  }
  
  // Update peak participants
  const currentParticipants = this.participants.filter(p => !p.leftAt).length;
  if (currentParticipants > this.analytics.peakParticipants) {
    this.analytics.peakParticipants = currentParticipants;
  }
  
  next();
});

// Instance methods
videoRoomSchema.methods.generateMeetingId = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`.toUpperCase();
};

videoRoomSchema.methods.addParticipant = function(userId, name, email, role = 'participant') {
  const existingParticipant = this.participants.find(p => p.userId.toString() === userId.toString());
  
  if (existingParticipant) {
    // Update existing participant
    existingParticipant.leftAt = null;
    existingParticipant.lastActivity = new Date();
    return existingParticipant;
  }
  
  // Add new participant
  const participant = {
    userId,
    name,
    email,
    role,
    joinedAt: new Date(),
    lastActivity: new Date()
  };
  
  this.participants.push(participant);
  this.analytics.totalParticipants++;
  
  return participant;
};

videoRoomSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (participant) {
    participant.leftAt = new Date();
    participant.socketId = null;
  }
};

videoRoomSchema.methods.updateParticipantActivity = function(userId, updates) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (participant) {
    Object.assign(participant, updates);
    participant.lastActivity = new Date();
  }
};

videoRoomSchema.methods.startMeeting = function() {
  this.status = 'active';
  this.startedAt = new Date();
};

videoRoomSchema.methods.endMeeting = function() {
  this.status = 'ended';
  this.endedAt = new Date();
  
  // Calculate average duration
  if (this.startedAt && this.endedAt) {
    this.analytics.averageDuration = Math.round((this.endedAt - this.startedAt) / (1000 * 60));
  }
};

videoRoomSchema.methods.addChatMessage = function(senderId, senderName, message, type = 'text', fileUrl = null, fileName = null) {
  const chatMessage = {
    sender: {
      userId: senderId,
      name: senderName
    },
    message,
    type,
    fileUrl,
    fileName,
    timestamp: new Date()
  };
  
  this.chat.push(chatMessage);
  return chatMessage;
};

// Static methods
videoRoomSchema.statics.findByMeetingId = function(meetingId) {
  return this.findOne({ meetingId });
};

videoRoomSchema.statics.findActiveByHost = function(hostId) {
  return this.find({ host: hostId, status: { $in: ['active', 'waiting'] } });
};

videoRoomSchema.statics.findScheduledMeetings = function() {
  return this.find({ 
    status: 'scheduled', 
    scheduledAt: { $gte: new Date() } 
  }).sort({ scheduledAt: 1 });
};

videoRoomSchema.statics.cleanupExpiredMeetings = function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.updateMany(
    { 
      status: { $in: ['active', 'waiting'] }, 
      lastActivity: { $lt: oneDayAgo } 
    },
    { status: 'ended', endedAt: new Date() }
  );
};

module.exports = mongoose.model('VideoRoom', videoRoomSchema); 