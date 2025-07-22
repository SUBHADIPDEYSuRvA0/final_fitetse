const MeetingForm = require('../../model/form');
const MeetingSlot = require('../../model/calender');

// Show the form page (GET)
exports.getFormPage = async (req, res) => {
  try {
    const { slotId } = req.params;
    const slot = await MeetingSlot.findById(slotId);

    if (!slot) return res.status(404).send('Meeting slot not found');

    res.render('meetingForm', {
      slot,
      userEmail: req.user.email // assuming logged in
    });
  } catch (err) {
    console.error('Error loading form page:', err);
    res.status(500).send('Server Error');
  }
};

// Submit the form (POST)
exports.submitForm = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { userEmail, notes, employeeTransferredTo } = req.body;

    const slot = await MeetingSlot.findById(slotId);
    if (!slot) return res.status(404).send('Slot not found');

    await MeetingForm.create({
      meetingSlotId: slotId,
      filledByEmail: req.user.email, // Admin/Employee
      userEmail,
      notes,
      employeeTransferredTo: employeeTransferredTo || null,
    });

    res.redirect('/dashboard'); // or any success page
  } catch (error) {
    console.error('Form submission failed:', error);
    res.status(500).send('Failed to submit form');
  }
};
