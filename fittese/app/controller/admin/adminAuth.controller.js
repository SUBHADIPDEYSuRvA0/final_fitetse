const User = require('../../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../../utils/email');

class AdminAuthController {
    
    /**
     * @swagger
     * /admin/login:
     *   post:
     *     summary: Admin login
     *     tags: [Admin Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *               rememberMe:
     *                 type: boolean
     *     responses:
     *       200:
     *         description: Login successful
     *       401:
     *         description: Invalid credentials
     */
    login = async (req, res) => {
        try {
            const { email, password, rememberMe } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Find user by email (always lowercase)
            const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
            if (!user) {
                console.warn('Admin login failed: user not found', email);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if user is active (support both isActive and isactive)
            if (user.isActive === false || user.isactive === false) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is deactivated. Please contact support.'
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.warn('Admin login failed: wrong password', email);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Create session
            req.session.user = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            };
            req.session.lastActivity = Date.now();

            // Set session expiry
            if (rememberMe) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            } else {
                req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
            }

            // Generate JWT token for API access
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: rememberMe ? '30d' : '24h' }
            );

            // Update last login
            await User.findByIdAndUpdate(user._id, {
                lastLogin: new Date(),
                loginCount: (user.loginCount || 0) + 1
            });

            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                },
                token
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    /**
     * @swagger
     * /admin/logout:
     *   post:
     *     summary: Admin logout
     *     tags: [Admin Auth]
     *     responses:
     *       200:
     *         description: Logout successful
     */
    logout = async (req, res) => {
        try {
            // Clear session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Logout error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error during logout'
                    });
                }

                // Clear JWT cookie if exists
                res.clearCookie('admin_token');

                res.json({
                    success: true,
                    message: 'Logout successful'
                });
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    /**
     * @swagger
     * /admin/me:
     *   get:
     *     summary: Get current admin user
     *     tags: [Admin Auth]
     *     responses:
     *       200:
     *         description: Current user info
     *       401:
     *         description: Not authenticated
     */
    getCurrentUser = async (req, res) => {
        try {
            res.json({
                success: true,
                user: req.user
            });
        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    /**
     * @swagger
     * /admin/change-password:
     *   post:
     *     summary: Change admin password
     *     tags: [Admin Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               currentPassword:
     *                 type: string
     *               newPassword:
     *                 type: string
     *               confirmPassword:
     *                 type: string
     *     responses:
     *       200:
     *         description: Password changed successfully
     *       400:
     *         description: Invalid input
     *       401:
     *         description: Current password incorrect
     */
    changePassword = async (req, res) => {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;

            // Validate input
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New passwords do not match'
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters long'
                });
            }

            // Get user with password
            const user = await User.findById(req.user.id).select('+password');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            // Update password
            await User.findByIdAndUpdate(user._id, {
                password: hashedPassword,
                passwordChangedAt: new Date()
            });

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    /**
     * @swagger
     * /admin/forgot-password:
     *   post:
     *     summary: Request password reset
     *     tags: [Admin Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *     responses:
     *       200:
     *         description: Reset email sent
     *       404:
     *         description: User not found
     */
    forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin user with this email not found'
                });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Save reset token to user
            await User.findByIdAndUpdate(user._id, {
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetTokenExpiry
            });

            // Send reset email
            const resetUrl = `${req.protocol}://${req.get('host')}/admin/reset-password/${resetToken}`;
            
            const emailResult = await sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Password Reset Request</h2>
                        <p>Dear ${user.name},</p>
                        <p>You requested a password reset for your admin account.</p>
                        <p>Click the link below to reset your password:</p>
                        <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                            Reset Password
                        </a>
                        <p>This link will expire in 10 minutes.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                    </div>
                `
            });

            if (emailResult.success) {
                res.json({
                    success: true,
                    message: 'Password reset email sent successfully'
                });
            } else {
                // Email failed but token was saved - provide manual reset option
                console.log('Email sending failed, but reset token saved:', resetToken);
                res.json({
                    success: true,
                    message: 'Password reset initiated. If you don\'t receive an email, contact support with this token: ' + resetToken.substring(0, 8) + '...',
                    manualToken: resetToken.substring(0, 8) + '...'
                });
            }

        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error. Please try again or contact support.'
            });
        }
    };

    /**
     * @swagger
     * /admin/reset-password/{token}:
     *   post:
     *     summary: Reset password with token
     *     tags: [Admin Auth]
     *     parameters:
     *       - in: path
     *         name: token
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
     *               newPassword:
     *                 type: string
     *               confirmPassword:
     *                 type: string
     *     responses:
     *       200:
     *         description: Password reset successful
     *       400:
     *         description: Invalid token or input
     */
    resetPassword = async (req, res) => {
        try {
            const { token } = req.params;
            const { newPassword, confirmPassword } = req.body;

            if (!newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Passwords do not match'
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters long'
                });
            }

            // Find user with reset token
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
                role: 'admin'
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token'
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            // Update password and clear reset token
            await User.findByIdAndUpdate(user._id, {
                password: hashedPassword,
                passwordChangedAt: new Date(),
                resetPasswordToken: null,
                resetPasswordExpires: null
            });

            res.json({
                success: true,
                message: 'Password reset successful. You can now login with your new password.'
            });

        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    /**
     * @swagger
     * /admin/verify-token:
     *   post:
     *     summary: Verify JWT token
     *     tags: [Admin Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               token:
     *                 type: string
     *     responses:
     *       200:
     *         description: Token valid
     *       401:
     *         description: Invalid token
     */
    verifyToken = async (req, res) => {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Token is required'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findById(decoded.id).select('-password');

            if (!user || user.role !== 'admin') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            res.json({
                success: true,
                user
            });

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired'
                });
            }

            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    };

    /**
     * @swagger
     * /admin/signup:
     *   post:
     *     summary: Admin signup
     *     tags: [Admin Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *               confirmPassword:
     *                 type: string
     *     responses:
     *       201:
     *         description: Signup successful
     *       400:
     *         description: Invalid input
     */
    signup = async (req, res) => {
        try {
            const { name, email, password, confirmPassword } = req.body;
            if (!name || !email || !password || !confirmPassword) {
                return res.status(400).json({ success: false, message: 'All fields are required' });
            }
            if (password !== confirmPassword) {
                return res.status(400).json({ success: false, message: 'Passwords do not match' });
            }
            if (password.length < 8) {
                return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
            }
            const existing = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            const admin = new User({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                isactive: true
            });
            await admin.save();
            res.status(201).json({ success: true, message: 'Signup successful! You can now login.' });
        } catch (error) {
            console.error('Admin signup error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };
}

module.exports = new AdminAuthController(); 