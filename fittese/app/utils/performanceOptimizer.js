/**
 * Performance Optimizer for Video Calling System
 * Optimizes server performance and resource usage for better video calling experience
 */
class PerformanceOptimizer {
  constructor() {
    this.connectionPool = new Map();
    this.roomMetrics = new Map();
    this.globalMetrics = {
      totalConnections: 0,
      totalBandwidth: 0,
      avgLatency: 0,
      errorRate: 0
    };
    
    this.startOptimizationLoop();
  }

  /**
   * Optimize WebRTC connection settings based on current load
   */
  optimizeWebRTCSettings(participantCount, networkQuality, serverLoad) {
    const settings = {
      video: {
        codec: 'VP8', // More CPU efficient than H.264 for software encoding
        maxBitrate: 1500000,
        minBitrate: 150000,
        startBitrate: 800000,
        maxFramerate: 30,
        scaleResolutionDownBy: 1
      },
      audio: {
        codec: 'OPUS',
        maxBitrate: 128000,
        minBitrate: 16000,
        dtx: true, // Discontinuous transmission
        fec: true  // Forward error correction
      }
    };

    // Adjust based on participant count
    if (participantCount > 4) {
      settings.video.maxBitrate = 800000;
      settings.video.maxFramerate = 20;
      settings.video.scaleResolutionDownBy = 2;
    }

    if (participantCount > 8) {
      settings.video.maxBitrate = 400000;
      settings.video.maxFramerate = 15;
      settings.video.scaleResolutionDownBy = 4;
      settings.audio.maxBitrate = 64000;
    }

    // Adjust based on network quality
    if (networkQuality === 'poor') {
      settings.video.maxBitrate = Math.min(settings.video.maxBitrate, 300000);
      settings.video.maxFramerate = 10;
      settings.audio.maxBitrate = 32000;
    }

    // Adjust based on server load
    if (serverLoad > 80) {
      settings.video.maxBitrate *= 0.7;
      settings.video.codec = 'VP8'; // Ensure VP8 for lower CPU usage
      settings.audio.maxBitrate = Math.min(settings.audio.maxBitrate, 64000);
    }

    return settings;
  }

  /**
   * Get optimized ICE servers configuration
   */
  getOptimizedIceServers() {
    return [
      // STUN servers for NAT traversal
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      
      // TURN servers for problematic networks
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ];
  }

  /**
   * Optimize Socket.IO configuration
   */
  getOptimizedSocketConfig() {
    return {
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6, // 1MB max message size
      transports: ['websocket', 'polling'],
      allowEIO3: false, // Use only Engine.IO v4
      cors: {
        origin: true,
        credentials: true
      },
      compression: true,
      perMessageDeflate: {
        threshold: 1024,
        concurrencyLimit: 10,
        memLevel: 7
      }
    };
  }

  /**
   * Monitor and optimize room performance
   */
  optimizeRoomPerformance(roomId, participants) {
    const roomMetric = this.roomMetrics.get(roomId) || {
      participantCount: 0,
      bandwidth: 0,
      latency: 0,
      packetLoss: 0,
      cpuUsage: 0,
      lastOptimized: 0
    };

    roomMetric.participantCount = participants.length;
    
    // Calculate total bandwidth for room
    roomMetric.bandwidth = participants.reduce((total, participant) => {
      return total + (participant.bandwidth || 0);
    }, 0);

    // Apply optimizations if needed
    const now = Date.now();
    if (now - roomMetric.lastOptimized > 30000) { // Optimize every 30 seconds
      this.applyRoomOptimizations(roomId, roomMetric);
      roomMetric.lastOptimized = now;
    }

    this.roomMetrics.set(roomId, roomMetric);
  }

  /**
   * Apply specific optimizations to a room
   */
  applyRoomOptimizations(roomId, metrics) {
    const optimizations = [];

    // High bandwidth usage optimization
    if (metrics.bandwidth > 50000000) { // 50 Mbps
      optimizations.push({
        type: 'bandwidth',
        action: 'reduce_quality',
        params: { maxBitrate: 500000 }
      });
    }

    // High latency optimization
    if (metrics.latency > 200) {
      optimizations.push({
        type: 'latency',
        action: 'optimize_routing',
        params: { preferUDP: true }
      });
    }

    // High participant count optimization
    if (metrics.participantCount > 8) {
      optimizations.push({
        type: 'scaling',
        action: 'enable_simulcast',
        params: { layers: 3 }
      });
    }

    return optimizations;
  }

  /**
   * Database query optimization for video calls
   */
  optimizeVideoCallQueries() {
    return {
      // Use lean queries for better performance
      findActiveRooms: () => ({
        status: 'active',
        endedAt: { $exists: false }
      }),
      
      // Index suggestions
      indexes: [
        { 'status': 1, 'scheduledAt': 1 },
        { 'roomId': 1 },
        { 'meetingId': 1 },
        { 'host': 1, 'status': 1 },
        { 'participants.userId': 1, 'status': 1 }
      ],
      
      // Aggregation pipeline for room statistics
      roomStatsAggregation: [
        {
          $match: {
            status: { $in: ['active', 'scheduled'] }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgParticipants: { $avg: { $size: '$participants' } },
            totalBandwidth: { $sum: '$bandwidth' }
          }
        }
      ]
    };
  }

