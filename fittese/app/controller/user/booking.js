const User = require("../../model/user");
const Slot = require("../../model/slots");
const Meeting = require("../../model/meetings");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// TODO: Replace with your email utility
const sendEmail = require("../../utils/email");

// Book a demo video call slot (only if created by admin and available)
exports.book = async (req, res) => {
  try {
    const { name, email, phone, questions, slotId, address, description } = req.body;
    let user = await User.findOne({ email });
    let isNewUser = false;
    let randomPassword;
    if (!user) {
      isNewUser = true;
      randomPassword = crypto.randomBytes(8).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        test: questions,
        address,
        description,
        isactive: true,
        role: "user"
      });
      await user.save();
    }
    // Find slot and check if it was created by admin and is available
    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    // Optionally, check if slot was created by admin (if you have a createdBy/admin field)
    // if (!slot.createdBy || slot.createdBy.role !== 'admin') return res.status(403).json({ message: 'Slot not created by admin' });
    if (slot.status !== "available") return res.status(400).json({ message: "Slot not available" });
    // Prevent double-booking
    const existingMeeting = await Meeting.findOne({ slot: slot._id, status: { $in: ["scheduled", "booked"] } });
    if (existingMeeting) return res.status(400).json({ message: "Slot already booked" });
    slot.status = "booked";
    await slot.save();
    // Create meeting
    const meeting = new Meeting({
      user: user._id,
      slot: slot._id,
      status: "scheduled"
    });
    await meeting.save();
    // Generate unique Jitsi meeting link
    const jitsiRoom = `fittese-${meeting._id}`;
    const meetingLink = `https://meet.jit.si/${jitsiRoom}`;
    meeting.videoLink = meetingLink;
    await meeting.save();
    // Send email to user with credentials and meeting link
    let emailHtml = `<h2>Your Booking is Confirmed</h2><p>Dear ${user.name},</p><p>Your meeting is scheduled for slot: ${slot.start} - ${slot.end}.</p><p>Meeting Link: <a href='${meetingLink}'>Join Meeting</a></p>`;
    if (isNewUser) {
      emailHtml += `<p>Your login credentials:<br>Email: ${email}<br>Password: ${randomPassword}</p>`;
    }
    await sendEmail({
      to: email,
      subject: "Your Booking Confirmation",
      html: emailHtml
    });

    // Send email to admin with meeting details and joining link
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fittese.com';
    let adminHtml = `<h2>New Demo Video Call Booking</h2><p>User: ${user.name} (${user.email})</p><p>Slot: ${slot.start} - ${slot.end}</p><p>Meeting Link: <a href='${meetingLink}'>Join Meeting</a></p>`;
    await sendEmail({
      to: adminEmail,
      subject: "New Demo Video Call Booking",
      html: adminHtml
    });
    res.status(201).json({
      message: "Booking successful",
      meetingId: meeting._id,
      meetingLink,
      credentials: isNewUser ? { email, password: randomPassword } : undefined
    });
  } catch (err) {
    res.status(500).json({ message: "Booking error", error: err.message });
  }
}; 