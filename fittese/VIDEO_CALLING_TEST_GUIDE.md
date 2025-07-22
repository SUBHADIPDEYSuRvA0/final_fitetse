# 🎥 Video Calling System Test Guide

## 📋 Prerequisites

### 1. Start MongoDB
```bash
# Start MongoDB service
mongod

# Or if using MongoDB as a service
net start MongoDB
```

### 2. Start the Application
```bash
# Install dependencies (if not already done)
npm install

# Start the server
npm start
# or
node index.js
```

## 🔧 Automated Testing

### 1. Run Video Calling Test Script
```bash
node test-video-calling-system.js
```

**Expected Output:**
```
🎥 Testing Comprehensive Video Calling System...

1. Environment Variables Check:
  ✓ JWT_SECRET: Set
  ✓ FRONTEND_URL: Set

2. Database Connection:
  ✓ MongoDB connected successfully

3. Existing Video Rooms:
  ✓ Found X existing video rooms

4. User Authentication:
  ✓ Test user created/found
  ✓ Authentication successful

5. Video Room Creation:
  ✓ Room creation successful
  ✓ Room ID: abc123
  ✓ Meeting ID: xyz789
  ✓ Join URL: /video/join/xyz789
  ✓ Host URL: /video/host/xyz789

6. Socket.IO Connection:
  ✓ Socket server running
  ✓ Client connection successful
  ✓ Room join event working

7. WebRTC Functionality:
  ✓ Media devices accessible
  ✓ Peer connection created
  ✓ ICE candidates generated

8. Recording System:
  ✓ Recording service initialized
  ✓ Auto-recording configured
  ✓ Recording triggers working

✅ Video calling system is working properly!
```

## 🧪 Manual Testing Steps

### 1. Basic Video Call Test

#### Step 1: Create a Video Room
1. **Login as Admin/User**
   - Go to `http://localhost:3000/admin/login` (admin)
   - Or `http://localhost:3000/user/login` (user)

2. **Navigate to Video Calling**
   - Admin: Go to video calling section
   - User: Access video calling feature

3. **Create New Room**
   - Click "Create Video Room"
   - Fill in details:
     - Title: "Test Video Call"
     - Description: "Testing video calling functionality"
     - Scheduled Time: Future date/time
     - Duration: 60 minutes
     - Max Participants: 10

4. **Verify Room Creation**
   - Check if room appears in list
   - Verify room ID and meeting ID are generated
   - Confirm join URL is created

#### Step 2: Join Video Call
1. **Open Join URL**
   - Copy the join URL from room creation
   - Open in browser: `http://localhost:3000/video/join/[MEETING_ID]`

2. **Check Permissions**
   - Allow camera and microphone access
   - Verify permissions are granted

3. **Verify Connection**
   - Check if local video appears
   - Verify audio levels are detected
   - Confirm connection status

#### Step 3: Test Multiple Participants
1. **Open Second Browser/Incognito**
   - Use different browser or incognito mode
   - Join the same meeting URL

2. **Check Peer Connection**
   - Verify both participants can see each other
   - Test audio communication
   - Check video quality

3. **Test Controls**
   - Mute/unmute audio
   - Enable/disable video
   - Test screen sharing
   - Verify chat functionality

### 2. Advanced Features Test

#### Recording Test
1. **Start Recording**
   - Join with 2+ participants
   - Check if recording starts automatically
   - Verify recording indicator appears

2. **Stop Recording**
   - Leave meeting or stop manually
   - Check if recording stops
   - Verify file is saved in uploads folder

#### Screen Sharing Test
1. **Enable Screen Share**
   - Click screen share button
   - Select screen or application
   - Verify screen is shared

2. **Test Controls**
   - Pause/resume screen share
   - Switch between screens
   - Stop screen sharing

#### Chat Test
1. **Send Messages**
   - Type message in chat
   - Send to all participants
   - Verify message appears

2. **Test Features**
   - Send emojis
   - Test file sharing (if available)
   - Verify message history

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. "Camera/Microphone Not Working"
**Symptoms:**
- No video preview
- No audio input detected
- Permission denied errors

**Solutions:**
```javascript
// Check browser console for errors
// Verify permissions in browser settings
// Test with different browser
// Check if devices are connected
```

#### 2. "Cannot Join Meeting"
**Symptoms:**
- Meeting not found error
- Invalid meeting ID
- Access denied

**Solutions:**
```bash
# Check if meeting exists in database
# Verify meeting ID is correct
# Check user permissions
# Ensure server is running
```

#### 3. "No Video/Audio from Other Participants"
**Symptoms:**
- Can see local video but not remote
- No audio from other users
- Connection issues

**Solutions:**
```javascript
// Check WebRTC connection
// Verify ICE servers
// Test with different network
// Check firewall settings
```

