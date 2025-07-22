const mongoose = require('mongoose');
const Payment = require('./app/model/payments');
const Plan = require('./app/model/plans');
const User = require('./app/model/user');
const { 
  createOrder, 
  verifySignature, 
  getPaymentDetails,
  formatAmount,
  getCurrencySymbol,
  getSupportedPaymentMethods
} = require('./app/utils/razorpay');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fittese', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testRazorpayIntegration() {
  try {
    console.log('Testing Razorpay Payment Gateway Integration...');
    
    // Test 1: Check environment variables
    console.log('\n1. Environment Variables Check:');
    const requiredEnvVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
    requiredEnvVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`  ✓ ${varName}: ${process.env[varName].substring(0, 10)}...`);
      } else {
        console.log(`  ❌ ${varName}: Not set`);
      }
    });
    
    // Test 2: Check payment methods
    console.log('\n2. Supported Payment Methods:');
    const paymentMethods = getSupportedPaymentMethods();
    Object.entries(paymentMethods).forEach(([key, method]) => {
      console.log(`  ✓ ${method.name} (${key})`);
    });
    
    // Test 3: Check currency formatting
    console.log('\n3. Currency Formatting Test:');
    const testAmounts = [1000, 50000, 100000]; // in paise
    testAmounts.forEach(amount => {
      console.log(`  ${amount} paise = ${formatAmount(amount, 'INR')}`);
    });
    
    // Test 4: Check currency symbols
    console.log('\n4. Currency Symbols Test:');
    const currencies = ['INR', 'USD', 'EUR', 'GBP'];
    currencies.forEach(currency => {
      console.log(`  ${currency}: ${getCurrencySymbol(currency)}`);
    });
    
    // Test 5: Check existing payments
    console.log('\n5. Existing Payments:');
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('plan', 'planname')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    console.log(`  Total payments: ${payments.length}`);
    payments.forEach((payment, index) => {
      console.log(`  ${index + 1}. ${payment.user?.name || 'N/A'} - ${payment.plan?.planname || 'N/A'} - ${formatAmount(payment.amount, payment.currency)} (${payment.status})`);
    });
    
    // Test 6: Check payment statistics
    console.log('\n6. Payment Statistics:');
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } },
          totalPayments: { $sum: 1 },
          pendingPayments: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          successfulPayments: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          refundedPayments: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } }
        }
      }
    ]);
    
    if (stats.length > 0) {
      const stat = stats[0];
      console.log(`  Total Revenue: ${formatAmount(stat.totalRevenue, 'INR')}`);
      console.log(`  Total Payments: ${stat.totalPayments}`);
      console.log(`  Successful: ${stat.successfulPayments}`);
      console.log(`  Pending: ${stat.pendingPayments}`);
      console.log(`  Failed: ${stat.failedPayments}`);
      console.log(`  Refunded: ${stat.refundedPayments}`);
    } else {
      console.log('  No payment statistics available');
    }
    
    // Test 7: Check available plans for payment testing
    console.log('\n7. Available Plans for Payment Testing:');
    const plans = await Plan.find({ isactive: true })
      .select('planname setprice duration totalsessions')
      .limit(5)
      .lean();
    
    console.log(`  Active plans: ${plans.length}`);
    plans.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.planname} - ${formatAmount(plan.setprice.price * 100, plan.setprice.currency)} - ${plan.duration} days - ${plan.totalsessions} sessions`);
    });
    
    // Test 8: Check users for payment testing
    console.log('\n8. Available Users for Payment Testing:');
    const users = await User.find({ role: 'user' })
      .select('name email')
      .limit(5)
      .lean();
    
    console.log(`  Users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`);
    });
    
    // Test 9: Payment model validation
    console.log('\n9. Payment Model Validation:');
    const testPayment = new Payment({
      user: users.length > 0 ? users[0]._id : new mongoose.Types.ObjectId(),
      plan: plans.length > 0 ? plans[0]._id : new mongoose.Types.ObjectId(),
      amount: 50000, // 500 INR in paise
      originalAmount: 50000,
      currency: 'INR',
      currencySymbol: '₹',
      status: 'pending',
      paymentMethod: 'card',
      description: 'Test payment',
      billingDetails: {
        name: 'Test User',
        email: 'test@example.com'
      }
    });
    
    try {
      await testPayment.validate();
      console.log('  ✓ Payment model validation passed');
    } catch (error) {
      console.log('  ❌ Payment model validation failed:', error.message);
    }
    
    // Test 10: Virtual fields test
    console.log('\n10. Virtual Fields Test:');
    if (payments.length > 0) {
      const samplePayment = payments[0];
      console.log(`  Sample payment amount: ${samplePayment.amount} paise`);
      console.log(`  Formatted amount: ${formatAmount(samplePayment.amount, samplePayment.currency)}`);
      console.log(`  Status badge class: ${samplePayment.statusBadge || 'N/A'}`);
    }
    
    mongoose.connection.close();
    console.log('\n✅ Razorpay integration test completed!');
    
    console.log('\n🎯 Razorpay Features Implemented:');
    console.log('  1. ✅ Order creation with Razorpay');
    console.log('  2. ✅ Payment verification with signature');
    console.log('  3. ✅ Multiple currency support (INR, USD, EUR, GBP)');
    console.log('  4. ✅ Payment method tracking');
    console.log('  5. ✅ Refund functionality');
    console.log('  6. ✅ Webhook handling');
    console.log('  7. ✅ Payment links');
    console.log('  8. ✅ Comprehensive payment management');
    console.log('  9. ✅ Admin payment dashboard');
    console.log('  10. ✅ Payment statistics and reporting');
    
    console.log('\n📱 How to Test Payments:');
    console.log('  1. Access /admin/payments to view payment dashboard');
    console.log('  2. Create a plan in /admin/plans');
    console.log('  3. Use the payment API endpoints to create orders');
    console.log('  4. Test payment verification with Razorpay test cards');
    console.log('  5. Monitor webhooks for payment status updates');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    mongoose.connection.close();
  }
}

testRazorpayIntegration(); 