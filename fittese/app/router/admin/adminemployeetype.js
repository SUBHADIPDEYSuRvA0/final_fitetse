const express = require('express');
const router = express.Router();
const controller = require('../../controller/admin/createemployeetype');


router.post('/employeetypes/create', controller.createType);
router.post('/employeetypes/update/:id', controller.updateType);
router.get('/employeetypes/delete/:id', controller.deleteType);

module.exports = router;
