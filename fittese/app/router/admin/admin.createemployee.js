const express = require("express");
const router = express.Router();
const { addEmployee, toggleEmployeeStatus } = require("../../controller/admin/create.employee");

router.post("/add-employee", addEmployee);
router.post("/toggle-status/:id", toggleEmployeeStatus); 

module.exports = router;
