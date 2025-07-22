const express = require('express');
const router = express.Router();
const pagescontroller = require('../../controller/user/page');
const userAuth = require('../../middleware/userAuth');
const bookingController = require('../../controller/user/booking');
const paymentController = require('../../controller/user/payment');
const userApi = require('../../controller/user/user.api');
const Slot = require('../../model/slots');
const Plans = require('../../model/plans');

// User panel home route
router.get('/', pagescontroller.dashboard);

// User panel themed routes (protected)
router.get('/user/panel', userAuth, (req, res) => res.render('user/panel/dashboard', { user: req.user, activePage: 'dashboard', meetings: [], payments: [] })); // Dashboard
router.get('/user/panel/book', userAuth, (req, res) => res.render('user/panel/book-meeting', { user: req.user, activePage: 'book' }));
router.get('/user/panel/meetings', userAuth, (req, res) => res.render('user/panel/meetings', { user: req.user, activePage: 'meetings' }));
router.get('/user/panel/profile', userAuth, (req, res) => res.render('user/panel/profile', { user: req.user, activePage: 'profile' }));
router.get('/user/panel/payments', userAuth, (req, res) => res.render('user/panel/payments', { user: req.user, activePage: 'payments' }));
router.get('/user/panel/plans', userAuth, pagescontroller.plansPage);

// Public booking route for guests (auto user creation)
router.post('/user/booking', bookingController.book);

// API route to get all available future slots for calendar/slot selection
router.get('/api/slots', async (req, res) => {
  try {
    const now = new Date();
    const slots = await Slot.find({ status: 'available', start: { $gte: now } });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching slots' });
  }
});

// User dashboard routes
router.use('/', require('./dashboard.routes'));

// User meeting routes
router.use('/', require('./meeting.routes'));

// User auth routes
router.use('/', require('./auth.routes'));

// User logout route
router.get('/user/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/user/login');
  });
});

router.post('/user/payment/order', userAuth, paymentController.createOrder);
router.post('/user/payment/verify', userAuth, paymentController.verifyPayment);
router.get('/user/payment/key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

router.get('/test', (req, res) => res.send('User router is working!'));

module.exports = router;