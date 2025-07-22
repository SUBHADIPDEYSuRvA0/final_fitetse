const express = require('express');
const router = express.Router();
const calendarController = require('../../controller/admin/slots.controller');
const adminAuth = require('../../middleware/adminAuth');

// Render calendar view
router.get('/', adminAuth, calendarController.renderCalendar);

// Get all slots (for FullCalendar frontend)
router.get('/slots', adminAuth, calendarController.getSlots);

// Generate slots in bulk for a date range
router.post('/generate-slots', adminAuth, calendarController.generateSlots);

// Block a specific slot by ID
router.patch('/block-slot/:id', adminAuth, calendarController.blockSlot);

// Block all slots for a specific date
router.patch('/block-day/:date', adminAuth, calendarController.blockDay);

// Reschedule a specific slot by ID
router.patch('/reschedule/:id', adminAuth, calendarController.rescheduleSlot);
router.patch('/unblock-slot/:id', adminAuth, calendarController.unblockSlot);
router.patch('/unblock-day/:date', adminAuth, calendarController.unblockDay);

// New routes for enhanced slot management
router.put('/:id/status', adminAuth, calendarController.updateSlotStatus);
router.put('/:id/reschedule', adminAuth, calendarController.rescheduleSlotWithDetails);
router.get('/:id', adminAuth, calendarController.getSlotDetails);
router.delete('/:id', adminAuth, calendarController.deleteSlot);
router.delete('/delete-all', adminAuth, calendarController.deleteAllSlots);

module.exports = router;
