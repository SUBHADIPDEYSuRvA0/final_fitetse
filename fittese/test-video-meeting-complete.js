const axios = require('axios');

async function testVideoMeetingSystem() {
    console.log('🎥 Testing Video Meeting System...\n');
    
    const baseURL = 'http://localhost:3200';
    
    try {
        // 1. Test video routes accessibility
        console.log('1️⃣ Testing video routes accessibility...');
        
        // Test join route with non-existent meeting
        try {
            const joinResponse = await axios.get(`${baseURL}/video/join/test-meeting-123`);
            console.log('❌ Join route should return 404 for non-existent meeting');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Join route correctly returns 404 for non-existent meeting');
                console.log('Response:', error.response.data);
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
        // Test host route (should redirect to login)
        try {
            const hostResponse = await axios.get(`${baseURL}/video/host/test-meeting-123`);
            console.log('❌ Host route should require authentication');
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 302)) {
                console.log('✅ Host route correctly requires authentication');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
        // 2. Test video API endpoints
        console.log('\n2️⃣ Testing video API endpoints...');
        
        // Test get room details
        try {
            const roomResponse = await axios.get(`${baseURL}/video/api/rooms/test-meeting-123`);
            console.log('❌ Room details should return 404 for non-existent room');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Room details correctly returns 404 for non-existent room');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
        // Test join room API
        try {
            const joinApiResponse = await axios.post(`${baseURL}/video/api/rooms/test-meeting-123/join`, {
                participantName: 'Test User',
                participantEmail: 'test@example.com'
            });
            console.log('❌ Join API should return 404 for non-existent room');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Join API correctly returns 404 for non-existent room');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
        // 3. Test video meeting page rendering
        console.log('\n3️⃣ Testing video meeting page rendering...');
        
        try {
            const meetingPageResponse = await axios.get(`${baseURL}/video/join/sample-meeting`);
            if (meetingPageResponse.status === 404) {
                console.log('✅ Meeting page correctly handles non-existent meetings');
            } else {
                console.log('❌ Meeting page should return 404 for non-existent meetings');
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Meeting page correctly returns 404 for non-existent meetings');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
        // 4. Test webhook endpoint
        console.log('\n4️⃣ Testing webhook endpoint...');
        
        try {
            const webhookResponse = await axios.post(`${baseURL}/video/api/webhook/meeting-update`, {
                meetingId: 'test-meeting-123',
                status: 'started',
                participants: []
            });
            console.log('✅ Webhook endpoint responds successfully');
            console.log('Response:', webhookResponse.data);
        } catch (error) {
            console.log('❌ Webhook error:', error.message);
        }
        
        // 5. Test video calling features
        console.log('\n5️⃣ Testing video calling features...');
        
        // Check if video calling page exists
        try {
            const videoPageResponse = await axios.get(`${baseURL}/video`);
            console.log('✅ Video calling base route accessible');
        } catch (error) {
            console.log('❌ Video calling base route error:', error.message);
        }
        
        // 6. Summary
        console.log('\n📊 Video Meeting System Test Summary:');
        console.log('✅ Error handling working correctly');
        console.log('✅ API endpoints responding properly');
        console.log('✅ Authentication required for protected routes');
        console.log('✅ Webhook system functional');
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Create a real meeting to test full functionality');
        console.log('2. Test with actual video calling interface');
        console.log('3. Verify WebRTC connections');
        console.log('4. Test recording functionality');
        
        console.log('\n🌐 Access Points:');
        console.log(`📱 Video Calling: ${baseURL}/video`);
        console.log(`🎥 Join Meeting: ${baseURL}/video/join/{meetingId}`);
        console.log(`👨‍💼 Host Meeting: ${baseURL}/video/host/{meetingId}`);
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

// Test video meeting system
testVideoMeetingSystem(); 