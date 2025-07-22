const Slot = require('../../model/calender');
const dayjs = require('dayjs');
const Employeetype = require('../../model/Employeetype');

// Render Calendar Page
exports.renderCalendar = async(req, res) => {

 // Default to 'all' if not specified
const slots = await Slot.find().populate('employeeType');
  
  res.render('admin/commoncalender',{slots, title: "Calendar", activePage: 'commoncalender'});
};

exports.renderCommonCalendar = async (req, res) => {
  const slots = await Slot.find().populate('employeeType');
  res.render('admin/commoncalender', { slots, title: "Common Calendar", activePage: 'commoncalender' });
};

exports.getEmployeeTypes = async (req, res) => {
  try {
    const employeeTypes = await Employeetype.find();
    res.json(employeeTypes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee types' });
  }
}
// Get All Slots
// Get All Slots (optionally filter by employeeType)
exports.getSlots = async (req, res) => {
  try {
    const { employeeType } = req.query;
    const filter = {};
    if (employeeType) filter.employeeType = employeeType;
    const slots = await Slot.find(filter).populate('employeeType');
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching slots' });
  }
};

// Generate Slots
exports.generateSlots = async (req, res) => {
  try {
    const { fromDate, toDate, startTime, endTime, slotsPerDay, dayOfWeek, employeeType } = req.body;
    //  console.log(req.body);
    if (!fromDate || !toDate || !startTime || !endTime || !slotsPerDay || !dayOfWeek || !employeeType) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const generatedSlots = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDay = d.toLocaleString('en-us', { weekday: 'long' });
      if (currentDay.toLowerCase() === dayOfWeek.toLowerCase()) {
        // Parse start and end time
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const slotStartBase = new Date(d);
        slotStartBase.setHours(startHour, startMinute, 0, 0);
        const slotEndBase = new Date(d);
        slotEndBase.setHours(endHour, endMinute, 0, 0);

        const totalMinutes = (slotEndBase - slotStartBase) / (60 * 1000);
        const slotDuration = totalMinutes / slotsPerDay;

        for (let i = 0; i < slotsPerDay; i++) {
          const slotStart = new Date(slotStartBase.getTime() + i * slotDuration * 60 * 1000);
          const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

          const slot = new Slot({
            start: slotStart,
            end: slotEnd,
            status: 'available',
            employeeType,
          });

          await slot.save();
          generatedSlots.push(slot);
        }
      }
    }

    // console.log(generatedSlots);

    res.status(200).json({ success: true, message: 'Slots generated successfully', slots: generatedSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error occurred.' });
  }
};

// Block a specific slot
exports.blockSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.id, { status: 'blocked' }, { new: true });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: 'Error blocking slot' });
  }
};

// Block all slots for a specific date
exports.blockDay = async (req, res) => {
  const date = req.params.date;
  try {
    const start = dayjs(date).startOf('day').toDate();
    const end = dayjs(date).endOf('day').toDate();

    await Slot.updateMany(
      { start: { $gte: start, $lte: end } },
      { $set: { status: 'blocked' } }
    );

    res.json({ message: 'Full day blocked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error blocking day' });
  }
};

// Patch: Reschedule a specific slot
exports.rescheduleSlot = async (req, res) => {
  try {
    const { date, start, end } = req.body;
    if (!date || !start || !end) {
      return res.status(400).json({ message: 'date, start, and end are required' });
    }
    // Parse new start and end datetimes
    const newStart = dayjs(`${date}T${start}`).toDate();
    const newEnd = dayjs(`${date}T${end}`).toDate();

    if (isNaN(newStart) || isNaN(newEnd)) {
      return res.status(400).json({ message: 'Invalid start or end time' });
    }
    if (newEnd <= newStart) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const updated = await Slot.findByIdAndUpdate(
      req.params.id,
      {
        start: newStart,
        end: newEnd,
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

// Unblock a specific slot
exports.unblockSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.id, { status: 'available' }, { new: true });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unblock all slots for a specific date
exports.unblockDay = async (req, res) => {
  try {
    const { date } = req.params;
    const startOfDay = new Date(date + 'T00:00:00');
    const endOfDay = new Date(date + 'T23:59:59');

    await Slot.updateMany(
      { start: { $gte: startOfDay, $lte: endOfDay }, status: 'blocked' },
      { status: 'available' }
    );
    res.json({ message: 'Day unblocked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};