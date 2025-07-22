const mongoose = require('mongoose');
const Meeting = require('./app/model/meetings');
const User = require('./app/model/user');
const Slot = require('./app/model/slots');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fittese', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testGroupMeetings() {
  try {
    console.log('Testing group meeting functionality...');
    
    // Test 1: Check existing meetings
    console.log('\n1. Existing meetings:');
    const meetings = await Meeting.find()
      .populate('user', 'name email')
      .populate('employee', 'name email')
      .populate('participants', 'name email')
      .populate('slot', 'start end')
      .lean();
    
    console.log(`Total meetings: ${meetings.length}`);
    meetings.forEach((meeting, index) => {
      console.log(`  ${index + 1}. ${meeting.title || 'Untitled'} (${meeting.status})`);
      console.log(`     Group: ${meeting.group ? 'Yes' : 'No'}`);
      console.log(`     Participants: ${meeting.participants ? meeting.participants.length : 0}`);
      if (meeting.slot) {
        console.log(`     Date: ${new Date(meeting.slot.start).toLocaleDateString()}`);
      }
    });
    
    // Test 2: Check available slots
    console.log('\n2. Available slots:');
    const availableSlots = await Slot.find({ status: 'available' })
      .sort({ start: 1 })
      .limit(5)
      .lean();
    
    console.log(`Available slots: ${availableSlots.length}`);
    availableSlots.forEach((slot, index) => {
      console.log(`  ${index + 1}. ${new Date(slot.start).toLocaleDateString()} - ${new Date(slot.start).toLocaleTimeString()}`);
    });
    
    // Test 3: Check users for participants
    console.log('\n3. Users available for participants:');
    const users = await User.find({ role: 'user' })
      .select('name email')
      .limit(5)
      .lean();
    
    console.log(`Users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`);
    });
    
    // Test 4: Check employees
    console.log('\n4. Employees available:');
    const employees = await User.find({ role: 'employee' })
      .populate('employeetype')
      .limit(5)
      .lean();
    
    console.log(`Employees: ${employees.length}`);
    employees.forEach((emp, index) => {
      console.log(`  ${index + 1}. ${emp.name} (${emp.email}) - ${emp.employeetype ? emp.employeetype.type : 'No Type'}`);
    });
    
    // Test 5: Create a sample group meeting (if slots and users exist)
    if (availableSlots.length > 0 && users.length > 0) {
      console.log('\n5. Creating sample group meeting...');
      
      const sampleMeeting = new Meeting({
        title: 'Sample Group Meeting',
        slot: availableSlots[0]._id,
        group: true,
        participants: users.slice(0, 2).map(u => u._id), // First 2 users as participants
        status: 'scheduled'
      });
      
      await sampleMeeting.save();
      console.log('✓ Sample group meeting created successfully');
      
      // Update slot status
      await Slot.findByIdAndUpdate(availableSlots[0]._id, { status: 'booked' });
      console.log('✓ Slot status updated to booked');
    }
    
    mongoose.connection.close();
    console.log('\n✓ Group meeting test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    mongoose.connection.close();
  }
}

testGroupMeetings(); 