#### 4. "Recording Not Working"
**Symptoms:**
- Recording doesn't start
- No recording files created
- Recording errors

**Solutions:**
```bash
# Check FFmpeg installation
# Verify uploads folder permissions
# Check disk space
# Review recording service logs
```

### Browser Compatibility Test

#### Supported Browsers:
- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

#### Test Matrix:
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Video Call | ✅ | ✅ | ✅ | ✅ |
| Screen Share | ✅ | ✅ | ⚠️ | ✅ |
| Recording | ✅ | ✅ | ❌ | ✅ |
| Chat | ✅ | ✅ | ✅ | ✅ |

## 📊 Performance Testing

### 1. Load Testing
```bash
# Test with multiple participants
# Monitor CPU and memory usage
# Check network bandwidth
# Test with different video qualities
```

### 2. Quality Testing
```javascript
// Test video quality settings
// Check audio quality
// Monitor latency
// Test with poor network conditions
```

### 3. Stability Testing
```bash
# Long duration calls
# Multiple room joins/leaves
# Network interruption handling
# Browser refresh/reload
```

## 🛠️ Debug Tools

### 1. Browser Developer Tools
```javascript
// Open DevTools (F12)
// Check Console for errors
// Monitor Network tab
// Check Application tab for permissions
```

### 2. Server Logs
```bash
# Check server console output
# Monitor Socket.IO events
# Review error logs
# Check database queries
```

### 3. WebRTC Debugging
```javascript
// Check RTCPeerConnection state
// Monitor ICE candidates
// Verify media streams
// Check connection quality
```

## 📱 Mobile Testing

### 1. Mobile Browser Test
- Test on mobile Chrome
- Test on mobile Safari
- Check responsive design
- Test touch controls

### 2. Mobile App Test (if available)
- Test native app functionality
- Check push notifications
- Verify background handling
- Test device rotation

## 🔐 Security Testing

### 1. Authentication Test
```javascript
// Test unauthorized access
// Verify user permissions
// Check meeting access control
// Test admin privileges
```

### 2. Data Security Test
```javascript
// Check data encryption
// Verify secure connections
// Test input validation
// Check for XSS vulnerabilities
```

## 📈 Monitoring and Analytics

### 1. Real-time Monitoring
```javascript
// Monitor active calls
// Track participant count
// Check recording status
// Monitor system resources
```

### 2. Analytics Dashboard
```javascript
// View call statistics
// Check usage patterns
// Monitor performance metrics
// Track error rates
```

## 🎯 Success Criteria

### ✅ Video Calling is Working If:
1. **Room Creation**: Can create video rooms successfully
2. **Join Meeting**: Can join meetings with valid URLs
3. **Media Access**: Camera and microphone work properly
4. **Peer Connection**: Multiple participants can see/hear each other
5. **Controls**: Mute, video toggle, screen share work
6. **Recording**: Automatic recording starts with 2+ participants
7. **Chat**: Text chat functions properly
8. **Stability**: Calls remain stable for extended periods
9. **Quality**: Video and audio quality is acceptable
10. **Error Handling**: Graceful handling of connection issues

### ❌ Video Calling is NOT Working If:
1. **Cannot create rooms**
2. **Cannot join meetings**
3. **No camera/microphone access**
4. **Participants cannot see/hear each other**
5. **Controls don't work**
6. **Recording fails**
7. **Chat doesn't function**
8. **Frequent disconnections**
9. **Poor video/audio quality**
10. **Unhandled errors**

## 🚀 Quick Test Checklist

### Before Testing:
- [ ] MongoDB is running
- [ ] Server is started
- [ ] Dependencies are installed
- [ ] Browser permissions are granted
- [ ] Camera and microphone are connected

### During Testing:
- [ ] Create video room
- [ ] Join meeting
- [ ] Test camera/microphone
- [ ] Add second participant
- [ ] Test audio/video communication
- [ ] Test controls (mute, video, screen share)
- [ ] Test chat functionality
- [ ] Test recording (if 2+ participants)
- [ ] Test leaving/rejoining
- [ ] Check error handling

### After Testing:
- [ ] Verify recording files are created
- [ ] Check database for meeting data
- [ ] Review server logs
- [ ] Test on different browsers
- [ ] Test on mobile devices

## 📞 Support

If video calling is not working:

1. **Check this guide** for troubleshooting steps
2. **Review server logs** for error messages
3. **Test with different browsers** and devices
4. **Verify network connectivity** and firewall settings
5. **Check MongoDB connection** and database health
6. **Review browser console** for JavaScript errors
7. **Test with minimal setup** (basic video call only)

---

**🎥 Your video calling system should now be fully functional and testable!** 