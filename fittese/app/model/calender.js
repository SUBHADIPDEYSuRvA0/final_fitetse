const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  start: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  end: {
    type: Date,
    required: [true, 'End time is required'],
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'blocked', 'rescheduled'],
    default: 'available',
  },
  employeeType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeType',
    required: [true, 'Employee type is required'],
  },
  day: {
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Automatically set the day based on the `start` date
slotSchema.pre('save', function (next) {
  if (!this.day && this.start) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.day = daysOfWeek[this.start.getDay()];
  }
  next();
});

module.exports = mongoose.model('calender', slotSchema);
