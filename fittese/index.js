const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const compression = require("compression");
const connectDB = require("./app/config/DB");
require("dotenv").config();
require('./app/helpers/cronjob');

// Import optimization utilities
const SingleDomainManager = require('./app/utils/singleDomainManager');
const LoadBalancer = require('./app/utils/loadBalancer');
const PerformanceOptimizer = require('./app/utils/performanceOptimizer');

const generateJitsiJwt = require('./app/utils/jitsiJwt');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();

// Initialize optimizers
const loadBalancer = new LoadBalancer();
const performanceOptimizer = new PerformanceOptimizer();

// Connect to MongoDB
connectDB();

// Performance optimizations
app.use(compression()); // Enable gzip compression
app.set('trust proxy', 1); // Trust first proxy for Hostinger deployment

// Optimized session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false, // Don't save empty sessions
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    sameSite: 'strict'
  }
}));

// Flash middleware (must come after session)
app.use(flash());

// Optimized CORS configuration for single domain
app.use(cors({
  origin: process.env.DOMAIN_URL || "http://localhost:3200",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Request parsing with limits for video calling
app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // Increased for video metadata
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set up EJS
app.set("view engine", "ejs");
app.set("views", "views");

// Public folders
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// Initialize Single Domain Manager
const singleDomainManager = new SingleDomainManager(app);
singleDomainManager.initialize();

// Load balancing middleware for video calls
app.use('/video/*', (req, res, next) => {
  if (!loadBalancer.canCreateRoom()) {
    return res.status(503).json({
      error: 'Server overloaded',
      message: 'Server is under high load. Please try again later.',
      retryAfter: 60
    });
  }
  next();
});

// Performance monitoring middleware
app.use('/api/*', (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 5000) { // Log slow requests
      console.warn(`Slow API request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
});

// Routes with optimization
app.use("/", require("./app/router/admin/index"));
app.use("/", require("./app/router/emplyee/index"));
app.use("/", require("./app/router/user/index"));
app.use("/video", require("./app/router/video/index"));

// Performance monitoring endpoints
app.get('/api/performance/status', (req, res) => {
  res.json(performanceOptimizer.getPerformanceStatus());
});

app.get('/api/performance/load-balancer', (req, res) => {
  res.json(loadBalancer.getLoadStatus());
});


// Legacy meeting route (for backward compatibility)
app.get('/meeting/:email/:roomId', async (req, res) => {
  const { roomId, email } = req.params;
  const userName = email;
  const jwtToken = generateJitsiJwt({
    userId: email,
    userName,
    userEmail: email,
    room: roomId
  });
  res.render('videocall/meeting', {
    roomId,
    userEmail: email,
    userName,
    roomUrl: `${process.env.DOMAIN_NAME || 'http://localhost:5100'}/meeting/${email}/${roomId}`,
    jwtToken
  });
});

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- OPTIMIZED SOCKET.IO SETUP START ---
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

// Configure server for better performance
server.keepAliveTimeout = 65000; // Longer than load balancer timeout
server.headersTimeout = 66000; // Slightly longer than keepAliveTimeout
server.maxConnections = 1000; // Limit concurrent connections

// Initialize optimized Socket.IO server for video calling
const SocketServer = require('./app/utils/socketServer');
const socketServer = new SocketServer(server);

// Integrate performance monitoring with socket server
if (typeof socketServer.setLoadBalancer === 'function') {
  socketServer.setLoadBalancer(loadBalancer);
}
if (typeof socketServer.setPerformanceOptimizer === 'function') {
  socketServer.setPerformanceOptimizer(performanceOptimizer);
}

// Legacy Socket.IO setup (for backward compatibility)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5100",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory mapping of socketId to userName for each room
const rooms = {};

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, userName }, callback) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = userName;
    // Notify others
    socket.to(roomId).emit("user-joined", { socketId: socket.id, userName });

    // Send list of users (except self) to the new joiner
    if (typeof callback === "function") {
      const usersInRoom = Object.entries(rooms[roomId])
        .filter(([id]) => id !== socket.id)
        .map(([socketId, userName]) => ({ socketId, userName }));
      callback(usersInRoom);
    }

    socket.on("disconnect", () => {
      if (rooms[roomId]) {
        delete rooms[roomId][socket.id];
        socket.to(roomId).emit("user-left", { socketId: socket.id });
        if (Object.keys(rooms[roomId]).length === 0) delete rooms[roomId];
      }
    });
  });
});

// Cleanup expired meetings every hour
setInterval(async () => {
  try {
    const VideoCallController = require('./app/controller/videcall/videocall.controller');
    await VideoCallController.cleanupExpiredMeetings();
  } catch (error) {
    console.error('Error cleaning up expired meetings:', error);
  }
}, 60 * 60 * 1000); // Every hour

// --- SOCKET.IO SETUP END ---

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🎥 Video Calling: http://localhost:${PORT}/video`);
  console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`💳 Payment Gateway: Razorpay integrated`);
  console.log(`📊 Socket.IO: Real-time communication enabled`);
  console.log(`🌐 WebRTC: Peer-to-peer video calling active`);
});

module.exports = { app, server, io, socketServer };