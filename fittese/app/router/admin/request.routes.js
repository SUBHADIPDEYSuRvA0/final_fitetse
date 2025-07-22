const express = require('express');
const router = express.Router();

const requestController = require('../../controller/admin/admin.request');


router.post('/request-videocall', requestController.createUserAndBookSlot);


module.exports = router;