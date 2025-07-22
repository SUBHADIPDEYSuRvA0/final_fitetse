const Recording = require('../model/recording');
const VideoRoom = require('../model/videoRooms');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');

class RecordingService {
  constructor() {
    this.activeRecordings = new Map(); // roomId -> recording process
    this.recordingQueue = new Map(); // roomId -> queue info
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'recordings');
    this.thumbnailsDir = path.join(process.cwd(), 'uploads', 'thumbnails');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      await fs.mkdir(this.thumbnailsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  /**
   * Start automatic recording when minimum participants join
   */
  async startAutomaticRecording(roomId, videoRoom) {
    try {
      // Check if auto-recording is enabled
      if (!videoRoom.recording.autoRecord) {
        console.log(`Auto-recording disabled for room ${roomId}`);
        return null;
      }

      // Check minimum participants
      const activeParticipants = videoRoom.participants.filter(p => !p.leftAt && p.socketId);
      const minParticipants = videoRoom.recording.minParticipantsForRecording || 2;

      if (activeParticipants.length < minParticipants) {
        console.log(`Not enough participants for recording in room ${roomId}. Need ${minParticipants}, have ${activeParticipants.length}`);
        return null;
      }

      // Check if already recording
      if (videoRoom.recording.isRecording) {
        console.log(`Already recording in room ${roomId}`);
        return null;
      }

      console.log(`Starting automatic recording for room ${roomId} with ${activeParticipants.length} participants`);

      // Create recording record
      const recording = new Recording({
        roomId: videoRoom.roomId,
        meetingId: videoRoom.meetingId,
        title: `${videoRoom.title} - ${new Date().toLocaleDateString()}`,
        description: videoRoom.description || 'Automatic recording',
        host: videoRoom.host,
        hostName: videoRoom.hostName,
        hostEmail: videoRoom.hostEmail,
        participants: activeParticipants.map(p => ({
          userId: p.userId,
          name: p.name,
          email: p.email,
          role: p.role
        })),
        accessControl: {
          isPublic: false,
          allowedRoles: ['admin']
        },
        metadata: {
          category: videoRoom.category || 'fitness',
          tags: ['auto-recorded', 'video-call']
        },
        settings: {
          autoDelete: false,
          retentionDays: 90,
          compressionEnabled: true,
          watermarkEnabled: true,
          watermarkText: 'FITETSE - Recorded Call'
        }
      });

      await recording.save();

      // Update video room
      videoRoom.recording.isRecording = true;
      videoRoom.recording.startedAt = new Date();
      videoRoom.recording.recordingId = recording._id;
      await videoRoom.save();

      // Start recording process
      await this.startRecordingProcess(recording, videoRoom);

      return recording;
    } catch (error) {
      console.error('Error starting automatic recording:', error);
      return null;
    }
  }

  /**
   * Start the actual recording process
   */
  async startRecordingProcess(recording, videoRoom) {
    try {
      const fileName = `recording_${recording._id}_${Date.now()}.mp4`;
      const filePath = path.join(this.uploadsDir, fileName);

      // Update recording with file info
      recording.recordingInfo.fileName = fileName;
      recording.recordingInfo.filePath = filePath;
      recording.recordingInfo.startedAt = new Date();
      recording.status = 'recording';
      await recording.save();

      // Start FFmpeg recording process
      const ffmpegProcess = this.startFFmpegRecording(filePath, recording);

      // Store active recording
      this.activeRecordings.set(videoRoom.roomId, {
        recording,
        process: ffmpegProcess,
        startTime: Date.now()
      });

      console.log(`Recording started for room ${videoRoom.roomId}: ${fileName}`);

      return recording;
    } catch (error) {
      console.error('Error starting recording process:', error);
      recording.status = 'failed';
      recording.processingInfo.error = error.message;
      await recording.save();
      return null;
    }
  }

  /**
   * Start FFmpeg recording with screen capture and audio
   * Platform-specific configuration for Windows, macOS, and Linux.
   */
  startFFmpegRecording(outputPath, recording) {
    const os = require('os');
    const platform = os.platform();

    let command = ffmpeg();

    if (platform === 'win32') {
      // Windows: gdigrab for screen, dshow for audio
      command = command
        .input('desktop')
        .inputOptions([
          '-f', 'gdigrab',
          '-framerate', '30',
          '-i', 'desktop'
        ])
        .input('audio=virtual-audio-capturer')
        .inputOptions([
          '-f', 'dshow',
          '-i', 'audio=virtual-audio-capturer'
        ]);
    } else if (platform === 'darwin') {
      // macOS: avfoundation for both screen and audio
      // Note: You may need to adjust the device numbers (0:0) as per your system
      command = command
        .input('0:0')
        .inputOptions([
          '-f', 'avfoundation',
          '-framerate', '30',
          '-video_size', '1280x720'
        ]);
      // For audio, you may need to add another input for the audio device if available
    } else {
      // Linux: x11grab for screen, pulse for audio
      // Note: You may need to adjust the display and audio device as per your system
      command = command
        .input(':0.0')
        .inputOptions([
          '-f', 'x11grab',
          '-framerate', '30',
          '-video_size', '1280x720'
        ])
        .input('default')
        .inputOptions([
          '-f', 'pulse',
          '-i', 'default'
        ]);
    }

    command = command
      .outputOptions([
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-y'
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg recording started:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Recording progress: ${progress.percent}%`);
      })
      .on('error', async (err) => {
        console.error('FFmpeg recording error:', err);
        await this.handleRecordingError(recording, err);
      })
      .on('end', async () => {
        console.log('FFmpeg recording completed');
        await this.handleRecordingComplete(recording, outputPath);
      });

    command.run();
    return command;
  }

  /**
   * Stop recording for a room
   */
  async stopRecording(roomId) {
    try {
      const recordingInfo = this.activeRecordings.get(roomId);
      if (!recordingInfo) {
        console.log(`No active recording found for room ${roomId}`);
        return null;
      }

      const { recording, process } = recordingInfo;

      // Stop FFmpeg process
      if (process && !process.killed) {
        process.kill('SIGTERM');
      }

      // Update recording status
      recording.status = 'processing';
      recording.recordingInfo.endedAt = new Date();
      recording.processingInfo.processingStartedAt = new Date();
      await recording.save();

      // Update video room
      const videoRoom = await VideoRoom.findOne({ roomId });
      if (videoRoom) {
        videoRoom.recording.isRecording = false;
        videoRoom.recording.endedAt = new Date();
        await videoRoom.save();
      }

      // Remove from active recordings
      this.activeRecordings.delete(roomId);

      console.log(`Recording stopped for room ${roomId}`);

      return recording;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }

  /**
   * Handle recording completion
   */
  async handleRecordingComplete(recording, filePath) {
    try {
      // Get file stats
      const stats = await fs.stat(filePath);
      
      // Generate thumbnail
      const thumbnailPath = await this.generateThumbnail(filePath, recording._id);
      
      // Update recording
      recording.status = 'completed';
      recording.recordingInfo.fileSize = stats.size;
      recording.recordingInfo.endedAt = new Date();
      recording.processingInfo.progress = 100;
      recording.processingInfo.processingCompletedAt = new Date();
      
      if (thumbnailPath) {
        recording.metadata.thumbnailPath = path.basename(thumbnailPath);
      }
      
      await recording.save();

      console.log(`Recording completed: ${recording.recordingInfo.fileName}`);
    } catch (error) {
      console.error('Error handling recording completion:', error);
      await this.handleRecordingError(recording, error);
    }
  }

  /**
   * Handle recording errors
   */
  async handleRecordingError(recording, error) {
    try {
      recording.status = 'failed';
      recording.processingInfo.error = error.message;
      recording.processingInfo.processingCompletedAt = new Date();
      await recording.save();

      // Clean up file if exists
      try {
        await fs.unlink(recording.recordingInfo.filePath);
      } catch (unlinkError) {
        console.error('Error deleting failed recording file:', unlinkError);
      }

      console.error(`Recording failed: ${recording.recordingInfo.fileName}`, error.message);
    } catch (saveError) {
      console.error('Error saving recording error state:', saveError);
    }
  }

  /**
   * Generate thumbnail from video
   */
  async generateThumbnail(videoPath, recordingId) {
    try {
      const thumbnailName = `thumb_${recordingId}_${Date.now()}.jpg`;
      const thumbnailPath = path.join(this.thumbnailsDir, thumbnailName);

      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .screenshots({
            timestamps: ['50%'], // Take screenshot at 50% of video
            filename: thumbnailName,
            folder: this.thumbnailsDir,
            size: '320x240'
          })
          .on('end', () => {
            console.log(`Thumbnail generated: ${thumbnailName}`);
            resolve(thumbnailPath);
          })
          .on('error', (err) => {
            console.error('Error generating thumbnail:', err);
            resolve(null);
          });
      });
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }

  /**
   * Check if room should start recording
   */
  async checkAndStartRecording(roomId, participantCount) {
    try {
      const videoRoom = await VideoRoom.findOne({ roomId });
      if (!videoRoom) return null;

      const minParticipants = videoRoom.recording.minParticipantsForRecording || 2;

      if (participantCount >= minParticipants && !videoRoom.recording.isRecording) {
        return await this.startAutomaticRecording(roomId, videoRoom);
      }

      return null;
    } catch (error) {
      console.error('Error checking recording conditions:', error);
      return null;
    }
  }

  /**
   * Get recording statistics
   */
  async getRecordingStats() {
    try {
      const stats = await Recording.aggregate([
        {
          $group: {
            _id: null,
            totalRecordings: { $sum: 1 },
            totalDuration: { $sum: '$recordingInfo.duration' },
            totalSize: { $sum: '$recordingInfo.fileSize' },
            completedRecordings: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            failedRecordings: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalRecordings: 0,
        totalDuration: 0,
        totalSize: 0,
        completedRecordings: 0,
        failedRecordings: 0
      };
    } catch (error) {
      console.error('Error getting recording stats:', error);
      return null;
    }
  }

  /**
   * Clean up old recordings
   */
  async cleanupOldRecordings(daysToKeep = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const oldRecordings = await Recording.find({
        createdAt: { $lt: cutoffDate },
        status: 'completed'
      });

      let deletedCount = 0;
      for (const recording of oldRecordings) {
        try {
          await recording.deleteFile();
          recording.markAsDeleted();
          await recording.save();
          deletedCount++;
        } catch (error) {
          console.error(`Error deleting recording ${recording._id}:`, error);
        }
      }

      console.log(`Cleaned up ${deletedCount} old recordings`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old recordings:', error);
      return 0;
    }
  }

  /**
   * Get active recordings
   */
  getActiveRecordings() {
    return Array.from(this.activeRecordings.entries()).map(([roomId, info]) => ({
      roomId,
      recordingId: info.recording._id,
      startTime: info.startTime,
      duration: Math.floor((Date.now() - info.startTime) / 1000)
    }));
  }

  /**
   * Check if room is being recorded
   */
  isRecording(roomId) {
    return this.activeRecordings.has(roomId);
  }
}

module.exports = new RecordingService(); 