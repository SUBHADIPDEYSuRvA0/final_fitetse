const express = require('express');
const router = express.Router();
const User = require('../../model/user');
const Meeting = require('../../model/meetings');
const Payment = require('../../model/payments');

// Get analytics data (admin only)
router.get('/', async (req, res) => {
  try {
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Get basic counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMeetings = await Meeting.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSignups = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get meetings this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const meetingsThisMonth = await Meeting.countDocuments({
      createdAt: { $gte: firstDayOfMonth }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalMeetings,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        recentSignups,
        meetingsThisMonth
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user growth data
router.get('/user-growth', async (req, res) => {
  try {
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userGrowth = await User.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: userGrowth
    });

  } catch (error) {
    console.error('User growth analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get meeting statistics
router.get('/meetings', async (req, res) => {
  try {
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const meetingStats = await Meeting.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: meetingStats
    });

  } catch (error) {
    console.error('Meeting analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
