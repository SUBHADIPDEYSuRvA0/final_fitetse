const jwt = require('jsonwebtoken');
const User = require('../model/user');

module.exports = function(requiredRole = 'admin') {
  return async function(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || user.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
      }
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}; 