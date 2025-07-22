const jwt = require('jsonwebtoken');
const User = require('../model/user');

/**
 * User Authentication Middleware
 * Supports both session-based and JWT-based authentication
 */
module.exports = function(req, res, next) {
  // Check for JWT token first (for API requests)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJWT(req, res, next);
  }

  // Check for session-based authentication (for web requests)
  if (req.session && req.session.user && req.session.user.role === 'user') {
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
      redirect: '/user/login'
    });
  }

  res.redirect('/user/login');
};

/**
 * JWT Authentication for API requests
 */
async function authenticateJWT(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.role !== 'user') {
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
        redirect: '/user/login'
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
}

/**
 * Optional User Authentication (for public user pages)
 */
module.exports.optional = function(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'user') {
    req.user = req.session.user;
  }
  next();
};

/**
 * Check if user is authenticated
 */
module.exports.isAuthenticated = function(req) {
  return req.session && req.session.user && req.session.user.role === 'user';
};

/**
 * Get current user
 */
module.exports.getCurrentUser = function(req) {
  return req.session ? req.session.user : null;
}; 