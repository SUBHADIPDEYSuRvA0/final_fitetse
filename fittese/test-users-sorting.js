const mongoose = require('mongoose');
const User = require('./app/model/user');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fittese', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testUserSorting() {
  try {
    console.log('Testing user sorting and joining link functionality...');
    
    // Test 1: Get users sorted by creation date (newest first)
    console.log('\n1. Users sorted by creation date (newest first):');
    const usersByDate = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    usersByDate.forEach((user, index) => {
      const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : '—';
      
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - Joined: ${createdAt}`);
    });
    
    // Test 2: Get users sorted by name (A-Z)
    console.log('\n2. Users sorted by name (A-Z):');
    const usersByName = await User.find({ role: 'user' })
      .sort({ name: 1 })
      .limit(5)
      .lean();
    
    usersByName.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`);
    });
    
    // Test 3: Get users sorted by email (A-Z)
    console.log('\n3. Users sorted by email (A-Z):');
    const usersByEmail = await User.find({ role: 'user' })
      .sort({ email: 1 })
      .limit(5)
      .lean();
    
    usersByEmail.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.name})`);
    });
    
    // Test 4: Check for users with democall (joining links)
    console.log('\n4. Users with democall (joining links):');
    const usersWithDemocall = await User.find({ 
      role: 'user',
      democall: { $exists: true, $ne: null }
    }).populate('democall').lean();
    
    usersWithDemocall.forEach((user, index) => {
      const joiningLink = user.email && user.democall ? 
        `/meeting/${encodeURIComponent(user.email)}/${user.democall._id}` : '—';
      
      console.log(`  ${index + 1}. ${user.name} (${user.email})`);
      console.log(`     Joining Link: ${joiningLink}`);
    });
    
    mongoose.connection.close();
    console.log('\n✓ User sorting and joining link test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    mongoose.connection.close();
  }
}

testUserSorting(); 