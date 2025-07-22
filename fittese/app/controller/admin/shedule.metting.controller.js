const ScheduledMeeting = require('../../model/shaercoustomaislots');
const Slot = require('../../model/calender');
const User = require('../../model/user');
const crypto = require('crypto');

/**
 * Create a new scheduled meeting with slots and employees
 */
exports.createMeeting = async (req, res) => {
  try {
    const { title, description, userId, slotIds, employeeIds } = req.body;

    // Generate unique meeting code
    const meetingCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Prepare slots array with initial handler (first employee)
    const slots = [];
    for (let i = 0; i < slotIds.length; i++) {
      slots.push({
        slot: slotIds[i],
        handledBy: [
          {
            employee: employeeIds[i] // Assign each slot to an employee initially
          }
        ],
        status: 'scheduled'
      });

      // Mark slot as booked
      await Slot.findByIdAndUpdate(slotIds[i], { status: 'booked' });
    }

    const meeting = await ScheduledMeeting.create({
      title,
      description,
      user: userId,
      slots,
      meetingCode,
      status: 'scheduled'
    });

    res.redirect('/meetings');
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
};

/**
 * Transfer a slot from one employee to another
 */
exports.transferSlot = async (req, res) => {
  try {
    const { meetingId, slotId, fromEmployeeId, toEmployeeId } = req.body;

    const meeting = await ScheduledMeeting.findById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    const slotEntry = meeting.slots.find(s => String(s.slot) === String(slotId));
    if (!slotEntry) throw new Error('Slot not found in meeting');

    // Check current handler
    const lastHandler = slotEntry.handledBy[slotEntry.handledBy.length - 1];
    if (!lastHandler || String(lastHandler.employee) !== String(fromEmployeeId)) {
      throw new Error('Slot is not currently handled by this employee');
    }

    // Only transfer if slot is not completed or cancelled
    if (['completed', 'cancelled'].includes(slotEntry.status)) {
      throw new Error('Cannot transfer a completed or cancelled slot');
    }

    // Add new handler and update status
    slotEntry.handledBy.push({ employee: toEmployeeId });
    slotEntry.status = 'transferred';

    // Optionally update main meeting status
    const allTransferredOrCompleted = meeting.slots.every(
      s => ['transferred', 'completed'].includes(s.status)
    );
    if (allTransferredOrCompleted) meeting.status = 'completed';

    await meeting.save();

    res.redirect('/meetings');
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
};

/**
 * List all meetings (with details)
 */
exports.listMeetings = async (req, res) => {
  try {
    const meetings = await ScheduledMeeting.find()
      .populate('user')
      .populate('slots.slot')
      .populate('slots.handledBy.employee')
      .exec();
    res.render('admin/meetings', { meetings, activePage: 'meetings' });
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
};

/**
 * Render Create Meeting Form
 */
exports.renderCreateForm = async (req, res) => {
  const users = await User.find({ role: 'user' });
  const employees = await User.find({ role: 'employee' });
  const slots = await Slot.find({ status: 'available' });
  res.render('meetings/create', { users, employees, slots });
};

/**
 * Render Transfer Slot Form
 */
exports.renderTransferForm = async (req, res) => {
  const meetings = await ScheduledMeeting.find().populate('slots.slot');
  const employees = await User.find({ role: 'employee' });
  res.render('meetings/transfer', { meetings, employees });
};