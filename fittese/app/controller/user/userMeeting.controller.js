const User = require('../../model/user');
const Meeting = require('../../model/meetings');
const Slot = require('../../model/slots');
const sendEmail = require('../../utils/email');

class UserMeetingController {

    /**
     * @swagger
     * /user/meetings/available-slots:
     *   get:
     *     summary: Get available slots for booking
     *     tags: [User Meetings]
     *     parameters:
     *       - in: query
     *         name: date
     *         schema:
     *           type: string
     *         description: Date filter (YYYY-MM-DD)
     *       - in: query
     *         name: employeeId
     *         schema:
     *           type: string
     *         description: Filter by specific employee
     *     responses:
     *       200:
     *         description: List of available slots
     */
    getAvailableSlots = async (req, res) => {
        try {
            const { date, employeeId } = req.query;
            const userId = req.user.id;

            // Build query for available slots
            const query = { status: 'available' };
            
            if (date) {
                const startDate = new Date(date);
                const endDate = new Date(date);
                endDate.setDate(endDate.getDate() + 1);
                query.start = { $gte: startDate, $lt: endDate };
            }

            // Get available slots
            const slots = await Slot.find(query)
                .populate('employee', 'name email employeetype')
                .sort({ start: 1 })
                .lean();

            // Filter by employee if specified
            let filteredSlots = slots;
            if (employeeId) {
                filteredSlots = slots.filter(slot => 
                    slot.employee && slot.employee._id.toString() === employeeId
                );
            }

            // Group slots by employee
            const slotsByEmployee = {};
            filteredSlots.forEach(slot => {
                const employeeId = slot.employee ? slot.employee._id.toString() : 'unassigned';
                if (!slotsByEmployee[employeeId]) {
                    slotsByEmployee[employeeId] = {
                        employee: slot.employee,
                        slots: []
                    };
                }
                slotsByEmployee[employeeId].slots.push(slot);
            });

            res.json({
                success: true,
                slots: filteredSlots,
                slotsByEmployee: Object.values(slotsByEmployee)
            });

        } catch (error) {
            console.error('Error fetching available slots:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch available slots',
                error: error.message
            });
        }
    };

    /**
     * @swagger
     * /user/meetings/book:
     *   post:
     *     summary: Book a meeting with an employee
     *     tags: [User Meetings]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               slotId:
     *                 type: string
     *               employeeId:
     *                 type: string
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               meetingType:
     *                 type: string
     *                 enum: [consultation, training, assessment]
     *     responses:
     *       201:
     *         description: Meeting booked successfully
     *       400:
     *         description: Invalid input or slot not available
     */
    bookMeeting = async (req, res) => {
        try {
            const { slotId, employeeId, title, description, meetingType } = req.body;
            const userId = req.user.id;

            // Validate input
            if (!slotId || !employeeId) {
                return res.status(400).json({
                    success: false,
                    message: 'Slot ID and Employee ID are required'
                });
            }

            // Check if slot exists and is available
            const slot = await Slot.findById(slotId);
            if (!slot) {
                return res.status(404).json({
                    success: false,
                    message: 'Slot not found'
                });
            }

            if (slot.status !== 'available') {
                return res.status(400).json({
                    success: false,
                    message: 'Slot is not available'
                });
            }

            // Check if employee exists
            const employee = await User.findById(employeeId);
            if (!employee || employee.role !== 'employee') {
                return res.status(404).json({
                    success: false,
                    message: 'Employee not found'
                });
            }

            // Create meeting
            const meeting = new Meeting({
                title: title || `Meeting with ${employee.name}`,
                description: description || '',
                user: userId,
                employee: employeeId,
                slot: slotId,
                status: 'scheduled',
                meetingType: meetingType || 'consultation',
                group: false
            });

            await meeting.save();

            // Update slot status
            slot.status = 'booked';
            slot.bookedBy = userId;
            await slot.save();

            // Generate video call link
            const videoRoomId = `fittese-${meeting._id}`;
            const videoLink = `${req.protocol}://${req.get('host')}/video/join/${videoRoomId}`;
            
            // Update meeting with video link
            await Meeting.findByIdAndUpdate(meeting._id, { videoLink });

            // Send confirmation emails
            const user = await User.findById(userId);
            
            // Email to user
            await sendEmail({
                to: user.email,
                subject: 'Meeting Confirmed',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Meeting Confirmed! 🎉</h2>
                        <p>Dear ${user.name},</p>
                        <p>Your meeting has been successfully booked.</p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>Meeting Details:</h3>
                            <p><strong>Title:</strong> ${meeting.title}</p>
                            <p><strong>Employee:</strong> ${employee.name}</p>
                            <p><strong>Date:</strong> ${new Date(slot.start).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> ${new Date(slot.start).toLocaleTimeString()} - ${new Date(slot.end).toLocaleTimeString()}</p>
                            <p><strong>Type:</strong> ${meeting.meetingType}</p>
                            <p><strong>Video Link:</strong> <a href="${videoLink}">Join Meeting</a></p>
                        </div>
                        
                        <p>We look forward to seeing you!</p>
                    </div>
                `
            });

            // Email to employee
            await sendEmail({
                to: employee.email,
                subject: 'New Meeting Scheduled',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>New Meeting Scheduled 📅</h2>
                        <p>Dear ${employee.name},</p>
                        <p>A new meeting has been scheduled with you.</p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>Meeting Details:</h3>
                            <p><strong>Client:</strong> ${user.name}</p>
                            <p><strong>Title:</strong> ${meeting.title}</p>
                            <p><strong>Date:</strong> ${new Date(slot.start).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> ${new Date(slot.start).toLocaleTimeString()} - ${new Date(slot.end).toLocaleTimeString()}</p>
                            <p><strong>Type:</strong> ${meeting.meetingType}</p>
                            <p><strong>Video Link:</strong> <a href="${videoLink}">Join Meeting</a></p>
                        </div>
                        
                        <p>Please be ready for the meeting!</p>
                    </div>
                `
            });

            res.status(201).json({
                success: true,
                message: 'Meeting booked successfully',
                meeting: {
                    id: meeting._id,
                    title: meeting.title,
                    employee: {
                        id: employee._id,
                        name: employee.name,
                        email: employee.email
                    },
                    slot: {
                        start: slot.start,
                        end: slot.end
                    },
                    videoLink,
                    status: meeting.status
                }
            });

        } catch (error) {
            console.error('Error booking meeting:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to book meeting',
                error: error.message
            });
        }
    };

    /**
     * @swagger
     * /user/meetings/my-meetings:
     *   get:
     *     summary: Get user's meetings
     *     tags: [User Meetings]
     *     parameters:
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [scheduled, completed, cancelled]
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: List of user's meetings
     */
    getMyMeetings = async (req, res) => {
        try {
            const userId = req.user.id;
            const { status, page = 1, limit = 10 } = req.query;

            // Build query
            const query = { user: userId };
            if (status) {
                query.status = status;
            }

            // Get meetings with pagination
            const meetings = await Meeting.find(query)
                .populate('employee', 'name email employeetype')
                .populate('slot', 'start end')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .lean();

            const total = await Meeting.countDocuments(query);

            res.json({
                success: true,
                meetings: meetings.map(meeting => ({
                    id: meeting._id,
                    title: meeting.title,
                    description: meeting.description,
                    status: meeting.status,
                    meetingType: meeting.meetingType,
                    videoLink: meeting.videoLink,
                    employee: meeting.employee,
                    slot: meeting.slot,
                    createdAt: meeting.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    hasNextPage: page * limit < total,
                    hasPrevPage: page > 1
                }
            });

        } catch (error) {
            console.error('Error fetching user meetings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch meetings',
                error: error.message
            });
        }
    };

    /**
     * @swagger
     * /user/meetings/{meetingId}:
     *   get:
     *     summary: Get meeting details
     *     tags: [User Meetings]
     *     parameters:
     *       - in: path
     *         name: meetingId
     *         schema:
     *           type: string
     *         required: true
     *     responses:
     *       200:
     *         description: Meeting details
     *       404:
     *         description: Meeting not found
     */
    getMeetingDetails = async (req, res) => {
        try {
            const { meetingId } = req.params;
            const userId = req.user.id;

            const meeting = await Meeting.findOne({ _id: meetingId, user: userId })
                .populate('employee', 'name email employeetype phone')
                .populate('slot', 'start end')
                .lean();

            if (!meeting) {
                return res.status(404).json({
                    success: false,
                    message: 'Meeting not found'
                });
            }

            res.json({
                success: true,
                meeting: {
                    id: meeting._id,
                    title: meeting.title,
                    description: meeting.description,
                    status: meeting.status,
                    meetingType: meeting.meetingType,
                    videoLink: meeting.videoLink,
                    employee: meeting.employee,
                    slot: meeting.slot,
                    createdAt: meeting.createdAt,
                    updatedAt: meeting.updatedAt
                }
            });

        } catch (error) {
            console.error('Error fetching meeting details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch meeting details',
                error: error.message
            });
        }
    };

    /**
     * @swagger
     * /user/meetings/{meetingId}/cancel:
     *   post:
     *     summary: Cancel a meeting
     *     tags: [User Meetings]
     *     parameters:
     *       - in: path
     *         name: meetingId
     *         schema:
     *           type: string
     *         required: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               reason:
     *                 type: string
     *     responses:
     *       200:
     *         description: Meeting cancelled successfully
     *       404:
     *         description: Meeting not found
     */
    cancelMeeting = async (req, res) => {
        try {
            const { meetingId } = req.params;
            const { reason } = req.body;
            const userId = req.user.id;

            const meeting = await Meeting.findOne({ _id: meetingId, user: userId })
                .populate('employee', 'name email')
                .populate('slot');

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

            if (meeting.status === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot cancel completed meeting'
                });
            }

            // Update meeting status
            meeting.status = 'cancelled';
            meeting.cancellationReason = reason;
            meeting.cancelledAt = new Date();
            await meeting.save();

            // Free up the slot
            if (meeting.slot) {
                meeting.slot.status = 'available';
                meeting.slot.bookedBy = null;
                await meeting.slot.save();
            }

            // Send cancellation emails
            const user = await User.findById(userId);

            // Email to user
            await sendEmail({
                to: user.email,
                subject: 'Meeting Cancelled',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Meeting Cancelled</h2>
                        <p>Dear ${user.name},</p>
                        <p>Your meeting has been cancelled.</p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>Meeting Details:</h3>
                            <p><strong>Title:</strong> ${meeting.title}</p>
                            <p><strong>Employee:</strong> ${meeting.employee.name}</p>
                            <p><strong>Date:</strong> ${new Date(meeting.slot.start).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> ${new Date(meeting.slot.start).toLocaleTimeString()} - ${new Date(meeting.slot.end).toLocaleTimeString()}</p>
                            <p><strong>Reason:</strong> ${reason || 'No reason provided'}</p>
                        </div>
                        
                        <p>You can book a new meeting anytime.</p>
                    </div>
                `
            });

            // Email to employee
            await sendEmail({
                to: meeting.employee.email,
                subject: 'Meeting Cancelled',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Meeting Cancelled</h2>
                        <p>Dear ${meeting.employee.name},</p>
                        <p>A meeting has been cancelled.</p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>Meeting Details:</h3>
                            <p><strong>Client:</strong> ${user.name}</p>
                            <p><strong>Title:</strong> ${meeting.title}</p>
                            <p><strong>Date:</strong> ${new Date(meeting.slot.start).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> ${new Date(meeting.slot.start).toLocaleTimeString()} - ${new Date(meeting.slot.end).toLocaleTimeString()}</p>
                            <p><strong>Reason:</strong> ${reason || 'No reason provided'}</p>
                        </div>
                        
                        <p>The slot is now available for other bookings.</p>
                    </div>
                `
            });

            res.json({
                success: true,
                message: 'Meeting cancelled successfully',
                meeting: {
                    id: meeting._id,
                    status: meeting.status,
                    cancelledAt: meeting.cancelledAt
                }
            });

        } catch (error) {
            console.error('Error cancelling meeting:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel meeting',
                error: error.message
            });
        }
    };

    /**
     * @swagger
     * /user/meetings/employees:
     *   get:
     *     summary: Get available employees
     *     tags: [User Meetings]
     *     responses:
     *       200:
     *         description: List of available employees
     */
    getAvailableEmployees = async (req, res) => {
        try {
            const employees = await User.find({ role: 'employee', isActive: true })
                .populate('employeetype', 'type description')
                .select('name email phone employeetype avatar')
                .lean();

            res.json({
                success: true,
                employees: employees.map(employee => ({
                    id: employee._id,
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone,
                    avatar: employee.avatar,
                    employeetype: employee.employeetype
                }))
            });

        } catch (error) {
            console.error('Error fetching employees:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch employees',
                error: error.message
            });
        }
    };
}

module.exports = new UserMeetingController(); 