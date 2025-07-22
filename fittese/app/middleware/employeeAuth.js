module.exports = function(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'employee') {
    return next();
  }
  res.redirect('/employee'); // Redirect to login if not authenticated
}; 