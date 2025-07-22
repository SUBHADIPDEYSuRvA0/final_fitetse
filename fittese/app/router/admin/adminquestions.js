const express = require('express');
const router = express.Router();

const questionsController = require('../../controller/admin/adminquestions');

router.post('/update', questionsController.updateObecityQuestions);

module.exports = router;