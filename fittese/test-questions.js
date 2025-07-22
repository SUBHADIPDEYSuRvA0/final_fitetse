const mongoose = require('mongoose');
const Questions = require('./app/model/questions');
const User = require('./app/model/user');

// Connect to MongoDB (update with your connection string)
mongoose.connect('mongodb://localhost:27017/fittese', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testQuestionsAndAnswers() {
  try {
    console.log('Testing questions and answers functionality...');
    
    // Test 1: Check if questions exist
    const questions = await Questions.findOne();
    if (questions && questions.obecityquestions) {
      console.log('✓ Questions found:', questions.obecityquestions.length);
      questions.obecityquestions.forEach((q, index) => {
        console.log(`  ${index + 1}. ${q.question}`);
      });
    } else {
      console.log('⚠ No questions found in database');
    }
    
    // Test 2: Check if users with answers exist
    const users = await User.find({ role: 'user' });
    console.log('✓ Users found:', users.length);
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}: ${user.name} (${user.email})`);
      if (user.test) {
        const testAnswers = user.test instanceof Map ? Object.fromEntries(user.test) : user.test;
        console.log(`  Answers:`, Object.keys(testAnswers).length);
        Object.entries(testAnswers).forEach(([questionId, answer]) => {
          console.log(`    Q${questionId}: ${answer}`);
        });
      } else {
        console.log('  No answers');
      }
    });
    
    mongoose.connection.close();
    console.log('✓ Test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    mongoose.connection.close();
  }
}

testQuestionsAndAnswers(); 