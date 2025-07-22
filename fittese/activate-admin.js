const mongoose = require('mongoose');
const User = require('./app/model/user');

mongoose.connect('mongodb://localhost:27017/fittese', { useNewUrlParser: true, useUnifiedTopology: true });

async function activateAdmin(email) {
  const user = await User.findOneAndUpdate(
    { email, role: 'admin' },
    { isActive: true, isactive: true },
    { new: true }
  );
  if (user) {
    console.log('Admin reactivated:', user.email);
  } else {
    console.log('Admin not found');
  }
  mongoose.connection.close();
}

// TODO: Replace with your actual admin email
activateAdmin('YOUR_ADMIN_EMAIL_HERE'); 