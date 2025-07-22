const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./app/model/user');

mongoose.connect('mongodb://localhost:27017/fittese', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

async function createAdmin() {
    try {
        // Check if demo admin already exists
        const existingAdmin = await User.findOne({ email: 'fitetse@gmail.com', role: 'admin' });
        if (existingAdmin) {
            console.log('Demo admin already exists:', existingAdmin.email);
            console.log('To activate existing admin, run: node activate-admin.js');
            return;
        }

        // Create new demo admin
        const hashedPassword = await bcrypt.hash('fitetse123', 12);
        
        const admin = new User({
            name: 'Demo Admin',
            email: 'fitetse@gmail.com',
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            isactive: true,
            phone: '+1234567890',
            address: 'Demo Address',
            description: 'Demo System Administrator'
        });

        await admin.save();
        
        console.log('✅ Demo admin account created successfully!');
        console.log('📧 Email: fitetse@gmail.com');
        console.log('🔑 Password: fitetse123');
        console.log('🔗 Login URL: http://localhost:3000/admin/login');
        
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');
        
    } catch (error) {
        console.error('❌ Error creating demo admin:', error.message);
    } finally {
        mongoose.connection.close();
    }
}

createAdmin(); 