const express = require('express');
const router = express.Router();
const controller = require('../../controller/employee/employeeauth');

router.post('/login', controller.employeeLogin);

module.exports = router;