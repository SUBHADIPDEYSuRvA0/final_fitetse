const Recording = require('../../model/recording');
const VideoRoom = require('../../model/videoRooms');
const User = require('../../model/user');
const path = require('path');
const fs = require('fs').promises;
const archiver = require('archiver');
const recordingService = require('../../utils/recordingService');

class RecordingsController {
  /**
   * Get recordings dashboard
   */
  async getRecordingsDashboard(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const week = parseInt(req.query.week);
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const status = req.query.status;
      const search = req.query.search;

      // Build query
      let query = { status: { $ne: 'deleted' } };
      
      if (week && year) {
        query['metadata.weekNumber'] = week;
        query['metadata.year'] = year;
      } else if (year) {
        query['metadata.year'] = year;
      }
      
      if (status) {
        query.status = status;
      }
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { 'hostName': { $regex: search, $options: 'i' } },
          { 'hostEmail': { $regex: search, $options: 'i' } }
        ];
      }

      // Get recordings with pagination
      const recordings = await Recording.find(query)
        .populate('host', 'name email')
        .sort({ 'recordingInfo.startedAt': -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Get total count
      const total = await Recording.countDocuments(query);

      // Get weekly statistics
      const weeklyStats = await Recording.aggregate([
        {
          $match: { 
            status: 'completed',
            'metadata.year': year 
          }
        },
        {
          $group: {
            _id: '$metadata.weekNumber',
            count: { $sum: 1 },
            totalDuration: { $sum: '$recordingInfo.duration' },
            totalSize: { $sum: '$recordingInfo.fileSize' },
            weekNumber: { $first: '$metadata.weekNumber' }
          }
        },
        {
          $sort: { weekNumber: 1 }
        }
      ]);

      // Get overall statistics
      const stats = await recordingService.getRecordingStats();

      // Get active recordings
      const activeRecordings = recordingService.getActiveRecordings();

      res.render('admin/recordings', {
        title: 'Video Recordings',
        recordings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        filters: {
          week,
          year,
          status,
          search
        },
        weeklyStats,
        stats,
        activeRecordings,
        user: req.user,
        activePage: 'recordings'
      });

    } catch (error) {
      console.error('Error getting recordings dashboard:', error);
      res.status(500).render('admin/error', {
        title: 'Error',
        message: 'Failed to load recordings dashboard',
        error
      });
    }
  }

  /**
   * Get recordings by week
   */
  async getRecordingsByWeek(req, res) {
    try {
      const { week, year } = req.params;
      const weekNumber = parseInt(week);
      const yearNumber = parseInt(year);

      const recordings = await Recording.find({
        'metadata.weekNumber': weekNumber,
        'metadata.year': yearNumber,
        status: { $ne: 'deleted' }
      })
        .populate('host', 'name email')
        .sort({ 'recordingInfo.startedAt': -1 })
        .lean();

      const weekStats = await Recording.aggregate([
        {
          $match: {
            'metadata.weekNumber': weekNumber,
            'metadata.year': yearNumber,
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalDuration: { $sum: '$recordingInfo.duration' },
            totalSize: { $sum: '$recordingInfo.fileSize' }
          }
        }
      ]);

      res.json({
        success: true,
        recordings,
        stats: weekStats[0] || { count: 0, totalDuration: 0, totalSize: 0 },
        week: weekNumber,
        year: yearNumber
      });

    } catch (error) {
      console.error('Error getting recordings by week:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recordings'
      });
    }
  }

  /**
   * Download single recording
   */
  async downloadRecording(req, res) {
    try {
      const { recordingId } = req.params;

      const recording = await Recording.findById(recordingId);
      if (!recording) {
        return res.status(404).json({
          success: false,
          message: 'Recording not found'
        });
      }

      // Check access permissions
      if (!recording.canAccess(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const filePath = recording.getFilePath();
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Recording file not found'
        });
      }

      // Update download analytics
      recording.addDownload(req.user._id, req.ip, req.get('User-Agent'));
      await recording.save();

      // Set headers for download
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="${recording.recordingInfo.fileName}"`);
      res.setHeader('Content-Length', recording.recordingInfo.fileSize);

      // Stream the file
      const fileStream = require('fs').createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error downloading recording:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download recording'
      });
    }
  }

  /**
   * Download recordings by week (ZIP)
   */
  async downloadWeekRecordings(req, res) {
    try {
      const { week, year } = req.params;
      const weekNumber = parseInt(week);
      const yearNumber = parseInt(year);

      const recordings = await Recording.find({
        'metadata.weekNumber': weekNumber,
        'metadata.year': yearNumber,
        status: 'completed'
      }).sort({ 'recordingInfo.startedAt': 1 });

      if (recordings.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No recordings found for this week'
        });
      }

      // Create ZIP file
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      const zipFileName = `recordings-week-${weekNumber}-${yearNumber}.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

      archive.pipe(res);

      // Add files to ZIP
      for (const recording of recordings) {
        const filePath = recording.getFilePath();
        
        try {
          await fs.access(filePath);
          const fileName = `${recording.title.replace(/[^a-z0-9]/gi, '_')}_${recording.recordingInfo.startedAt.toISOString().split('T')[0]}.mp4`;
          archive.file(filePath, { name: fileName });
        } catch (error) {
          console.error(`File not found for recording ${recording._id}:`, error);
        }
      }

      await archive.finalize();

    } catch (error) {
      console.error('Error downloading week recordings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create download package'
      });
    }
  }

  /**
   * View recording details
   */
  async viewRecording(req, res) {
    try {
      const { recordingId } = req.params;

      const recording = await Recording.findById(recordingId)
        .populate('host', 'name email')
        .populate('participants.userId', 'name email');

      if (!recording) {
        return res.status(404).render('admin/error', {
          title: 'Not Found',
          message: 'Recording not found'
        });
      }

      // Check access permissions
      if (!recording.canAccess(req.user)) {
        return res.status(403).render('admin/error', {
          title: 'Access Denied',
          message: 'You do not have permission to view this recording'
        });
      }

      // Update view analytics
      recording.addView(req.user._id, req.ip, req.get('User-Agent'));
      await recording.save();

      res.render('admin/recording-details', {
        title: `Recording: ${recording.title}`,
        recording,
        user: req.user,
        activePage: 'recordings'
      });

    } catch (error) {
      console.error('Error viewing recording:', error);
      res.status(500).render('admin/error', {
        title: 'Error',
        message: 'Failed to load recording details',
        error
      });
    }
  }

  /**
   * Delete recording
   */
  async deleteRecording(req, res) {
    try {
      const { recordingId } = req.params;

      const recording = await Recording.findById(recordingId);
      if (!recording) {
        return res.status(404).json({
          success: false,
          message: 'Recording not found'
        });
      }

      // Only admin can delete recordings
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can delete recordings'
        });
      }

      // Delete file from disk
      const fileDeleted = await recording.deleteFile();
      
      // Mark as deleted in database
      recording.markAsDeleted();
      await recording.save();

      res.json({
        success: true,
        message: 'Recording deleted successfully',
        fileDeleted
      });

    } catch (error) {
      console.error('Error deleting recording:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete recording'
      });
    }
  }

  /**
   * Get recording statistics
   */
  async getRecordingStats(req, res) {
    try {
      const stats = await recordingService.getRecordingStats();
      const activeRecordings = recordingService.getActiveRecordings();

      // Get weekly stats for current year
      const currentYear = new Date().getFullYear();
      const weeklyStats = await Recording.aggregate([
        {
          $match: { 
            status: 'completed',
            'metadata.year': currentYear 
          }
        },
        {
          $group: {
            _id: '$metadata.weekNumber',
            count: { $sum: 1 },
            totalDuration: { $sum: '$recordingInfo.duration' },
            totalSize: { $sum: '$recordingInfo.fileSize' },
            weekNumber: { $first: '$metadata.weekNumber' }
          }
        },
        {
          $sort: { weekNumber: 1 }
        }
      ]);

      res.json({
        success: true,
        stats,
        activeRecordings,
        weeklyStats
      });

    } catch (error) {
      console.error('Error getting recording stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics'
      });
    }
  }

  /**
   * Clean up old recordings
   */
  async cleanupOldRecordings(req, res) {
    try {
      const { days } = req.body;
      const daysToKeep = parseInt(days) || 90;

      // Only admin can perform cleanup
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can perform cleanup'
        });
      }

      const deletedCount = await recordingService.cleanupOldRecordings(daysToKeep);

      res.json({
        success: true,
        message: `Cleaned up ${deletedCount} old recordings`,
        deletedCount
      });

    } catch (error) {
      console.error('Error cleaning up old recordings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clean up recordings'
      });
    }
  }

  /**
   * Get recording API endpoint
   */
  async getRecordingsAPI(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const week = parseInt(req.query.week);
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const status = req.query.status;

      let query = { status: { $ne: 'deleted' } };
      
      if (week && year) {
        query['metadata.weekNumber'] = week;
        query['metadata.year'] = year;
      }
      
      if (status) {
        query.status = status;
      }

      const recordings = await Recording.find(query)
        .populate('host', 'name email')
        .sort({ 'recordingInfo.startedAt': -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await Recording.countDocuments(query);

      res.json({
        success: true,
        recordings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error getting recordings API:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recordings'
      });
    }
  }
}

module.exports = new RecordingsController(); 