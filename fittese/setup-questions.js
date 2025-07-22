const mongoose = require('mongoose');
const Questions = require('./app/model/questions');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fittese', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function setupQuestions() {
  try {
    console.log('Setting up obesity screening questions...');
    
    // Sample obesity screening questions
    const sampleQuestions = [
      {
        question: "What is your current weight?",
        options: ["Under 150 lbs", "150-200 lbs", "200-250 lbs", "Over 250 lbs"]
      },
      {
        question: "What is your height?",
        options: ["Under 5'5\"", "5'5\" - 5'10\"", "5'10\" - 6'2\"", "Over 6'2\""]
      },
      {
        question: "How often do you exercise?",
        options: ["Never", "1-2 times per week", "3-4 times per week", "5+ times per week"]
      },
      {
        question: "What is your typical daily calorie intake?",
        options: ["Under 1500", "1500-2000", "2000-2500", "Over 2500"]
      },
      {
        question: "Do you have any family history of obesity?",
        options: ["Yes", "No", "Not sure"]
      },
      {
        question: "How many hours do you sleep per night?",
        options: ["Less than 6 hours", "6-7 hours", "7-8 hours", "More than 8 hours"]
      },
      {
        question: "What is your stress level?",
        options: ["Low", "Moderate", "High", "Very High"]
      },
      {
        question: "Do you have any medical conditions?",
        options: ["None", "Diabetes", "Heart disease", "Other"]
      }
    ];

    // Check if questions already exist
    const existingQuestions = await Questions.findOne();
    
    if (existingQuestions) {
      console.log('Questions already exist, updating...');
      existingQuestions.obecityquestions = sampleQuestions;
      await existingQuestions.save();
      console.log('✓ Questions updated successfully');
    } else {
      console.log('Creating new questions...');
      const newQuestions = new Questions({
        obecityquestions: sampleQuestions
      });
      await newQuestions.save();
      console.log('✓ Questions created successfully');
    }

    console.log('Sample questions:');
    sampleQuestions.forEach((q, index) => {
      console.log(`${index + 1}. ${q.question}`);
    });

    mongoose.connection.close();
    console.log('✓ Setup completed!');
  } catch (error) {
    console.error('❌ Error setting up questions:', error);
    mongoose.connection.close();
  }
}

setupQuestions(); 