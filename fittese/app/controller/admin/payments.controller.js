const Payment = require('../../model/payments');
const User = require('../../model/user');
const Plans = require('../../model/plans');

class PaymentsController {
    /**
     * Get payments dashboard
     */
    async getPaymentsDashboard(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const search = req.query.search;

            // Build query
            let query = {};
            
            if (status) {
                query.status = status;
            }
            
            if (search) {
                query.$or = [
                    { 'user.email': { $regex: search, $options: 'i' } },
                    { 'user.name': { $regex: search, $options: 'i' } },
                    { paymentId: { $regex: search, $options: 'i' } }
                ];
            }

            // Get payments with populated user and plan data
            const payments = await Payment.find(query)
                .populate('user', 'name email')
                .populate('plan', 'name price')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            // Get total count
            const total = await Payment.countDocuments(query);

            // Get payment statistics
            const stats = await this.getPaymentStats();

            // Get paid users
            const paidUsers = await this.getPaidUsers();

            res.render('admin/payments', {
                title: 'Payments Management',
                payments,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                filters: {
                    status,
                    search
                },
                stats,
                paidUsers,
                user: req.user,
                activePage: 'payments'
            });

        } catch (error) {
            console.error('Error getting payments dashboard:', error);
            res.status(500).render('admin/error', {
                title: 'Error',
                message: 'Failed to load payments dashboard',
                error
            });
        }
    }

    /**
     * Get payment statistics
     */
    async getPaymentStats() {
        const [totalRevenue, totalPayments, successfulPayments, pendingPayments, failedPayments] = await Promise.all([
            // Total revenue
            Payment.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            // Total payments
            Payment.countDocuments(),

            // Successful payments
            Payment.countDocuments({ status: 'paid' }),

            // Pending payments
            Payment.countDocuments({ status: 'pending' }),

            // Failed payments
            Payment.countDocuments({ status: 'failed' })
        ]);

        return {
            totalRevenue: totalRevenue[0]?.total ? (totalRevenue[0].total / 100).toFixed(2) : 0,
            totalPayments,
            successfulPayments,
            pendingPayments,
            failedPayments,
            successRate: totalPayments > 0 ? ((successfulPayments / totalPayments) * 100).toFixed(1) : 0
        };
    }

    /**
     * Get paid users
     */
    async getPaidUsers() {
        const paidUsers = await Payment.aggregate([
            { $match: { status: 'paid' } },
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userData' } },
            { $unwind: '$userData' },
            { $lookup: { from: 'plans', localField: 'plan', foreignField: '_id', as: 'planData' } },
            { $unwind: '$planData' },
            { $group: {
                _id: '$user',
                user: { $first: '$userData' },
                plan: { $first: '$planData' },
                totalPaid: { $sum: '$amount' },
                paymentCount: { $sum: 1 },
                lastPayment: { $max: '$createdAt' }
            } },
            { $sort: { lastPayment: -1 } },
            { $limit: 20 }
        ]);

        return paidUsers;
    }

    /**
     * Get payments API
     */
    async getPaymentsAPI(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const status = req.query.status;

            let query = {};
            if (status) {
                query.status = status;
            }

            const payments = await Payment.find(query)
                .populate('user', 'name email')
                .populate('plan', 'name price')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            const total = await Payment.countDocuments(query);

            res.json({
                success: true,
                payments,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error('Error getting payments API:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payments'
            });
        }
    }

    /**
     * Get paid users API
     */
    async getPaidUsersAPI(req, res) {
        try {
            const paidUsers = await this.getPaidUsers();
            
            res.json({
                success: true,
                paidUsers
            });

        } catch (error) {
            console.error('Error getting paid users API:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get paid users'
            });
        }
    }
}

module.exports = new PaymentsController(); 