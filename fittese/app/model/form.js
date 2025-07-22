const mongoose = require('mongoose');

const meetingFormSchema = new mongoose.Schema({
  meetingSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeetingSlot',
    required: true,
  },
  filledByEmail: {
    type: String, // Admin or employee who filled the form
    required: true,
    lowercase: true,
    trim: true,
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  notes: {
    type: String,
    default: '',
    trim: true,
  },
  employeeTransferredTo: {
    type: String,
    lowercase: true,
    trim: true,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  versionKey: false,
});

module.exports = mongoose.model('MeetingForm', meetingFormSchema);
