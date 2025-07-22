const mongoose = require("mongoose");

const employeeTypeSchema = new mongoose.Schema({
  type:{
      type: String,
      required: true
  }
});

module.exports = mongoose.model("EmployeeType", employeeTypeSchema);