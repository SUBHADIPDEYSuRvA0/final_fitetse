const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  start: { 
    type: Date, 
    required: true,
    index: true // Add index for better query performance
  },
  end: { 
    type: Date, 
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'blocked', 'rescheduled'],
    default: 'available'
  },
  day: {
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  // Add reference to user if booked
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Add reference to meeting if created
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    default: null
  }
}, { 
  timestamps: true,
  // Add compound index for date range queries
  indexes: [
    { start: 1, end: 1 },
    { start: 1, status: 1 }
  ]
});

// Automatically populate the 'day' field before saving
slotSchema.pre('save', function (next) {
  if (this.start) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.day = daysOfWeek[this.start.getDay()];
  }
  next();
});

// Add validation to ensure end time is after start time
slotSchema.pre('save', function (next) {
  if (this.start && this.end && this.start >= this.end) {
    return next(new Error('End time must be after start time'));
  }
  next();
});

// Virtual for duration in minutes
slotSchema.virtual('duration').get(function() {
  if (this.start && this.end) {
    return Math.round((this.end - this.start) / (1000 * 60));
  }
  return 0;
});

// Ensure virtual fields are serialized
slotSchema.set('toJSON', { virtuals: true });
slotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Slot', slotSchema);
