const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const connectDB = require("./app/config/DB");
require("dotenv").config();
require('./app/helpers/cronjob')
const generateJitsiJwt = require('./app/utils/jitsiJwt');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const app = express();

// Connect to MongoDB
connectDB();

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret', // use a strong secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 } // 1 minute (adjust as needed)
}));

// Flash middleware (must come after session)
app.use(flash());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // your React frontend or EJS frontend if needed
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,               // allow cookies
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS
app.set("view engine", "ejs");
app.set("views", "views");

// Public folders
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/", require("./app/router/admin/index"));
app.use("/", require("./app/router/emplyee/index"));
app.use("/", require("./app/router/user/index"));
app.use("/video", require("./app/router/video/index"));


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

// --- SOCKET.IO SETUP START ---
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

// Initialize Socket.IO server for video calling
const SocketServer = require('./app/utils/socketServer');
const socketServer = new SocketServer(server);

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