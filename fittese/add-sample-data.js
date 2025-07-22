const mongoose = require('mongoose');
const User = require('./app/model/user');
const Meeting = require('./app/model/meetings');
const Payment = require('./app/model/payments');
const Plans = require('./app/model/plans');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fittese', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function addSampleData() {
    try {
        console.log('Adding sample data...');

        // Add sample users
        const sampleUsers = [
            { name: 'John Smith', email: 'john@example.com', role: 'user', createdAt: new Date('2024-01-15') },
            { name: 'Sarah Johnson', email: 'sarah@example.com', role: 'user', createdAt: new Date('2024-02-20') },
            { name: 'Mike Brown', email: 'mike@example.com', role: 'user', createdAt: new Date('2024-03-10') },
            { name: 'Emily Davis', email: 'emily@example.com', role: 'user', createdAt: new Date('2024-04-05') },
            { name: 'David Wilson', email: 'david@example.com', role: 'user', createdAt: new Date('2024-05-12') },
            { name: 'Lisa Anderson', email: 'lisa@example.com', role: 'user', createdAt: new Date('2024-06-01') },
            { name: 'Dr. Robert Chen', email: 'robert@example.com', role: 'employee', createdAt: new Date('2024-01-01') },
            { name: 'Dr. Maria Garcia', email: 'maria@example.com', role: 'employee', createdAt: new Date('2024-02-01') },
            { name: 'Dr. James Wilson', email: 'james@example.com', role: 'employee', createdAt: new Date('2024-03-01') }
        ];

        for (const userData of sampleUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                const user = new User(userData);
                await user.save();
                console.log(`Added user: ${userData.name}`);
            }
        }

        // Add sample plans
        const samplePlans = [
            { name: 'Basic Plan', price: 5000, description: 'Basic consultation plan' },
            { name: 'Premium Plan', price: 10000, description: 'Premium consultation plan' },
            { name: 'VIP Plan', price: 15000, description: 'VIP consultation plan' }
        ];

        for (const planData of samplePlans) {
            const existingPlan = await Plans.findOne({ name: planData.name });
            if (!existingPlan) {
                const plan = new Plans(planData);
                await plan.save();
                console.log(`Added plan: ${planData.name}`);
            }
        }

        // Get users and plans for creating meetings and payments
        const users = await User.find({ role: 'user' });
        const employees = await User.find({ role: 'employee' });
        const plans = await Plans.find();

        // Add sample meetings
        const meetingTypes = ['consultation', 'follow-up', 'initial', 'group'];
        const meetingStatuses = ['completed', 'scheduled', 'cancelled'];

        for (let i = 0; i < 20; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
            const randomType = meetingTypes[Math.floor(Math.random() * meetingTypes.length)];
            const randomStatus = meetingStatuses[Math.floor(Math.random() * meetingStatuses.length)];
            
            const meetingDate = new Date();
            meetingDate.setDate(meetingDate.getDate() - Math.floor(Math.random() * 30));

            const meetingData = {
                title: `${randomType.charAt(0).toUpperCase() + randomType.slice(1)} Meeting`,
                user: randomUser._id,
                employee: randomEmployee._id,
                meetingType: randomType,
                status: randomStatus,
                createdAt: meetingDate,
                startTime: new Date(meetingDate.getTime() + 9 * 60 * 60 * 1000), // 9 AM
                endTime: new Date(meetingDate.getTime() + 10 * 60 * 60 * 1000), // 10 AM
                description: `Sample ${randomType} meeting`
            };

            const meeting = new Meeting(meetingData);
            await meeting.save();
            console.log(`Added meeting: ${meetingData.title}`);
        }

        // Add sample payments
        for (let i = 0; i < 15; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomPlan = plans[Math.floor(Math.random() * plans.length)];
            
            const paymentDate = new Date();
            paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 60));

            const paymentData = {
                user: randomUser._id,
                plan: randomPlan._id,
                amount: randomPlan.price,
                status: 'paid',
                paymentMethod: 'online',
                paymentId: `PAY_${Date.now()}_${i}`,
                createdAt: paymentDate
            };

            const payment = new Payment(paymentData);
            await payment.save();
            console.log(`Added payment: ${paymentData.paymentId}`);
        }

        console.log('Sample data added successfully!');
        console.log(`- Users: ${await User.countDocuments()}`);
        console.log(`- Meetings: ${await Meeting.countDocuments()}`);
        console.log(`- Payments: ${await Payment.countDocuments()}`);
        console.log(`- Plans: ${await Plans.countDocuments()}`);

    } catch (error) {
        console.error('Error adding sample data:', error);
    } finally {
        mongoose.connection.close();
    }
}

addSampleData(); 