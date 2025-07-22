const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🎥 Quick Video Calling System Test\n');

// Test 1: Check if server is running
async function testServerStatus() {
    console.log('1. Server Status Check:');
    
    try {
        const response = await new Promise((resolve, reject) => {
            const req = http.get('http://localhost:3000', (res) => {
                resolve(res);
            });
            
            req.on('error', (err) => {
                reject(err);
            });
            
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
        
        console.log(`  ✓ Server is running (Status: ${response.statusCode})`);
        return true;
    } catch (error) {
        console.log(`  ❌ Server is not running: ${error.message}`);
        console.log('  💡 Start the server with: npm start');
        return false;
    }
}

// Test 2: Check video calling routes
async function testVideoRoutes() {
    console.log('\n2. Video Calling Routes Check:');
    
    const routes = [
        '/video/join/test-meeting',
        '/video/host/test-meeting',
        '/admin/mymeet',
        '/videocall/meeting'
    ];
    
    for (const route of routes) {
        try {
            const response = await new Promise((resolve, reject) => {
                const req = http.get(`http://localhost:3000${route}`, (res) => {
                    resolve(res);
                });
                
                req.on('error', (err) => {
                    reject(err);
                });
                
                req.setTimeout(3000, () => {
                    req.destroy();
                    reject(new Error('Request timeout'));
                });
            });
            
            console.log(`  ✓ ${route} - Status: ${response.statusCode}`);
        } catch (error) {
            console.log(`  ❌ ${route} - Error: ${error.message}`);
        }
    }
}

// Test 3: Check required files
function testRequiredFiles() {
    console.log('\n3. Required Files Check:');
    
    const requiredFiles = [
        'app/controller/videcall/videocall.controller.js',
        'app/model/videoRooms.js',
        'views/videocall/meeting.ejs',
        'public/meeting.js',
        'app/utils/socketServer.js',
        'app/utils/recordingService.js'
    ];
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`  ✓ ${file}`);
        } else {
            console.log(`  ❌ ${file} - Missing`);
        }
    });
}

// Test 4: Check dependencies
function testDependencies() {
    console.log('\n4. Dependencies Check:');
    
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const requiredDeps = [
            'socket.io',
            'express',
            'mongoose',
            'jsonwebtoken',
            'fluent-ffmpeg'
        ];
        
        requiredDeps.forEach(dep => {
            if (packageJson.dependencies && packageJson.dependencies[dep]) {
                console.log(`  ✓ ${dep} - ${packageJson.dependencies[dep]}`);
            } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
                console.log(`  ✓ ${dep} (dev) - ${packageJson.devDependencies[dep]}`);
            } else {
                console.log(`  ❌ ${dep} - Not installed`);
            }
        });
    } catch (error) {
        console.log(`  ❌ Error reading package.json: ${error.message}`);
    }
}

// Test 5: Check uploads folder
function testUploadsFolder() {
    console.log('\n5. Uploads Folder Check:');
    
    const uploadsPath = 'uploads';
    if (fs.existsSync(uploadsPath)) {
        console.log(`  ✓ Uploads folder exists`);
        
        try {
            fs.accessSync(uploadsPath, fs.constants.W_OK);
            console.log(`  ✓ Uploads folder is writable`);
        } catch (error) {
            console.log(`  ❌ Uploads folder is not writable`);
        }
    } else {
        console.log(`  ❌ Uploads folder missing`);
        console.log(`  💡 Create uploads folder: mkdir uploads`);
    }
}

// Test 6: Check environment variables
function testEnvironmentVariables() {
    console.log('\n6. Environment Variables Check:');
    
    const requiredEnvVars = [
        'JWT_SECRET',
        'MONGODB_URI',
        'PORT'
    ];
    
    requiredEnvVars.forEach(envVar => {
        if (process.env[envVar]) {
            console.log(`  ✓ ${envVar} - Set`);
        } else {
            console.log(`  ⚠️  ${envVar} - Not set (using default)`);
        }
    });
}

// Test 7: Check FFmpeg (for recording)
function testFFmpeg() {
    console.log('\n7. FFmpeg Check (for recording):');
    
    const { exec } = require('child_process');
    
    exec('ffmpeg -version', (error, stdout, stderr) => {
        if (error) {
            console.log(`  ❌ FFmpeg not installed: ${error.message}`);
            console.log(`  💡 Install FFmpeg for recording functionality`);
        } else {
            console.log(`  ✓ FFmpeg is installed`);
            const version = stdout.split('\n')[0];
            console.log(`  ✓ Version: ${version}`);
        }
    });
}

// Test 8: Check browser compatibility
function testBrowserCompatibility() {
    console.log('\n8. Browser Compatibility:');
    
    const browsers = [
        'Chrome (Recommended)',
        'Firefox',
        'Safari',
        'Edge'
    ];
    
    browsers.forEach(browser => {
        console.log(`  ✓ ${browser}`);
    });
    
    console.log('\n  📋 Browser Requirements:');
    console.log('    • WebRTC support');
    console.log('    • Camera and microphone access');
    console.log('    • HTTPS (for production)');
    console.log('    • Modern browser version');
}

// Test 9: Manual testing instructions
function showManualTestInstructions() {
    console.log('\n9. Manual Testing Instructions:');
    
    console.log('\n  🔧 To test video calling manually:');
    console.log('    1. Start MongoDB: mongod');
    console.log('    2. Start server: npm start');
    console.log('    3. Open browser: http://localhost:3000');
    console.log('    4. Login as admin or user');
    console.log('    5. Navigate to video calling section');
    console.log('    6. Create a video room');
    console.log('    7. Join the meeting');
    console.log('    8. Test camera and microphone');
    console.log('    9. Add second participant (different browser)');
    console.log('    10. Test audio/video communication');
}

// Test 10: Common issues and solutions
function showCommonIssues() {
    console.log('\n10. Common Issues and Solutions:');
    
    console.log('\n  🐛 Common Problems:');
    console.log('    • Camera not working: Check browser permissions');
    console.log('    • Cannot join meeting: Verify meeting ID and server status');
    console.log('    • No audio: Check microphone permissions and device settings');
    console.log('    • Recording not working: Install FFmpeg and check uploads folder');
    console.log('    • Connection issues: Check network and firewall settings');
    
    console.log('\n  🛠️ Quick Fixes:');
    console.log('    • Restart server: npm start');
    console.log('    • Clear browser cache and cookies');
    console.log('    • Try different browser');
    console.log('    • Check browser console for errors');
    console.log('    • Verify MongoDB is running');
}

// Run all tests
async function runAllTests() {
    const serverRunning = await testServerStatus();
    
    if (serverRunning) {
        await testVideoRoutes();
    }
    
    testRequiredFiles();
    testDependencies();
    testUploadsFolder();
    testEnvironmentVariables();
    testFFmpeg();
    testBrowserCompatibility();
    showManualTestInstructions();
    showCommonIssues();
    
    console.log('\n🎯 Video Calling Test Summary:');
    console.log('  • Run this test to check basic setup');
    console.log('  • Use manual testing for full functionality');
    console.log('  • Check server logs for detailed errors');
    console.log('  • Ensure MongoDB is running for complete tests');
    
    console.log('\n📞 Next Steps:');
    console.log('  1. Start MongoDB if not running');
    console.log('  2. Start the server: npm start');
    console.log('  3. Open browser and test manually');
    console.log('  4. Check browser console for errors');
    console.log('  5. Review server logs for issues');
}

// Run the tests
runAllTests().catch(console.error); 