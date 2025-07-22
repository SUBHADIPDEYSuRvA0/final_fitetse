const express = require('express');
const router = express.Router();
const controller = require('../../controller/admin/createplans.controller');

// Page routes
router.get('/plans', controller.renderPlansPage);
router.get('/plans/edit/:id', controller.renderEditPlanPage);

// CRUD operations
router.post('/plans/create', controller.createPlan);
router.post('/plans/update/:id', controller.updatePlan);
router.get('/plans/delete/:id', controller.deletePlan);

// Status management - support both GET and POST for compatibility
router.post('/plans/update-status/:id', controller.updateStatus);
router.get('/plans/update-status/:id', controller.updateStatus);
router.post('/plans/toggle-popular/:id', controller.togglePopular);
router.get('/plans/toggle-popular/:id', controller.togglePopular);

// API endpoints
router.get('/api/plans', controller.getPlans);
router.get('/api/plans/:id', controller.getPlan);

module.exports = router;