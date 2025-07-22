const jwt = require('jsonwebtoken');
const User = require('../model/user');
const bcrypt = require('bcrypt');

/**
 * Admin Authentication Middleware
 * Supports both session-based and JWT-based authentication
 */
module.exports = function(req, res, next) {
  // Check for JWT token first (for API requests)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJWT(req, res, next);
  }

  // Check for session-based authentication (for web requests)
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    // Verify session is still valid
    if (req.session.lastActivity && (Date.now() - req.session.lastActivity) < 24 * 60 * 60 * 1000) {
      req.session.lastActivity = Date.now();
      req.user = req.session.user;
      return next();
    } else {
      // Session expired
      delete req.session.user;
      delete req.session.lastActivity;
    }
  }

  // Not authenticated
  if (req.xhr || req.path.startsWith('/api/')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required',
      redirect: '/admin/login'
    });
  }

  res.redirect('/admin/login');
};

/**
 * JWT Authentication for API requests
 */
async function authenticateJWT(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient privileges' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired',
        redirect: '/admin/login'
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
}

/**
 * Optional Admin Authentication (for public admin pages)
 */
module.exports.optional = function(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    req.user = req.session.user;
  }
  next();
};

/**
 * Admin Login Handler
 */
module.exports.login = async function(req, res) {
  try {
    const { email, password, rememberMe } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
 * Admin Logout Handler
 */
module.exports.logout = function(req, res) {
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
};

/**
 * Check if user is authenticated
 */
module.exports.isAuthenticated = function(req) {
  return req.session && req.session.user && req.session.user.role === 'admin';
};

/**
 * Get current user
 */
module.exports.getCurrentUser = function(req) {
  return req.session ? req.session.user : null;
}; 