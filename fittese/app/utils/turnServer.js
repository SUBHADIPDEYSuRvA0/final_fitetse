const crypto = require('crypto');

/**
 * TURN Server Configuration for Production
 * This provides better connectivity for users behind NATs and firewalls
 */
class TurnServerConfig {
  constructor() {
    this.turnServers = [
      // Free TURN servers (use for development/testing)
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      // Metered TURN (recommended for production)
      {
        urls: 'turn:a.relay.metered.ca:80',
        username: process.env.TURN_USERNAME || 'metered_username',
        credential: process.env.TURN_PASSWORD || 'metered_password'
      },
      {
        urls: 'turn:a.relay.metered.ca:443',
        username: process.env.TURN_USERNAME || 'metered_username', 
        credential: process.env.TURN_PASSWORD || 'metered_password'
      }
    ];

    this.stunServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun.relay.metered.ca:80' }
    ];
  }

  /**
   * Get ICE servers configuration
   */
  getIceServers() {
    return [
      ...this.stunServers,
      ...this.turnServers
    ];
  }

  /**
   * Generate temporary TURN credentials (for custom TURN server)
   */
  generateTurnCredentials(username, secret, ttl = 3600) {
    const timestamp = Math.floor(Date.now() / 1000) + ttl;
    const turnUsername = `${timestamp}:${username}`;
    const turnPassword = crypto
      .createHmac('sha1', secret)
      .update(turnUsername)
      .digest('base64');

    return {
      username: turnUsername,
      credential: turnPassword,
      ttl: ttl
    };
  }

  /**
   * Get optimized RTCConfiguration for production
   */
  getRTCConfiguration() {
    return {
      iceServers: this.getIceServers(),
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceCandidatePoolSize: 10
    };
  }
}

module.exports = TurnServerConfig;
