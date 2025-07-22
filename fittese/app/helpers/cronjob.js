const cron = require('node-cron');
const Meeting = require('../model/meetings');
const User = require('../model/user');
const sendEmail = require('../utils/email');

// Run every day at 9am
cron.schedule('0 9 * * *', async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Find meetings scheduled for today
    const meetings = await Meeting.find({
      status: 'scheduled',
      // Assuming slot is populated with start time
    }).populate('user').populate('slot');

    for (const meeting of meetings) {
      if (!meeting.slot || !meeting.user) continue;
      const slotStart = new Date(meeting.slot.start);
      if (slotStart >= today && slotStart < tomorrow) {
        // Send reminder to user
        await sendEmail({
          to: meeting.user.email,
          subject: 'Meeting Reminder',
          html: `<p>Dear ${meeting.user.name},<br>Your meeting is scheduled for today at ${slotStart.toLocaleTimeString()}.<br>Meeting Link: <a href='${meeting.videoLink}'>Join Meeting</a></p>`
        });
        // Send reminder to admin (assuming admin email is in env)
        if (process.env.ADMIN_EMAIL) {
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: 'User Meeting Reminder',
            html: `<p>User ${meeting.user.name} has a meeting scheduled today at ${slotStart.toLocaleTimeString()}.</p>`
          });
        }
      }
    }
    console.log('Daily meeting reminders sent.');
  } catch (err) {
    console.error('Error sending daily reminders:', err);
  }
});
