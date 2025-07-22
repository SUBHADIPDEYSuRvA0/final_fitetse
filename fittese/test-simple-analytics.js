const axios = require('axios');

async function testAnalytics() {
    try {
        console.log('🧪 Testing Analytics API...\n');
        
        // Test admin analytics endpoint
        const response = await axios.get('http://localhost:3200/admin/analytics/api');
        
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error testing analytics:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

testAnalytics(); 