const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    democall: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
    },
    callingid: String,
    address: String,
    description: String,
    test: {
        type: Map,
        of: String,  // Each key (questionId) will map to a String (the answer)
    },
    role: {
        type: String,
        enum: ["admin", "employee", "user"],
        default: "user",
    },
    isactive: {
        type: Boolean,
        default: false,
    },
    employeetype:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeType",
    }
    ,
    isStatus: {
        type: String,
       enum: ["active", "inactive"],
        default: "active",
    },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
