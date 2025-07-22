const Meeting = require('../../model/meetings');
const User = require('../../model/user');
const Slot = require('../../model/slots');
// If you have a Notification model, require it here
// const Notification = require('../../model/notification');
const bcrypt = require('bcrypt');

class EmployeePagesController {
    home(req, res) {
        res.render('employee/index');
    }
    login(req, res) {
        res.render('employee/login');
    }
    // Upcoming meetings
    async upcomingMeetings(req, res) {
        const employeeId = req.session.user._id;
        const meetings = await Meeting.find({ employee: employeeId, status: 'scheduled' })
            .populate('user')
            .populate('slot')
            .lean();
        res.render('employee/meetings_upcoming', { meetings });
    }
    // Past meetings
    async pastMeetings(req, res) {
        const employeeId = req.session.user._id;
        const meetings = await Meeting.find({
            employee: employeeId,
            status: { $in: ['completed', 'past'] }
        })
            .populate('user')
            .populate('slot')
            .lean();
        res.render('employee/meetings_past', { meetings });
    }
    // Meeting details
    async meetingDetails(req, res) {
        const meeting = await Meeting.findById(req.params.id)
            .populate('user')
            .populate('slot')
            .lean();
        if (!meeting) return res.status(404).send('Meeting not found');
        res.render('employee/meeting_details', { meeting });
    }
    // Availability
    async availability(req, res) {
        const employee = await User.findById(req.session.user._id).lean();
        res.render('employee/availability', { availability: employee.availability || [] });
    }
    async setAvailability(req, res) {
        const days = Array.isArray(req.body.days) ? req.body.days : [req.body.days];
        await User.findByIdAndUpdate(req.session.user._id, { availability: days });
        res.redirect('/employee/availability');
    }
    // Notifications
    async notifications(req, res) {
        // Uncomment and use if you have a Notification model
        // const notifications = await Notification.find({ employee: req.session.user._id }).sort({ createdAt: -1 }).lean();
        // res.render('employee/notifications', { notifications });
        res.render('employee/notifications', { notifications: [] }); // Placeholder
    }
    // Profile
    async profile(req, res) {
        const employee = await User.findById(req.session.user._id).lean();
        res.render('employee/profile', { employee });
    }
    // Change password form
    changePasswordForm(req, res) {
        res.render('employee/change_password');
    }
    // Change password logic
    async changePassword(req, res) {
        const { oldPassword, newPassword } = req.body;
        const employee = await User.findById(req.session.user._id);
        const isMatch = await bcrypt.compare(oldPassword, employee.password);
        if (!isMatch) {
            return res.render('employee/change_password', { error: 'Old password is incorrect' });
        }
        employee.password = await bcrypt.hash(newPassword, 10);
        await employee.save();
        res.render('employee/change_password', { success: 'Password changed successfully' });
    }
}

module.exports = new EmployeePagesController();