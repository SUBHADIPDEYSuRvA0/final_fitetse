const User = require('../../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserAuthController {
    /**
     * User signup
     */
    async signup(req, res) {
        try {
            const { name, email, password, phone } = req.body;

            // Validate required fields
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and password are required'
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user
            const userData = {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'user',
                status: 'active'
            };

            if (phone) {
                userData.phone = phone;
            }

            const user = new User(userData);
            await user.save();

            // Create session
            req.session.userId = user._id;
            req.session.userRole = user.role;

            res.json({
                success: true,
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('User signup error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to register user'
            });
        }
    }

    /**
     * User login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Find user
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if user is active
            if (user.status !== 'active') {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated. Please contact support.'
                });
            }

            // Create session
            req.session.userId = user._id;
            req.session.userRole = user.role;

            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('User login error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to login'
            });
        }
    }

    /**
     * User logout
     */
    async logout(req, res) {
        try {
            // Destroy session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destruction error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to logout'
                    });
                }

                res.json({
                    success: true,
                    message: 'Logout successful'
                });
            });

        } catch (error) {
            console.error('User logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to logout'
            });
        }
    }

    /**
     * Check if user is authenticated
     */
    async checkAuth(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            const user = await User.findById(req.session.userId).select('-password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                user: user
            });

        } catch (error) {
            console.error('Auth check error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check authentication'
            });
        }
    }

    /**
     * Render login page
     */
    renderLogin(req, res) {
        res.render('user/login', { 
            title: 'User Login',
            error: req.query.error || null,
            success: req.query.success || null
        });
    }

    /**
     * Render signup page
     */
    renderSignup(req, res) {
        res.render('user/signup', { 
            title: 'User Signup',
            error: req.query.error || null
        });
    }

    /**
     * Render dashboard page
     */
    renderDashboard(req, res) {
        res.render('user/dashboard', { 
            title: 'User Dashboard',
            user: req.user
        });
    }
}

module.exports = new UserAuthController(); 