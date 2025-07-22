const User = require('../../model/user');
const Meeting = require('../../model/meetings');
const Payment = require('../../model/payments');
const Slot = require('../../model/slots');
const Employeetype = require('../../model/Employeetype');

class UserDashboardController {
    /**
     * Get user dashboard data
     */
    async getUserDashboard(req, res) {
        try {
            const userId = req.user._id;
            
            // Get user's meetings
            const userMeetings = await Meeting.find({ user: userId })
                .populate('employee', 'name email')
                .populate('slot', 'start end')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            // Get user's payments
            const userPayments = await Payment.find({ user: userId })
                .populate('plan', 'name price')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            // Get user profile
            const userProfile = await User.findById(userId).lean();

            // Get available employees
            const employees = await User.find({ role: 'employee' })
                .populate('employeetype')
                .lean();

            // Get available slots
            const availableSlots = await Slot.find({ status: 'available' })
                .sort({ start: 1 })
                .limit(10)
                .lean();

            res.json({
                success: true,
                data: {
                    user: userProfile,
                    meetings: userMeetings,
                    payments: userPayments,
                    employees: employees,
                    availableSlots: availableSlots
                }
            });

        } catch (error) {
            console.error('Error getting user dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to load dashboard data'
            });
        }
    }

    /**
     * Get available employees
     */
    async getAvailableEmployees(req, res) {
        try {
            const employees = await User.find({ role: 'employee' })
                .populate('employeetype')
                .lean();

            res.json({
                success: true,
                employees: employees
            });

        } catch (error) {
            console.error('Error getting employees:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to load employees'
            });
        }
    }

    /**
     * Get available slots
     */
    async getAvailableSlots(req, res) {
        try {
            const { employeeId, date } = req.query;
            
            let query = { status: 'available' };
            
            if (employeeId) {
                query.employee = employeeId;
            }
            
            if (date) {
                const startDate = new Date(date);
                const endDate = new Date(date);
                endDate.setDate(endDate.getDate() + 1);
                query.start = { $gte: startDate, $lt: endDate };
            }

            const slots = await Slot.find(query)
                .populate('employee', 'name email')
                .sort({ start: 1 })
                .lean();

            res.json({
                success: true,
                slots: slots
            });

        } catch (error) {
            console.error('Error getting slots:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to load slots'
            });
        }
    }

    /**
     * Book a meeting
     */
    async bookMeeting(req, res) {
        try {
            const { slotId, employeeId, meetingType, description } = req.body;
            const userId = req.user._id;

            // Validate required fields
            if (!slotId || !employeeId) {
                return res.status(400).json({
                    success: false,
                    message: 'Slot and employee are required'
                });
            }

            // Check if slot is available
            const slot = await Slot.findById(slotId);
            if (!slot || slot.status !== 'available') {
                return res.status(400).json({
                    success: false,
                    message: 'Selected slot is not available'
                });
            }

            // Create meeting
            const meetingData = {
                title: `${meetingType || 'Consultation'} Meeting`,
                user: userId,
                employee: employeeId,
                slot: slotId,
                meetingType: meetingType || 'consultation',
                status: 'scheduled',
                description: description || '',
                startTime: slot.start,
                endTime: slot.end
            };

            const meeting = new Meeting(meetingData);
            await meeting.save();

            // Update slot status
            await Slot.findByIdAndUpdate(slotId, { status: 'booked' });

            // Generate video link
            const videoRoomId = `fittese-${meeting._id}`;
            const videoLink = `http://localhost:3200/video/join/${videoRoomId}`;
            
            await Meeting.findByIdAndUpdate(meeting._id, { videoLink });

            res.json({
                success: true,
                message: 'Meeting booked successfully',
                meeting: {
                    ...meeting.toObject(),
                    videoLink
                }
            });

        } catch (error) {
            console.error('Error booking meeting:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to book meeting'
            });
        }
    }

    /**
     * Get user's meetings
     */
    async getUserMeetings(req, res) {
        try {
            const userId = req.user._id;
            const { status } = req.query;

            let query = { user: userId };
            if (status) {
                query.status = status;
            }

            const meetings = await Meeting.find(query)
                .populate('employee', 'name email')
                .populate('slot', 'start end')
                .sort({ createdAt: -1 })
                .lean();

            res.json({
                success: true,
                meetings: meetings
            });

        } catch (error) {
            console.error('Error getting user meetings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to load meetings'
            });
        }
    }

    /**
     * Cancel a meeting
     */
    async cancelMeeting(req, res) {
        try {
            const { meetingId } = req.params;
            const userId = req.user._id;

            const meeting = await Meeting.findOne({ _id: meetingId, user: userId });
            if (!meeting) {
                return res.status(404).json({
                    success: false,
                    message: 'Meeting not found'
                });
            }

            if (meeting.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Meeting is already cancelled'
                });
            }

            // Update meeting status
            await Meeting.findByIdAndUpdate(meetingId, { status: 'cancelled' });

            // Free up the slot
            if (meeting.slot) {
                await Slot.findByIdAndUpdate(meeting.slot, { status: 'available' });
            }

            res.json({
                success: true,
                message: 'Meeting cancelled successfully'
            });

        } catch (error) {
            console.error('Error cancelling meeting:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel meeting'
            });
        }
    }

    /**
     * Get user profile
     */
    async getUserProfile(req, res) {
        try {
            const userId = req.user._id;
            const user = await User.findById(userId).lean();

            res.json({
                success: true,
                user: user
            });

        } catch (error) {
            console.error('Error getting user profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to load profile'
            });
        }
    }

    /**
     * Update user profile
     */
    async updateUserProfile(req, res) {
        try {
            const userId = req.user._id;
            const { name, email, phone } = req.body;

            const updateData = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (phone) updateData.phone = phone;

            const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).lean();

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: user
            });

        } catch (error) {
            console.error('Error updating user profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }
    }

    /**
     * Get user's payments
     */
    async getUserPayments(req, res) {
        try {
            const userId = req.user._id;
            const payments = await Payment.find({ user: userId })
                .populate('plan', 'name price')
                .sort({ createdAt: -1 })
                .lean();

            res.json({
                success: true,
                payments: payments
            });

        } catch (error) {
            console.error('Error getting user payments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to load payments'
            });
        }
    }
}

module.exports = new UserDashboardController(); 