const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const recordingsController = require('../../controller/admin/recordings.controller');

// Apply admin authentication to all routes
router.use(adminAuth);

// Recordings dashboard
router.get('/recordings', recordingsController.getRecordingsDashboard);

// Get recordings by week
router.get('/recordings/week/:week/:year', recordingsController.getRecordingsByWeek);

// View recording details
router.get('/recordings/view/:recordingId', recordingsController.viewRecording);

// Download single recording
router.get('/recordings/download/:recordingId', recordingsController.downloadRecording);

// Download week recordings (ZIP)
router.get('/recordings/download-week/:week/:year', recordingsController.downloadWeekRecordings);

// Delete recording
router.delete('/recordings/:recordingId', recordingsController.deleteRecording);

// Get recording statistics
router.get('/recordings/stats', recordingsController.getRecordingStats);

// Clean up old recordings
router.post('/recordings/cleanup', recordingsController.cleanupOldRecordings);

// API endpoints
router.get('/api/recordings', recordingsController.getRecordingsAPI);

module.exports = router; 