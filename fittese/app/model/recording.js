const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

const recordingSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  meetingId: {
    type: String,
    required: true,
    index: true
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
  hostName: {
    type: String,
    required: true
  },
  hostEmail: {
    type: String,
    required: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    role: {
      type: String,
      enum: ['host', 'participant', 'moderator'],
      default: 'participant'
    }
  }],
  recordingInfo: {
    startedAt: {
      type: Date,
      required: true
    },
    endedAt: Date,
    duration: {
      type: Number, // in seconds
      default: 0
    },
    filePath: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number, // in bytes
      default: 0
    },
    format: {
      type: String,
      enum: ['mp4', 'webm', 'mkv'],
      default: 'mp4'
    },
    quality: {
      type: String,
      enum: ['low', 'medium', 'high', 'ultra'],
      default: 'medium'
    },
    resolution: {
      width: {
        type: Number,
        default: 1920
      },
      height: {
        type: Number,
        default: 1080
      }
    },
    frameRate: {
      type: Number,
      default: 30
    },
    bitrate: {
      type: Number, // in kbps
      default: 2000
    },
    audioEnabled: {
      type: Boolean,
      default: true
    },
    audioCodec: {
      type: String,
      default: 'aac'
    },
    videoCodec: {
      type: String,
      default: 'h264'
    }
  },
  status: {
    type: String,
    enum: ['recording', 'processing', 'completed', 'failed', 'deleted'],
    default: 'recording'
  },
  processingInfo: {
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    error: String,
    processingStartedAt: Date,
    processingCompletedAt: Date
  },
  accessControl: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    allowedRoles: [{
      type: String,
      enum: ['admin', 'employee', 'user']
    }],
    password: String,
    expiresAt: Date
  },
  metadata: {
    weekNumber: {
      type: Number,
      required: true,
      index: true
    },
    year: {
      type: Number,
      required: true,
      index: true
    },
    month: {
      type: Number,
      required: true,
      index: true
    },
    day: {
      type: Number,
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ['fitness', 'consultation', 'training', 'assessment', 'other'],
      default: 'fitness'
    },
    tags: [String],
    notes: String,
    thumbnailPath: String
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    lastDownloaded: Date,
    viewHistory: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      userAgent: String
    }],
    downloadHistory: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      downloadedAt: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      userAgent: String
    }]
  },
  settings: {
    autoDelete: {
      type: Boolean,
      default: false
    },
    retentionDays: {
      type: Number,
      default: 30
    },
    compressionEnabled: {
      type: Boolean,
      default: true
    },
    watermarkEnabled: {
      type: Boolean,
      default: false
    },
    watermarkText: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
recordingSchema.virtual('isRecording').get(function() {
  return this.status === 'recording';
});

recordingSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

recordingSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

recordingSchema.virtual('isDeleted').get(function() {
  return this.status === 'deleted';
});

recordingSchema.virtual('formattedDuration').get(function() {
  if (!this.recordingInfo.duration) return '0:00';
  const hours = Math.floor(this.recordingInfo.duration / 3600);
  const minutes = Math.floor((this.recordingInfo.duration % 3600) / 60);
  const seconds = this.recordingInfo.duration % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

recordingSchema.virtual('formattedFileSize').get(function() {
  if (!this.recordingInfo.fileSize) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(this.recordingInfo.fileSize) / Math.log(1024));
  return `${(this.recordingInfo.fileSize / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
});

recordingSchema.virtual('downloadUrl').get(function() {
  return `/admin/recordings/download/${this._id}`;
});

recordingSchema.virtual('viewUrl').get(function() {
  return `/admin/recordings/view/${this._id}`;
});

recordingSchema.virtual('thumbnailUrl').get(function() {
  return this.metadata.thumbnailPath ? `/uploads/thumbnails/${this.metadata.thumbnailPath}` : null;
});

recordingSchema.virtual('weekLabel').get(function() {
  return `Week ${this.metadata.weekNumber}, ${this.metadata.year}`;
});

// Indexes for better performance
recordingSchema.index({ roomId: 1 });
recordingSchema.index({ meetingId: 1 });
recordingSchema.index({ host: 1 });
recordingSchema.index({ status: 1 });
recordingSchema.index({ 'metadata.weekNumber': 1, 'metadata.year': 1 });
recordingSchema.index({ 'metadata.year': 1, 'metadata.month': 1 });
recordingSchema.index({ createdAt: 1 });
recordingSchema.index({ 'recordingInfo.startedAt': 1 });

// Pre-save middleware
recordingSchema.pre('save', function(next) {
  // Calculate week number and date metadata
  if (this.recordingInfo.startedAt) {
    const date = new Date(this.recordingInfo.startedAt);
    this.metadata.year = date.getFullYear();
    this.metadata.month = date.getMonth() + 1;
    this.metadata.day = date.getDate();
    
    // Calculate week number
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    this.metadata.weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }
  
  // Calculate duration if ended
  if (this.recordingInfo.endedAt && this.recordingInfo.startedAt) {
    this.recordingInfo.duration = Math.floor((this.recordingInfo.endedAt - this.recordingInfo.startedAt) / 1000);
  }
  
  next();
});

// Instance methods
recordingSchema.methods.startRecording = function() {
  this.status = 'recording';
  this.recordingInfo.startedAt = new Date();
};

recordingSchema.methods.stopRecording = function() {
  this.status = 'processing';
  this.recordingInfo.endedAt = new Date();
  this.processingInfo.processingStartedAt = new Date();
};

recordingSchema.methods.completeProcessing = function(fileSize) {
  this.status = 'completed';
  this.recordingInfo.fileSize = fileSize;
  this.processingInfo.progress = 100;
  this.processingInfo.processingCompletedAt = new Date();
};

recordingSchema.methods.failProcessing = function(error) {
  this.status = 'failed';
  this.processingInfo.error = error;
  this.processingInfo.processingCompletedAt = new Date();
};

recordingSchema.methods.markAsDeleted = function() {
  this.status = 'deleted';
};

recordingSchema.methods.addView = function(userId, ipAddress, userAgent) {
  this.analytics.views++;
  this.analytics.lastViewed = new Date();
  this.analytics.viewHistory.push({
    userId,
    viewedAt: new Date(),
    ipAddress,
    userAgent
  });
};

recordingSchema.methods.addDownload = function(userId, ipAddress, userAgent) {
  this.analytics.downloads++;
  this.analytics.lastDownloaded = new Date();
  this.analytics.downloadHistory.push({
    userId,
    downloadedAt: new Date(),
    ipAddress,
    userAgent
  });
};

recordingSchema.methods.canAccess = function(user) {
  // Admin can access all recordings
  if (user.role === 'admin') return true;
  
  // Check if user is host
  if (this.host.toString() === user._id.toString()) return true;
  
  // Check if user is in allowed users
  if (this.accessControl.allowedUsers.some(id => id.toString() === user._id.toString())) {
    return true;
  }
  
  // Check if user role is allowed
  if (this.accessControl.allowedRoles.includes(user.role)) {
    return true;
  }
  
  return false;
};

recordingSchema.methods.getFilePath = function() {
  return path.join(process.cwd(), 'uploads', 'recordings', this.recordingInfo.fileName);
};

recordingSchema.methods.deleteFile = async function() {
  try {
    const filePath = this.getFilePath();
    await fs.unlink(filePath);
    
    // Delete thumbnail if exists
    if (this.metadata.thumbnailPath) {
      const thumbnailPath = path.join(process.cwd(), 'uploads', 'thumbnails', this.metadata.thumbnailPath);
      await fs.unlink(thumbnailPath);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting recording file:', error);
    return false;
  }
};

// Static methods
recordingSchema.statics.findByWeek = function(weekNumber, year) {
  return this.find({
    'metadata.weekNumber': weekNumber,
    'metadata.year': year,
    status: { $ne: 'deleted' }
  }).sort({ 'recordingInfo.startedAt': -1 });
};

recordingSchema.statics.findByMonth = function(month, year) {
  return this.find({
    'metadata.month': month,
    'metadata.year': year,
    status: { $ne: 'deleted' }
  }).sort({ 'recordingInfo.startedAt': -1 });
};

recordingSchema.statics.findByHost = function(hostId) {
  return this.find({
    host: hostId,
    status: { $ne: 'deleted' }
  }).sort({ 'recordingInfo.startedAt': -1 });
};

recordingSchema.statics.findCompleted = function() {
  return this.find({
    status: 'completed'
  }).sort({ 'recordingInfo.startedAt': -1 });
};

recordingSchema.statics.cleanupExpiredRecordings = async function() {
  const expiredRecordings = await this.find({
    'settings.autoDelete': true,
    'settings.retentionDays': { $exists: true },
    createdAt: {
      $lt: new Date(Date.now() - this.settings.retentionDays * 24 * 60 * 60 * 1000)
    },
    status: { $ne: 'deleted' }
  });

  for (const recording of expiredRecordings) {
    await recording.deleteFile();
    recording.markAsDeleted();
    await recording.save();
  }

  return expiredRecordings.length;
};

recordingSchema.statics.getWeeklyStats = function(year) {
  return this.aggregate([
    {
      $match: {
        'metadata.year': year,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$metadata.weekNumber',
        count: { $sum: 1 },
        totalDuration: { $sum: '$recordingInfo.duration' },
        totalSize: { $sum: '$recordingInfo.fileSize' },
        recordings: { $push: '$$ROOT' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

module.exports = mongoose.model('Recording', recordingSchema); 