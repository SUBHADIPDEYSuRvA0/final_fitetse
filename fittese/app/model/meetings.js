const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Add title field
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Make user optional
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // for admin role
  slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  videoLink: { type: String },
  status: { type: String, enum: ["scheduled", "completed", "cancelled", "rescheduled"], default: "scheduled" },
  recordingUrl: { type: String },
  problem: { type: String },
  description: { type: String }, // Add description field
  group: { type: Boolean, default: false },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // for group meetings
}, { timestamps: true });

module.exports = mongoose.model("Meeting", meetingSchema);
