/**
 * Single Domain Manager
 * Manages all services under one domain with proper routing and load distribution
 */
const express = require('express');
const path = require('path');

class SingleDomainManager {
  constructor(app) {
    this.app = app;
    this.setupRoutes();
    this.setupStaticFiles();
    this.setupAPIRoutes();
    this.setupVideoCallRoutes();
  }

  /**
   * Setup main application routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV || 'development'
      });
    });

    // Main application routes
    this.app.get('/', (req, res) => {
      res.render('index', { 
        title: 'Fittese - Fitness Consultation Platform',
        user: req.user || null 
      });
    });

    // Dashboard route
    this.app.get('/dashboard', this.requireAuth, (req, res) => {
      res.render('dashboard/index', { 
        user: req.user,
        title: 'Dashboard'
      });
    });

    // Profile management
    this.app.get('/profile', this.requireAuth, (req, res) => {
      res.render('profile/index', { 
        user: req.user,
        title: 'Profile'
      });
    });
  }

  /**
   * Setup static file serving with caching
   */
  setupStaticFiles() {
    // Serve static files with proper caching
    this.app.use('/static', express.static(path.join(__dirname, '../../public'), {
      maxAge: '1d', // Cache for 1 day
      etag: true,
      lastModified: true
    }));

    // Serve uploaded files
    this.app.use('/uploads', express.static(path.join(__dirname, '../../uploads'), {
      maxAge: '7d', // Cache uploads for 7 days
      etag: true
    }));

    // Serve video call assets
    this.app.use('/video-assets', express.static(path.join(__dirname, '../../views/videocall/assets'), {
      maxAge: '1h',
      etag: true
    }));
  }

  /**
   * Setup API routes with versioning
   */
  setupAPIRoutes() {
    // API v1 routes
    this.app.use('/api/v1/auth', require('../router/api/auth'));
    this.app.use('/api/v1/users', require('../router/api/users'));
    this.app.use('/api/v1/meetings', require('../router/api/meetings'));
    this.app.use('/api/v1/analytics', require('../router/api/analytics'));

    // Legacy API routes (for backward compatibility)
    this.app.use('/api', require('../router/api/legacy'));

    // API documentation
    this.app.get('/api-docs', (req, res) => {
      res.render('api-docs', { 
        title: 'API Documentation',
        version: 'v1.0.0'
      });
    });
  }

  /**
   * Setup video calling routes with load balancing
   */
  setupVideoCallRoutes() {
    const LoadBalancer = require('./loadBalancer');
    const loadBalancer = new LoadBalancer();

    // Video call main routes
    this.app.use('/video', require('../router/video/index'));

    // Load balancer middleware for video calls
    this.app.use('/video/*', (req, res, next) => {
      const roomId = req.params.meetingId || req.body.roomId;
      
      if (roomId && !loadBalancer.canJoinRoom(roomId)) {
        return res.status(503).json({
          error: 'Server overloaded',
          message: 'Room is at capacity or server is under high load',
          retryAfter: 30
        });
      }
      
      next();
    });

    // Real-time load balancing endpoint
    this.app.get('/api/v1/load-status', (req, res) => {
      const status = loadBalancer.getLoadStatus();
      res.json(status);
    });

    // Room optimization endpoint
    this.app.get('/api/v1/rooms/:roomId/optimize', (req, res) => {
      const { roomId } = req.params;
      const recommendations = loadBalancer.getRoomOptimizationRecommendations(roomId);
      res.json({ recommendations });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ 
          error: 'API endpoint not found',
          path: req.path,
          method: req.method
        });
      } else {
        res.status(404).render('errors/404', { 
          title: 'Page Not Found',
          url: req.url
        });
      }
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('Application Error:', error);
      
      if (req.path.startsWith('/api/')) {
        res.status(500).json({ 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
      } else {
        res.status(500).render('errors/500', { 
          title: 'Server Error',
          error: process.env.NODE_ENV === 'development' ? error : null
        });
      }
    });
  }

  /**
   * Authentication middleware
   */
  requireAuth(req, res, next) {
    if (req.user || req.session?.userId) {
      next();
    } else {
      if (req.path.startsWith('/api/')) {
        res.status(401).json({ error: 'Authentication required' });
      } else {
        res.redirect('/login');
      }
    }
  }

  /**
   * Setup URL redirects for SEO and user experience
   */
  setupRedirects() {
    // Redirect old URLs to new structure
    this.app.get('/meeting/:id', (req, res) => {
      res.redirect(301, `/video/join/${req.params.id}`);
    });

    // Redirect HTTP to HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      this.app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
          res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
          next();
        }
      });
    }
  }

  /**
   * Setup caching strategies
   */
  setupCaching() {
    // Cache control for different types of content
    this.app.use('/api/v1/static-data', (req, res, next) => {
      res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
      next();
    });

    this.app.use('/api/v1/user-data', (req, res, next) => {
      res.set('Cache-Control', 'private, no-cache');
      next();
    });

    // ETag support for API responses
    this.app.set('etag', 'strong');
  }

  /**
   * Setup compression
   */
  setupCompression() {
    const compression = require('compression');
    
    this.app.use(compression({
      filter: (req, res) => {
        // Don't compress responses with this request header
        if (req.headers['x-no-compression']) {
          return false;
        }
        
        // Compress all other responses
        return compression.filter(req, res);
      },
      level: 6, // Compression level (1-9)
      threshold: 1024 // Only compress responses > 1KB
    }));
  }

  /**
   * Setup security headers
   */
  setupSecurity() {
    // Security headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // CSP for video calling
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "media-src 'self' blob: mediastream:; " +
        "connect-src 'self' wss: ws: https:; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' https://cdn.jsdelivr.net;"
      );
      
      next();
    });
  }

  /**
   * Initialize all configurations
   */
  initialize() {
    this.setupSecurity();
    this.setupCompression();
    this.setupCaching();
    this.setupRedirects();
    this.setupErrorHandling();
    
    console.log('✅ Single Domain Manager initialized successfully');
  }
}

module.exports = SingleDomainManager;
