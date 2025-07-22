const express = require('express');
const app = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const analyticsController = require('../../controller/admin/analytics.controller');

// Analytics API for dashboard
app.get('/admin/analytics/api', adminAuth, (req, res) => analyticsController.getDashboardStats(req, res));

// Payment routes
app.use('/', require('./paymentroutes'));

// Authentication routes (no auth required)
app.use('/admin', require('./auth.routes'));

// Admin pages routes
app.use('/admin', require('./adminpages.routes'));

// Employee management routes
app.use('/admin', require('./admin.createemployee'));

// Employee type routes
app.use('/admin', require('./adminemployeetype'));

// Plan routes
app.use('/admin', require('./planroutes'));

// Question routes
app.use('/admin', require('./adminquestions'));

// Slot routes
app.use('/admin', require('./adminsllots'));

// Calendar routes
app.use('/admin', require('./admincommoncalender'));

// Meeting schedule routes
app.use('/admin', require('./shedulemeeting.routes'));

// Request routes
app.use('/admin', require('./request.routes'));

// Recording routes
app.use('/admin', require('./recordingroutes'));

module.exports = app;