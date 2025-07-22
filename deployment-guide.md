# Fittese Video Calling System - Single Domain Deployment Guide

## Overview
This guide covers deploying the optimized Fittese video calling system on a Hostinger KVM VPS with all services running under a single domain for maximum performance.

## Key Optimizations Implemented

### 🚀 Performance Enhancements
- **Load Balancer**: Automatically manages server resources and video calling load
- **Adaptive Quality**: Dynamically adjusts video quality based on participant count and network conditions
- **Connection Pooling**: Optimized database and socket connections
- **Compression**: Gzip compression for all responses
- **Caching**: Strategic caching for static assets and API responses

### 🎥 Video Calling Improvements
- **Multi-User Support**: Optimized for up to 12 participants per room
- **Adaptive Bitrate**: Automatically adjusts quality based on network conditions
- **TURN Server Integration**: Better connectivity for users behind NATs/firewalls
- **Screen Sharing**: Optimized screen sharing with quality adaptation
- **Recording**: Automatic recording with configurable settings

### 🌐 Single Domain Architecture
- All services (frontend, backend, video calling, API) run under one domain
- Nginx reverse proxy with load balancing
- WebSocket support for real-time communication
- SSL/TLS termination at proxy level

## Deployment Steps

### 1. Server Preparation (Hostinger VPS)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install SSL certificate tool
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Application Deployment

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/fittese.git
cd fittese

# Install dependencies
sudo npm install

# Install compression middleware
sudo npm install compression

# Set up environment variables
sudo cp .env.example .env
sudo nano .env  # Edit with your configuration
```

### 3. Environment Configuration

Create `.env` file with production settings:

```env
NODE_ENV=production
PORT=3200
DOMAIN_URL=https://yourdomain.com

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fitetse

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
SESSION_SECRET=your-super-secure-session-secret-here

# Email
BREVO_API_KEY=your-brevo-api-key
EMAIL_USER=noreply@yourdomain.com

# Video Calling Optimization
MAX_ROOM_SIZE=12
MAX_CONCURRENT_ROOMS=50
PARTICIPANT_LIMIT=10

# TURN Server (for better connectivity)
TURN_USERNAME=your-turn-username
TURN_PASSWORD=your-turn-password

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING=true
```

### 4. SSL Certificate Setup

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. Nginx Configuration

```bash
# Copy optimized Nginx config
sudo cp nginx.conf /etc/nginx/sites-available/fittese
sudo ln -s /etc/nginx/sites-available/fittese /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 6. PM2 Process Management

```bash
# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

# Monitor processes
pm2 monit
```

### 7. Database Optimization

```javascript
// Add these indexes to your MongoDB for better performance
db.videorooms.createIndex({ "status": 1, "scheduledAt": 1 });
db.videorooms.createIndex({ "roomId": 1 });
db.videorooms.createIndex({ "meetingId": 1 });
db.videorooms.createIndex({ "host": 1, "status": 1 });
db.videorooms.createIndex({ "participants.userId": 1, "status": 1 });
```

## Performance Monitoring

### Real-time Metrics
Access performance metrics at:
- `https://yourdomain.com/api/performance/status`
- `https://yourdomain.com/api/performance/load-balancer`

### PM2 Monitoring
```bash
# View logs
pm2 logs fittese-video-app

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart fittese-video-app
```

## Video Calling Features

### Supported Features
- ✅ Multi-user video calls (up to 12 participants)
- ✅ Adaptive video quality based on network conditions
- ✅ Screen sharing with quality optimization
- ✅ Audio/video mute controls
- ✅ Real-time chat during calls
- ✅ Meeting recording (configurable)
- ✅ Participant management
- ✅ Network quality indicators
- ✅ Automatic reconnection

### Quality Adaptation
The system automatically adjusts video quality based on:
- Number of participants
- Network bandwidth
- Server CPU/memory usage
- Individual connection quality

### Network Requirements
- **Minimum**: 1 Mbps upload/download per participant
- **Recommended**: 3 Mbps upload/download per participant
- **Optimal**: 5+ Mbps for HD video calls

## Troubleshooting

### Common Issues

1. **Video not working**
   - Check camera/microphone permissions
   - Verify HTTPS is enabled (required for WebRTC)
   - Check firewall settings for WebRTC ports

2. **High server load**
   - Monitor `/api/performance/status`
   - Reduce max participants per room
   - Enable quality adaptation

3. **Connection issues**
   - Verify TURN server configuration
   - Check network connectivity
   - Review Nginx proxy settings

### Log Locations
- Application: `/var/log/fittese/`
- Nginx: `/var/log/nginx/fittese_*.log`
- PM2: `pm2 logs`

## Security Considerations

### Implemented Security Features
- HTTPS enforcement
- CORS protection
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure session management
- Content Security Policy headers

### Additional Recommendations
- Regular security updates
- Database connection encryption
- API key rotation
- Access log monitoring
- Intrusion detection system

## Scaling Considerations

### Horizontal Scaling
- Use multiple VPS instances with load balancer
- Implement Redis for session sharing
- Consider CDN for static assets

### Vertical Scaling
- Increase VPS resources as needed
- Monitor CPU/memory usage
- Optimize database queries

## Maintenance

### Regular Tasks
- Monitor server resources
- Update dependencies monthly
- Backup database regularly
- Review access logs
- Update SSL certificates (automated)

### Performance Optimization
- Monitor video call quality metrics
- Adjust participant limits based on usage
- Optimize database queries
- Review and update caching strategies

## Support

For technical support or issues:
1. Check application logs
2. Review performance metrics
3. Verify network connectivity
4. Contact system administrator

---

**Note**: Replace `yourdomain.com` with your actual domain name throughout all configuration files.
