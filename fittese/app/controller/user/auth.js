const User = require("../../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../../utils/email");

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, questions } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });
    const randomPassword = password || crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      test: questions // expects { questionId: answer, ... }
    });
    await user.save();
    // Optionally: send email with credentials here
    res.status(201).json({ message: "User registered", email, password: randomPassword });
  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: "user" });
    if (!user) {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      } else {
        return res.render('user/login', { error: 'Invalid credentials', success: null });
      }
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      } else {
        return res.render('user/login', { error: 'Invalid credentials', success: null });
      }
    }
    // Set session for EJS-based login
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    req.session.lastActivity = Date.now();
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      // AJAX login (API)
      return res.json({ success: true, token: 'session', user: { id: user._id, name: user.name, email: user.email } });
    } else {
      // Form login (EJS)
      return res.redirect('/user/panel');
    }
  } catch (err) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      res.status(500).json({ success: false, message: "Login error", error: err.message });
    } else {
      res.render('user/login', { error: 'Login error', success: null });
    }
  }
};

// Password reset: send reset link
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email, role: 'user' });
    if (!user) {
      return res.render('user/forgot', { error: 'No user found with that email.', success: null });
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const resetUrl = `${process.env.DOMAIN_NAME || 'http://localhost:3200'}/user/reset/${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Click <a href='${resetUrl}'>here</a> to reset your password. This link is valid for 1 hour.</p>`
    });
    res.render('user/forgot', { error: null, success: 'Password reset link sent to your email.' });
  } catch (err) {
    res.render('user/forgot', { error: 'Error sending reset email.', success: null });
  }
};

// Render password reset form
exports.renderResetForm = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) {
    return res.render('user/forgot', { error: 'Password reset token is invalid or has expired.', success: null });
  }
  res.render('user/reset', { token, error: null, success: null });
};

// Handle password reset
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  if (!password || password !== confirmPassword) {
    return res.render('user/reset', { token, error: 'Passwords do not match.', success: null });
  }
  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) {
    return res.render('user/forgot', { error: 'Password reset token is invalid or has expired.', success: null });
  }
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.render('user/login', { error: null, success: 'Password has been reset. You can now log in.' });
}; 