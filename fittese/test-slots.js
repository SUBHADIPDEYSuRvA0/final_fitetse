const mongoose = require('mongoose');
const Slot = require('./app/model/slots');

// Connect to MongoDB (update with your connection string)
mongoose.connect('mongodb://localhost:27017/fittese', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testSlotCreation() {
  try {
    console.log('Testing slot creation...');
    
    // Clear existing test slots
    await Slot.deleteMany({});
    console.log('Cleared existing slots');
    
    // Create a test slot
    const testSlot = new Slot({
      start: new Date('2024-01-15T09:00:00'),
      end: new Date('2024-01-15T10:00:00'),
      status: 'available'
    });
    
    await testSlot.save();
    console.log('Created test slot:', testSlot);
    
    // Fetch all slots
    const slots = await Slot.find();
    console.log('Total slots in database:', slots.length);
    console.log('Slots:', slots);
    
    mongoose.connection.close();
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    mongoose.connection.close();
  }
}

testSlotCreation(); 