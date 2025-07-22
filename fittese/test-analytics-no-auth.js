const analyticsController = require('./app/controller/admin/analytics.controller');

async function testAnalyticsDirectly() {
    try {
        console.log('🧪 Testing Analytics Controller Directly...\n');
        
        // Create mock request and response objects
        const mockReq = {
            user: { _id: 'test-admin-id', role: 'admin' }
        };
        
        const mockRes = {
            json: function(data) {
                console.log('✅ Analytics API Response:');
                console.log('Success:', data.success);
                console.log('\n📊 Sample Data:');
                console.log(`👥 Total Users: ${data.totalUsers}`);
                console.log(`👨‍⚕️ Total Employees: ${data.totalEmployees}`);
                console.log(`👑 Total Admins: ${data.totalAdmins}`);
                console.log(`📅 Total Meetings: ${data.totalMeetings}`);
                console.log(`💰 Total Revenue: $${data.totalRevenue}`);
                console.log(`🆕 New Users This Month: ${data.newUsersThisMonth}`);
                
                console.log('\n📈 Charts Data:');
                console.log('User Growth:', data.userGrowth?.labels?.length || 0, 'data points');
                console.log('Meetings by Type:', data.meetingsByType?.labels?.length || 0, 'data points');
                console.log('Revenue by Month:', data.revenueByMonth?.labels?.length || 0, 'data points');
                console.log('User Role Distribution:', data.userRoleDistribution?.labels?.length || 0, 'data points');
                
                console.log('\n🎯 Your analytics are working with sample data!');
                console.log('📱 Access your admin panel at: http://localhost:3200/admin');
                console.log('👤 Access your user panel at: http://localhost:3200/user/login');
            },
            status: function(code) {
                console.log('Response status:', code);
                return this;
            }
        };
        
        // Call the analytics controller directly
        await analyticsController.getDashboardStats(mockReq, mockRes);
        
    } catch (error) {
        console.log('❌ Error testing analytics:', error.message);
        console.log('Stack trace:', error.stack);
    }
}

testAnalyticsDirectly(); 