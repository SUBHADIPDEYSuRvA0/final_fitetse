const Slot = require('../../model/slots');
const dayjs = require('dayjs');

// Render Calendar Page
exports.renderCalendar = (req, res) => {
  res.render('admin/calendar', { activePage: 'calendar' });
};

// Get All Slots
exports.getSlots = async (req, res) => {
  try {
    console.log('getSlots called - fetching slots from database...');
    const slots = await Slot.find().sort({ start: 1 });
    console.log('Fetched slots:', slots.length);
    console.log('Sample slot:', slots[0]);
    res.json(slots);
  } catch (err) {
    console.error('Error fetching slots:', err);
    res.status(500).json({ message: 'Error fetching slots', error: err.message });
  }
};

// Generate Slots
exports.generateSlots = async (req, res) => {
  try {
    const { fromDate, toDate, startTime, endTime, slotsPerDay, dayOfWeek } = req.body;

    console.log('Generating slots with:', { fromDate, toDate, startTime, endTime, slotsPerDay, dayOfWeek });

    if (!fromDate || !toDate || !startTime || !endTime || !slotsPerDay || !dayOfWeek) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Parse times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Calculate total minutes for the time range
    const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    const slotDuration = Math.floor(totalMinutes / slotsPerDay);
    
    if (slotDuration <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid time range or too many slots per day.' });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const generatedSlots = [];
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Clear existing slots for the date range and day of week
    await Slot.deleteMany({
      start: { $gte: startDate, $lte: endDate },
      day: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
    });

    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const currentDayName = dayNames[currentDate.getDay()];
      
      if (currentDayName === dayOfWeek.toLowerCase()) {
        console.log(`Creating slots for ${currentDayName} on ${currentDate.toDateString()}`);
        
        for (let i = 0; i < slotsPerDay; i++) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(startHour, startMinute + (i * slotDuration), 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotStart.getMinutes() + slotDuration);
          
          const slot = new Slot({
            start: slotStart,
            end: slotEnd,
            status: 'available'
          });

          await slot.save();
          generatedSlots.push(slot);
          console.log(`Created slot: ${slotStart.toLocaleString()} - ${slotEnd.toLocaleString()}`);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Generated ${generatedSlots.length} slots`);
    res.status(200).json({ 
      success: true, 
      message: `Successfully generated ${generatedSlots.length} slots`, 
      slots: generatedSlots 
    });
  } catch (error) {
    console.error('Error generating slots:', error);
    res.status(500).json({ success: false, message: 'Server error occurred.' });
  }
};

/**
 * PATCH: Block a specific slot
 */
exports.blockSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.id, { status: 'blocked' }, { new: true });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (err) {
    console.error('Error blocking slot:', err);
    res.status(500).json({ message: 'Error blocking slot' });
  }
};

/**
 * PATCH: Block all slots for a specific date
 */
exports.blockDay = async (req, res) => {
  const date = req.params.date;
  try {
    const start = dayjs(date).startOf('day').toDate();
    const end = dayjs(date).endOf('day').toDate();

    const result = await Slot.updateMany(
      { start: { $gte: start, $lte: end } },
      { $set: { status: 'blocked' } }
    );

    console.log(`Blocked ${result.modifiedCount} slots for ${date}`);
    res.json({ message: `Blocked ${result.modifiedCount} slots for ${date}` });
  } catch (err) {
    console.error('Error blocking day:', err);
    res.status(500).json({ message: 'Error blocking day' });
  }
};

/**
 * PATCH: Reschedule a specific slot
 */
exports.rescheduleSlot = async (req, res) => {
  try {
    const { newStart, newEnd } = req.body;
    
    if (!newStart || !newEnd) {
      return res.status(400).json({ message: 'newStart and newEnd are required' });
    }

    const newStartDate = new Date(newStart);
    const newEndDate = new Date(newEnd);

    console.log('Rescheduling Slot:', {
      id: req.params.id,
      newStart: newStartDate,
      newEnd: newEndDate
    });

    const updated = await Slot.findByIdAndUpdate(
      req.params.id,
      {
        start: newStartDate,
        end: newEndDate,
        status: 'rescheduled'
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error('Error during slot rescheduling:', err);
    return res.status(500).json({ message: 'Error rescheduling slot' });
  }
};

/**
 * PATCH: Unblock a specific slot
 */
exports.unblockSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.id, { status: 'available' }, { new: true });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (err) {
    console.error('Error unblocking slot:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH: Unblock all slots for a specific date
 */
exports.unblockDay = async (req, res) => {
  try {
    const { date } = req.params;
    const startOfDay = new Date(date + 'T00:00:00');
    const endOfDay = new Date(date + 'T23:59:59');

    const result = await Slot.updateMany(
      { start: { $gte: startOfDay, $lte: endOfDay }, status: 'blocked' },
      { status: 'available' }
    );

    res.json({ message: `Unblocked ${result.modifiedCount} slots for ${date}` });
  } catch (err) {
    console.error('Error unblocking day:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT: Update slot status
 */
exports.updateSlotStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const slotId = req.params.id;

    const updateData = { status };
    if (notes) {
      updateData.notes = notes;
    }

    const slot = await Slot.findByIdAndUpdate(
      slotId,
      updateData,
      { new: true }
    ).populate('bookedBy', 'name email');

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    res.json({ success: true, slot });
  } catch (err) {
    console.error('Error updating slot status:', err);
    res.status(500).json({ success: false, message: 'Error updating slot status' });
  }
};

/**
 * PUT: Reschedule slot with new date and time
 */
exports.rescheduleSlotWithDetails = async (req, res) => {
  try {
    const { newDate, newStartTime, newEndTime, reason, notifyUser } = req.body;
    const slotId = req.params.id;

    // Create new start and end dates
    const newStart = new Date(`${newDate}T${newStartTime}`);
    const newEnd = new Date(`${newDate}T${newEndTime}`);

    // Validate time range
    if (newStart >= newEnd) {
      return res.status(400).json({ 
        success: false, 
        message: 'End time must be after start time' 
      });
    }

    // Check for conflicts
    const conflictingSlot = await Slot.findOne({
      _id: { $ne: slotId },
      start: { $lt: newEnd },
      end: { $gt: newStart },
      status: { $in: ['available', 'booked'] }
    });

    if (conflictingSlot) {
      return res.status(400).json({ 
        success: false, 
        message: 'Time slot conflicts with existing slot' 
      });
    }

    const updateData = {
      start: newStart,
      end: newEnd,
      status: 'rescheduled',
      rescheduleReason: reason,
      rescheduledAt: new Date()
    };

    const slot = await Slot.findByIdAndUpdate(
      slotId,
      updateData,
      { new: true }
    ).populate('bookedBy', 'name email');

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    // TODO: Send notification to user if notifyUser is true
    if (notifyUser && slot.bookedBy) {
      console.log(`Notification would be sent to ${slot.bookedBy.email} about reschedule`);
    }

    res.json({ success: true, slot });
  } catch (err) {
    console.error('Error rescheduling slot:', err);
    res.status(500).json({ success: false, message: 'Error rescheduling slot' });
  }
};

/**
 * GET: Get slot details by ID
 */
exports.getSlotDetails = async (req, res) => {
  try {
    const slotId = req.params.id;
    
    const slot = await Slot.findById(slotId)
      .populate('bookedBy', 'name email')
      .populate('meetingId', 'title description');

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    res.json({ success: true, slot });
  } catch (err) {
    console.error('Error getting slot details:', err);
    res.status(500).json({ success: false, message: 'Error getting slot details' });
  }
};

/**
 * DELETE: Delete a specific slot
 */
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    res.json({ success: true, message: 'Slot deleted successfully' });
  } catch (err) {
    console.error('Error deleting slot:', err);
    res.status(500).json({ success: false, message: 'Error deleting slot' });
  }
};

/**
 * DELETE: Delete all slots
 */
exports.deleteAllSlots = async (req, res) => {
  try {
    const result = await Slot.deleteMany({});
    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} slots successfully` 
    });
  } catch (err) {
    console.error('Error deleting all slots:', err);
    res.status(500).json({ success: false, message: 'Error deleting slots' });
  }
};
