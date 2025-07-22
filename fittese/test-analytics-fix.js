const axios = require('axios');

async function testAnalytics() {
    try {
        console.log('🧪 Testing Analytics API...\n');
        
        // Test admin analytics endpoint
        const response = await axios.get('http://localhost:3200/admin/analytics/api');
        
        if (response.data.success) {
            console.log('✅ Analytics API is working!');
            console.log('\n📊 Sample Data:');
            console.log(`👥 Total Users: ${response.data.totalUsers}`);
            console.log(`👨‍⚕️ Total Employees: ${response.data.totalEmployees}`);
            console.log(`👑 Total Admins: ${response.data.totalAdmins}`);
            console.log(`📅 Total Meetings: ${response.data.totalMeetings}`);
            console.log(`💰 Total Revenue: $${response.data.totalRevenue}`);
            console.log(`🆕 New Users This Month: ${response.data.newUsersThisMonth}`);
            
            console.log('\n📈 Charts Data:');
            console.log('User Growth:', response.data.userGrowth?.labels?.length || 0, 'data points');
            console.log('Meetings by Type:', response.data.meetingsByType?.labels?.length || 0, 'data points');
            console.log('Revenue by Month:', response.data.revenueByMonth?.labels?.length || 0, 'data points');
            console.log('User Role Distribution:', response.data.userRoleDistribution?.labels?.length || 0, 'data points');
            
            console.log('\n🎯 Access your admin panel at: http://localhost:3200/admin');
            console.log('📱 Access your user panel at: http://localhost:3200/user/login');
            
        } else {
            console.log('❌ Analytics API returned error:', response.data.message);
        }
        
    } catch (error) {
        console.log('❌ Error testing analytics:', error.message);
        console.log('\n💡 Make sure the server is running on port 3200');
    }
}

testAnalytics(); 