const mongoose = require('mongoose');

const scheduledMeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  slots: [
    {
      slot: { type: mongoose.Schema.Types.ObjectId, ref: "calender", required: true },
      handledBy: [
        {
          employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          transferredAt: { type: Date, default: Date.now }
        }
      ],
      status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'transferred'],
        default: 'scheduled'
      }
    }
  ],
  meetingCode: { type: String, unique: true },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, { timestamps: true });

module.exports = mongoose.model('ScheduledMeeting', scheduledMeetingSchema);