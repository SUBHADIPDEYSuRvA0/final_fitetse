const axios = require('axios');

async function testAdminAnalytics() {
    try {
        console.log('🧪 Testing Admin Analytics with Authentication...\n');
        
        // First, try to login as admin
        console.log('1. Attempting admin login...');
        const loginResponse = await axios.post('http://localhost:3200/admin/login', {
            email: 'admin@fittese.com',
            password: 'admin123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Login response status:', loginResponse.status);
        
        // Get cookies from login response
        const cookies = loginResponse.headers['set-cookie'];
        console.log('Cookies received:', cookies ? 'Yes' : 'No');
        
        // Now test analytics with cookies
        console.log('\n2. Testing analytics API with authentication...');
        const analyticsResponse = await axios.get('http://localhost:3200/admin/analytics/api', {
            headers: {
                'Cookie': cookies ? cookies.join('; ') : ''
            }
        });
        
        console.log('Analytics response status:', analyticsResponse.status);
        console.log('Analytics data:', JSON.stringify(analyticsResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response headers:', error.response.headers);
            if (error.response.data && typeof error.response.data === 'string') {
                console.log('Response is HTML (redirected to login)');
            } else {
                console.log('Response data:', error.response.data);
            }
        }
    }
}

testAdminAnalytics(); 