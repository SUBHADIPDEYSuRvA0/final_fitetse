const jwt = require('jsonwebtoken');

function generateJitsiJwt({ userId, userName, userEmail, room }) {
  const payload = {
    aud: 'my_app', // your app ID
    iss: 'my_app', // your app ID
    sub: 'meet.jit.si', // your Jitsi domain
    room, // room name or '*'
    exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 hours expiry
    context: {
      user: {
        id: userId,
        name: userName,
        email: userEmail
      }
    }
  };
  return jwt.sign(payload, process.env.JITSI_APP_SECRET);
}

module.exports = generateJitsiJwt; 