const express = require('express');
const router = express.Router();
const calendarController = require('../../controller/admin/common.calender');
const EmployeeType = require('../../model/Employeetype');

// Render calendar page
router.get('/slot', calendarController.renderCalendar);

// Get all slots
router.get('/slots', calendarController.getSlots);

// Generate slots (POST)
router.post('/generate-slots', calendarController.generateSlots);

// Block a specific slot
router.patch('/block-slot/:id', calendarController.blockSlot);

// Block all slots for a specific day
router.patch('/block-day/:date', calendarController.blockDay);

// Unblock a specific slot
router.patch('/unblock-slot/:id', calendarController.unblockSlot);

// Unblock all slots for a specific day
router.patch('/unblock-day/:date', calendarController.unblockDay);

// Reschedule a specific slot
router.patch('/reschedule/:id', calendarController.rescheduleSlot);

// Render common calendar page
router.get('/commoncalender', calendarController.renderCommonCalendar);

// Fetch all Employee Types (for dropdown)
router.get('/employee-types', async (req, res) => {
  try {
    const types = await EmployeeType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee types' });
  }
});

module.exports = router;