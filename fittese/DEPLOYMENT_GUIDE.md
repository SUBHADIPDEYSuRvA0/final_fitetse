# 🎥 Video Calling System - Deployment Guide

## 📋 Overview

This comprehensive video calling system includes:
- **WebRTC peer-to-peer video calling** for up to 10 participants
- **Real-time chat and screen sharing**
- **Global connectivity** with STUN/TURN servers
- **Secure authentication** and encrypted streams
- **Responsive design** for mobile and desktop
- **Admin dashboard** for meeting management
- **Payment integration** with Razorpay

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd fittese

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 2. Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb://localhost:27017/fittese

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_CALLBACK_URL=https://yourdomain.com/api/webhook/razorpay

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# TURN Server (Optional for global connectivity)
TURN_SERVER_URL=your-turn-server-url
TURN_USERNAME=your-turn-username
TURN_CREDENTIAL=your-turn-credential
```

### 3. Database Setup

```bash
# Start MongoDB
mongod

# Create database and collections
mongo
use fittese
db.createUser({
  user: "fittese_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

## 🌐 VPS Deployment (4 vCPU)

### Recommended VPS Specifications

- **CPU**: 4 vCPUs (2.4+ GHz)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 100GB SSD
- **Bandwidth**: 1TB/month minimum
- **OS**: Ubuntu 20.04 LTS

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 2. Application Deployment

```bash
# Clone application
git clone <repository-url> /var/www/fittese
cd /var/www/fittese

# Install dependencies
npm install --production

# Set environment variables
nano .env

# Start with PM2
pm2 start index.js --name "fittese-video"
pm2 startup
pm2 save
```

### 3. Nginx Configuration

```nginx
# /etc/nginx/sites-available/fittese
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /public/ {
        alias /var/www/fittese/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/fittese /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 TURN Server Setup (Global Connectivity)

### Option 1: Use Public TURN Servers

```javascript
// In app/utils/socketServer.js
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add your TURN server here
    {
      urls: 'turn:your-turn-server.com:3478',
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL
    }
  ]
};
```

### Option 2: Deploy Your Own TURN Server

```bash
# Install coturn
sudo apt install coturn -y

# Configure coturn
sudo nano /etc/turnserver.conf

# Add configuration:
listening-port=3478
tls-listening-port=5349
listening-ip=YOUR_SERVER_IP
external-ip=YOUR_SERVER_IP
realm=yourdomain.com
server-name=yourdomain.com
user-quota=12
total-quota=1200
authentication-method=long-term
user=username:password
cert=/etc/ssl/certs/yourdomain.com.crt
pkey=/etc/ssl/private/yourdomain.com.key
```

## 📊 Monitoring & Scaling

### 1. Performance Monitoring

```bash
# Install monitoring tools
npm install -g clinic

# Monitor application
clinic doctor -- node index.js

# Monitor memory usage
clinic heap -- node index.js

# Monitor CPU usage
clinic flame -- node index.js
```

### 2. Load Balancing

```bash
# Install multiple instances
pm2 start index.js --name "fittese-1" --instances 1
pm2 start index.js --name "fittese-2" --instances 1
pm2 start index.js --name "fittese-3" --instances 1
pm2 start index.js --name "fittese-4" --instances 1
```

### 3. Database Scaling

```bash
# Enable MongoDB replication
# Edit /etc/mongod.conf
replication:
  replSetName: "fittese-replica"

# Initialize replica set
mongo
rs.initiate({
  _id: "fittese-replica",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
})
```

## 🔒 Security Best Practices

### 1. Firewall Configuration

```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3478  # TURN server
sudo ufw enable
```

### 2. Rate Limiting

```javascript
// Add rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Input Validation

```javascript
// Use Joi for validation
const Joi = require('joi');

const roomSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  scheduledAt: Joi.date().greater('now').required(),
  maxParticipants: Joi.number().min(1).max(50).default(10)
});
```

## 📈 Scaling Guidelines

### 1. Horizontal Scaling

- **Load Balancer**: Use Nginx or HAProxy
- **Multiple Instances**: Deploy across multiple servers
- **Database Sharding**: For high-traffic applications
- **CDN**: For static assets and global delivery

### 2. Vertical Scaling

- **CPU**: Upgrade to 8+ vCPUs for high concurrency
- **RAM**: Increase to 32GB+ for large meetings
- **Storage**: Use SSD with high IOPS
- **Bandwidth**: Upgrade to 10TB+ for video traffic

### 3. Performance Optimization

```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Enable caching
app.use(express.static('public', {
  maxAge: '1y',
  etag: true
}));

// Database indexing
db.videorooms.createIndex({ "roomId": 1 });
db.videorooms.createIndex({ "meetingId": 1 });
db.videorooms.createIndex({ "host": 1, "status": 1 });
```

## 🚨 Troubleshooting

### Common Issues

1. **WebRTC Connection Failed**
   - Check TURN server configuration
   - Verify firewall settings
   - Test with different browsers

2. **High CPU Usage**
   - Monitor with `htop`
   - Check for memory leaks
   - Optimize video quality settings

3. **Database Connection Issues**
   - Check MongoDB status: `sudo systemctl status mongod`
   - Verify connection string
   - Check disk space

4. **Socket.IO Connection Issues**
   - Verify CORS settings
   - Check proxy configuration
   - Test WebSocket connectivity

### Logs and Debugging

```bash
# Application logs
pm2 logs fittese-video

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# System resources
htop
iotop
nethogs
```

## 📞 Support

For technical support and scaling assistance:
- **Documentation**: Check the README.md
- **Issues**: Create GitHub issues
- **Performance**: Use monitoring tools
- **Security**: Regular security audits

## 🎯 Success Metrics

Monitor these key metrics:
- **Concurrent Users**: Track active video sessions
- **Connection Quality**: Monitor WebRTC stats
- **Server Performance**: CPU, RAM, bandwidth usage
- **User Experience**: Connection success rate
- **Security**: Failed authentication attempts

---

**🎉 Your video calling system is now ready for global deployment!** 