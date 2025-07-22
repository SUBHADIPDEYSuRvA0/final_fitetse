const express = require('express');
const app = express.Router();


app.use('/employee', require('./employee.pages.routes'));
app.use('/employee/auth', require('./employee.auth.routes'));

module.exports = app;