const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  employeetype: { type: mongoose.Schema.Types.ObjectId, ref: "EmployeeType" },
  availability: [{ type: String, enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] }],
  meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meeting" }],
  status: { type: String, enum: ["pending", "approved", "inactive"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema); 