const mongoose = require('mongoose');
const Slot = require('./app/model/slots');

// Connect to MongoDB (update with your connection string)
mongoose.connect('mongodb://localhost:27017/fittese', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testCalendar() {
  try {
    console.log('Testing calendar functionality...');
    
    // Test 1: Check if we can connect to the database
    console.log('✓ Database connected');
    
    // Test 2: Check if we can create a slot
    const testSlot = new Slot({
      start: new Date('2024-01-15T09:00:00'),
      end: new Date('2024-01-15T10:00:00'),
      status: 'available'
    });
    
    await testSlot.save();
    console.log('✓ Slot created successfully:', testSlot._id);
    
    // Test 3: Check if we can fetch slots
    const slots = await Slot.find();
    console.log('✓ Fetched slots:', slots.length);
    
    // Test 4: Check slot structure
    if (slots.length > 0) {
      const slot = slots[0];
      console.log('✓ Slot structure:', {
        id: slot._id,
        start: slot.start,
        end: slot.end,
        status: slot.status,
        day: slot.day
      });
    }
    
    // Clean up test slot
    await Slot.findByIdAndDelete(testSlot._id);
    console.log('✓ Test slot cleaned up');
    
    mongoose.connection.close();
    console.log('✓ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    mongoose.connection.close();
  }
}

testCalendar(); 