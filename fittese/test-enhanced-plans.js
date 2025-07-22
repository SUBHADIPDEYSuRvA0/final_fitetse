const mongoose = require('mongoose');
const Plans = require('./app/model/plans');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fittese', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testEnhancedPlans() {
  try {
    console.log('Testing enhanced plans functionality...');
    
    // Test 1: Create a sample plan with all new features
    console.log('\n1. Creating sample plan with enhanced features...');
    
    const samplePlan = new Plans({
      planname: 'Premium Fitness Plan',
      setprice: {
        price: 99.99,
        originalPrice: 129.99,
        discount: 23,
        currency: 'USD',
        currencyCode: 'USD',
        currencySymbol: '$'
      },
      duration: 30,
      durationUnit: 'days',
      totalsessions: 12,
      description: 'Comprehensive fitness program with personalized coaching and nutrition guidance',
      shortDescription: 'Premium fitness plan with 12 sessions over 30 days',
      features: [
        {
          name: 'Personal Training Sessions',
          description: 'One-on-one training with certified fitness experts',
          icon: 'bi-person-check',
          included: true
        },
        {
          name: 'Nutrition Consultation',
          description: 'Personalized meal plans and dietary advice',
          icon: 'bi-apple',
          included: true
        },
        {
          name: 'Video Recording',
          description: 'Record and review your training sessions',
          icon: 'bi-camera-video',
          included: true
        },
        {
          name: 'Group Classes',
          description: 'Access to unlimited group fitness classes',
          icon: 'bi-people',
          included: false
        },
        {
          name: '24/7 Support',
          description: 'Round-the-clock customer support',
          icon: 'bi-headset',
          included: false
        }
      ],
      protocols: ['Weight Training', 'Cardio', 'Flexibility', 'Nutrition'],
      category: 'premium',
      isactive: true,
      isPopular: true,
      sortOrder: 1,
      maxParticipants: 1,
      includesRecording: true,
      includesSupport: true,
      supportHours: '9 AM - 8 PM'
    });
    
    await samplePlan.save();
    console.log('✓ Sample plan created successfully');
    
    // Test 2: Create a basic plan
    console.log('\n2. Creating basic plan...');
    
    const basicPlan = new Plans({
      planname: 'Basic Starter Plan',
      setprice: {
        price: 49.99,
        currency: 'USD',
        currencyCode: 'USD',
        currencySymbol: '$'
      },
      duration: 14,
      durationUnit: 'days',
      totalsessions: 4,
      description: 'Perfect for beginners starting their fitness journey',
      shortDescription: 'Basic fitness plan for beginners',
      features: [
        {
          name: 'Basic Training Sessions',
          description: 'Fundamental fitness training',
          icon: 'bi-check-circle',
          included: true
        },
        {
          name: 'Basic Nutrition Tips',
          description: 'General nutrition guidance',
          icon: 'bi-apple',
          included: true
        }
      ],
      protocols: ['Basic Training', 'Nutrition Basics'],
      category: 'basic',
      isactive: true,
      isPopular: false,
      sortOrder: 2,
      maxParticipants: 1,
      includesRecording: false,
      includesSupport: false
    });
    
    await basicPlan.save();
    console.log('✓ Basic plan created successfully');
    
    // Test 3: Create an enterprise plan with different currency
    console.log('\n3. Creating enterprise plan with EUR currency...');
    
    const enterprisePlan = new Plans({
      planname: 'Enterprise Wellness Program',
      setprice: {
        price: 299.99,
        originalPrice: 399.99,
        discount: 25,
        currency: 'EUR',
        currencyCode: 'EUR',
        currencySymbol: '€'
      },
      duration: 90,
      durationUnit: 'days',
      totalsessions: 36,
      description: 'Comprehensive corporate wellness program for teams',
      shortDescription: 'Enterprise wellness program for teams',
      features: [
        {
          name: 'Team Training Sessions',
          description: 'Group training for corporate teams',
          icon: 'bi-people',
          included: true
        },
        {
          name: 'Health Assessments',
          description: 'Comprehensive health evaluations',
          icon: 'bi-clipboard-pulse',
          included: true
        },
        {
          name: 'Progress Reports',
          description: 'Detailed progress tracking and reports',
          icon: 'bi-graph-up',
          included: true
        },
        {
          name: 'Dedicated Support',
          description: 'Priority customer support',
          icon: 'bi-headset',
          included: true
        }
      ],
      protocols: ['Team Building', 'Health Assessment', 'Progress Tracking', 'Corporate Wellness'],
      category: 'enterprise',
      isactive: true,
      isPopular: false,
      sortOrder: 3,
      maxParticipants: 10,
      includesRecording: true,
      includesSupport: true,
      supportHours: '24/7'
    });
    
    await enterprisePlan.save();
    console.log('✓ Enterprise plan created successfully');
    
    // Test 4: Fetch and display all plans
    console.log('\n4. Fetching all plans...');
    
    const allPlans = await Plans.find().sort({ sortOrder: 1 });
    console.log(`Total plans: ${allPlans.length}`);
    
    allPlans.forEach((plan, index) => {
      console.log(`\n  ${index + 1}. ${plan.planname}`);
      console.log(`     Category: ${plan.category}`);
      console.log(`     Price: ${plan.formattedPrice}`);
      console.log(`     Duration: ${plan.durationDisplay}`);
      console.log(`     Sessions: ${plan.totalsessions}`);
      console.log(`     Features: ${plan.features.length}`);
      console.log(`     Active: ${plan.isactive ? 'Yes' : 'No'}`);
      console.log(`     Popular: ${plan.isPopular ? 'Yes' : 'No'}`);
      if (plan.setprice.discount > 0) {
        console.log(`     Discount: ${plan.setprice.discount}% (${plan.formattedDiscountedPrice})`);
      }
    });
    
    // Test 5: Test virtual fields
    console.log('\n5. Testing virtual fields...');
    
    const premiumPlan = await Plans.findOne({ planname: 'Premium Fitness Plan' });
    console.log(`  Formatted Price: ${premiumPlan.formattedPrice}`);
    console.log(`  Discounted Price: ${premiumPlan.formattedDiscountedPrice}`);
    console.log(`  Duration Display: ${premiumPlan.durationDisplay}`);
    
    // Test 6: Test filtering
    console.log('\n6. Testing plan filtering...');
    
    const activePlans = await Plans.find({ isactive: true });
    console.log(`  Active plans: ${activePlans.length}`);
    
    const popularPlans = await Plans.find({ isPopular: true });
    console.log(`  Popular plans: ${popularPlans.length}`);
    
    const discountedPlans = await Plans.find({ 'setprice.discount': { $gt: 0 } });
    console.log(`  Discounted plans: ${discountedPlans.length}`);
    
    const premiumPlans = await Plans.find({ category: 'premium' });
    console.log(`  Premium plans: ${premiumPlans.length}`);
    
    mongoose.connection.close();
    console.log('\n✅ Enhanced plans functionality test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    mongoose.connection.close();
  }
}

testEnhancedPlans(); 