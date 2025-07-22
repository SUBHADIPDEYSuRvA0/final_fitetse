const express = require('express');
const router = express.Router();

// Import existing route handlers
const userRouter = require('../user');
const adminRouter = require('../admin');

// Legacy user routes
router.use('/user', userRouter);

// Legacy admin routes  
router.use('/admin', adminRouter);

// Legacy slots endpoint (already exists in user router)
router.get('/slots', async (req, res) => {
  try {
    const Slot = require('../../model/slots');
    const now = new Date();
    const slots = await Slot.find({ 
      status: 'available', 
      start: { $gte: now } 
    }).sort({ start: 1 });
    
    res.json(slots);
  } catch (error) {
    console.error('Legacy slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching slots'
    });
  }
});

// Legacy login endpoint (redirect to auth API)
router.post('/login', async (req, res) => {
  try {
    const userAuthController = require('../../controller/user/userAuth.controller');
    await userAuthController.login(req, res);
  } catch (error) {
    console.error('Legacy login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Legacy signup endpoint (redirect to auth API)
router.post('/signup', async (req, res) => {
  try {
    const userAuthController = require('../../controller/user/userAuth.controller');
    await userAuthController.signup(req, res);
  } catch (error) {
    console.error('Legacy signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during signup'
    });
  }
});

module.exports = router;