  /**
   * Memory optimization for video calls
   */
  optimizeMemoryUsage() {
    // Clean up old metrics
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [roomId, metrics] of this.roomMetrics.entries()) {
      if (now - metrics.lastOptimized > maxAge) {
        this.roomMetrics.delete(roomId);
      }
    }

    // Force garbage collection if available
    if (global.gc && process.memoryUsage().heapUsed > 500 * 1024 * 1024) { // 500MB
      global.gc();
    }
  }

  /**
   * CPU optimization strategies
   */
  optimizeCPUUsage(cpuUsage) {
    const optimizations = {
      enableCpuOptimizations: true,
      strategies: []
    };

    if (cpuUsage > 70) {
      optimizations.strategies.push({
        type: 'video_processing',
        action: 'reduce_complexity',
        params: {
          disableVideoFilters: true,
          reduceFrameRate: true,
          lowerResolution: true
        }
      });
    }

    if (cpuUsage > 80) {
      optimizations.strategies.push({
        type: 'connection_management',
        action: 'limit_connections',
        params: {
          maxNewConnections: 5,
          connectionTimeout: 30000
        }
      });
    }

    if (cpuUsage > 90) {
      optimizations.strategies.push({
        type: 'emergency_mode',
        action: 'emergency_optimizations',
        params: {
          pauseNewRooms: true,
          forceAudioOnly: true,
          limitParticipants: 4
        }
      });
    }

    return optimizations;
  }

  /**
   * Network optimization for better connectivity
   */
  optimizeNetworkSettings() {
    return {
      tcp: {
        keepAlive: true,
        keepAliveDelay: 30000,
        noDelay: true
      },
      websocket: {
        compression: true,
        maxCompressedSize: 64 * 1024,
        maxUncompressedSize: 256 * 1024
      },
      webrtc: {
        iceConnectionTimeout: 30000,
        iceGatheringTimeout: 10000,
        dtlsTimeout: 30000
      }
    };
  }

  /**
   * Start continuous optimization loop
   */
  startOptimizationLoop() {
    setInterval(() => {
      this.optimizeMemoryUsage();
      this.updateGlobalMetrics();
    }, 60000); // Run every minute

    setInterval(() => {
      this.performDeepOptimization();
    }, 300000); // Deep optimization every 5 minutes
  }

  /**
   * Update global performance metrics
   */
  updateGlobalMetrics() {
    const os = require('os');
    
    this.globalMetrics.totalConnections = this.connectionPool.size;
    this.globalMetrics.totalBandwidth = Array.from(this.roomMetrics.values())
      .reduce((total, room) => total + room.bandwidth, 0);
    
    // System metrics
    const cpus = os.cpus();
    const loadAvg = os.loadavg()[0];
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    this.globalMetrics.cpuUsage = (loadAvg / cpus.length) * 100;
    this.globalMetrics.memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
  }

  /**
   * Perform deep optimization analysis
   */
  performDeepOptimization() {
    const metrics = this.globalMetrics;
    
    // Generate optimization report
    const report = {
      timestamp: new Date(),
      recommendations: [],
      systemHealth: {
        cpu: metrics.cpuUsage,
        memory: metrics.memoryUsage,
        connections: metrics.totalConnections,
        bandwidth: metrics.totalBandwidth
      }
    };

    // Add recommendations based on metrics
    if (metrics.cpuUsage > 80) {
      report.recommendations.push({
        priority: 'high',
        type: 'cpu',
        message: 'High CPU usage detected',
        actions: ['Reduce video quality', 'Limit new connections', 'Enable hardware acceleration']
      });
    }

    if (metrics.memoryUsage > 85) {
      report.recommendations.push({
        priority: 'high',
        type: 'memory',
        message: 'High memory usage detected',
        actions: ['Clean up inactive connections', 'Reduce buffer sizes', 'Force garbage collection']
      });
    }

    if (metrics.totalBandwidth > 1000000000) { // 1 Gbps
      report.recommendations.push({
        priority: 'medium',
        type: 'bandwidth',
        message: 'High bandwidth usage detected',
        actions: ['Implement adaptive bitrate', 'Enable compression', 'Optimize video codecs']
      });
    }

    console.log('🔧 Performance Optimization Report:', report);
    return report;
  }

  /**
   * Get current performance status
   */
  getPerformanceStatus() {
    return {
      ...this.globalMetrics,
      roomCount: this.roomMetrics.size,
      connectionPoolSize: this.connectionPool.size,
      optimizationLevel: this.getOptimizationLevel(),
      lastOptimized: new Date()
    };
  }

  /**
   * Determine current optimization level
   */
  getOptimizationLevel() {
    const cpu = this.globalMetrics.cpuUsage;
    const memory = this.globalMetrics.memoryUsage;
    
    if (cpu > 90 || memory > 90) return 'aggressive';
    if (cpu > 70 || memory > 75) return 'high';
    if (cpu > 50 || memory > 60) return 'medium';
    return 'low';
  }
}

module.exports = PerformanceOptimizer;
