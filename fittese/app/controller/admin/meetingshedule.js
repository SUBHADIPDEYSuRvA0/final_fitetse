
// Create and schedule a meeting
exports.scheduleMeeting = async (req, res) => {
  try {
    const { title, description, userId, slotId } = req.body;

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (slot.status === "booked") {
      return res.status(400).json({ message: "Slot is already booked" });
    }

    const meetingCode = "FITSE-" + Math.random().toString(36).substr(2, 6).toUpperCase();

    const meeting = new ScheduledMeeting({
      title,
      description,
      user: userId,
      slot: slotId,
      meetingCode
    });

    await meeting.save();

    // Update slot status
    slot.status = "booked";
    await slot.save();

    res.status(201).json({ message: "Meeting scheduled", meeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Share meeting with one or more employees
exports.shareMeeting = async (req, res) => {
  try {
    const { meetingId, employeeIds } = req.body;

    const meeting = await ScheduledMeeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    // Ensure no duplicates
    employeeIds.forEach(empId => {
      if (!meeting.employees.some(e => e.employee.toString() === empId)) {
        meeting.employees.push({ employee: empId, sharedStatus: "shared" });
      }
    });

    await meeting.save();

    res.status(200).json({ message: "Meeting shared with employees", meeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List all scheduled meetings
exports.getAllMeetings = async (req, res) => {
  try {
    const meetings = await ScheduledMeeting.find()
      .populate("user", "name email")
      .populate("slot")
      .populate("employees.employee", "name email");

    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel a meeting and free the slot
exports.cancelMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await ScheduledMeeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    // Free up the slot
    const slot = await Slot.findById(meeting.slot);
    if (slot) {
      slot.status = "available";
      await slot.save();
    }

    meeting.status = "cancelled";
    await meeting.save();

    res.status(200).json({ message: "Meeting cancelled", meeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View a single meeting
exports.getMeetingById = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await ScheduledMeeting.findById(meetingId)
      .populate("user", "name email")
      .populate("slot")
      .populate("employees.employee", "name email");

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.renderMeetingsPage = async (req, res) => {
  // Fetch meetings if needed, e.g.:
  // const meetings = await Meeting.find();
  res.render('admin/meetings', { /* meetings, */ title: 'Meetings', activePage: 'meetings' });
};
