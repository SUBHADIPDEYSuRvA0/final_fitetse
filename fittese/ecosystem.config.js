/**
 * PM2 Ecosystem Configuration for Hostinger VPS Production Deployment
 * Optimized for video calling performance and single domain setup
 */
module.exports = {
  apps: [
    {
      name: 'fittese-video-app',
      script: 'index.js',
      cwd: '/var/www/fittese', // Adjust path for your Hostinger setup
      
      // Performance optimizations
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      
      // Memory and CPU limits
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Environment configuration
      env: {
        NODE_ENV: 'development',
        PORT: 3200,
        DOMAIN_URL: 'http://localhost:3200'
      },
      
      env_production: {
        NODE_ENV: 'production',
        PORT: 3200,
        DOMAIN_URL: 'https://yourdomain.com', // Replace with your actual domain
        
        // MongoDB connection
        MONGO_URI: 'mongodb+srv://username:password@cluster.mongodb.net/fitetse',
        
        // Security
        JWT_SECRET: 'your-super-secure-jwt-secret-key-here',
        SESSION_SECRET: 'your-super-secure-session-secret-here',
        
        // Email configuration
        BREVO_API_KEY: 'your-brevo-api-key',
        EMAIL_USER: 'noreply@yourdomain.com',
        
        // TURN server credentials (for better video calling)
        TURN_USERNAME: 'your-turn-username',
        TURN_PASSWORD: 'your-turn-password',
        
        // Performance limits
        MAX_ROOM_SIZE: 12,
        MAX_CONCURRENT_ROOMS: 50,
        PARTICIPANT_LIMIT: 10,
        
        // Razorpay (if using payments)
        RAZORPAY_KEY_ID: 'your-razorpay-key-id',
        RAZORPAY_KEY_SECRET: 'your-razorpay-secret'
      },
      
      // Logging
      log_file: '/var/log/fittese/combined.log',
      out_file: '/var/log/fittese/out.log',
      error_file: '/var/log/fittese/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto-restart configuration
      watch: false, // Disable in production for performance
      ignore_watch: ['node_modules', 'uploads', 'logs'],
      
      // Advanced options
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Health monitoring
      min_uptime: '10s',
      max_restarts: 10,
      
      // Performance monitoring
      pmx: true,
      
      // Graceful shutdown
      kill_timeout: 5000
    }
  ],
  
  // Deployment configuration for Hostinger VPS
  deploy: {
    production: {
      user: 'root', // or your VPS user
      host: 'your-server-ip', // Your Hostinger VPS IP
      ref: 'origin/main',
      repo: 'https://github.com/yourusername/your-repo.git',
      path: '/var/www/fittese',
      
      // Pre-deploy commands
      'pre-deploy-local': '',
      
      // Post-deploy commands
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      
      // Pre-setup commands
      'pre-setup': 'sudo apt update && sudo apt install -y nodejs npm nginx',
      
      // Environment variables
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
