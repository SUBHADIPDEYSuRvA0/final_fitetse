/**
 * Server Load Balancer for Video Calling Optimization
 * Manages server resources and distributes video calling load efficiently
 */
class LoadBalancer {
  constructor() {
    this.roomLoadMap = new Map(); // Track load per room
    this.serverStats = {
      cpuUsage: 0,
      memoryUsage: 0,
      activeConnections: 0,
      activePeers: 0,
      bandwidth: 0
    };
    this.maxRoomSize = parseInt(process.env.MAX_ROOM_SIZE) || 12;
    this.maxConcurrentRooms = parseInt(process.env.MAX_CONCURRENT_ROOMS) || 50;
    this.startMonitoring();
  }

  /**
   * Check if server can handle new room
   */
  canCreateRoom() {
    const currentRooms = this.roomLoadMap.size;
    const cpuOk = this.serverStats.cpuUsage < 80;
    const memoryOk = this.serverStats.memoryUsage < 85;
    const roomsOk = currentRooms < this.maxConcurrentRooms;

    return cpuOk && memoryOk && roomsOk;
  }

  /**
   * Check if room can accept new participant
   */
  canJoinRoom(roomId) {
    const roomLoad = this.roomLoadMap.get(roomId);
    if (!roomLoad) return true;

    const participantCount = roomLoad.participants;
    const cpuOk = this.serverStats.cpuUsage < 90;
    const memoryOk = this.serverStats.memoryUsage < 90;
    const roomSizeOk = participantCount < this.maxRoomSize;

    return cpuOk && memoryOk && roomSizeOk;
  }

  /**
   * Get optimal room configuration based on current load
   */
  getOptimalRoomConfig(participantCount) {
    const cpuUsage = this.serverStats.cpuUsage;
    const memoryUsage = this.serverStats.memoryUsage;
    
    let config = {
      videoQuality: 'high',
      audioQuality: 'high',
      enableRecording: true,
      enableScreenShare: true,
      maxBitrate: 2000000,
      adaptiveBitrate: true
    };

    // Reduce quality if server is under stress
    if (cpuUsage > 70 || memoryUsage > 75) {
      config.videoQuality = 'medium';
      config.maxBitrate = 1000000;
      config.enableRecording = false;
    }

    if (cpuUsage > 80 || memoryUsage > 85) {
      config.videoQuality = 'low';
      config.audioQuality = 'medium';
      config.maxBitrate = 500000;
      config.enableScreenShare = false;
    }

    // Further reduce for large rooms
    if (participantCount > 6) {
      config.videoQuality = 'low';
      config.maxBitrate = Math.min(config.maxBitrate, 300000);
    }

    if (participantCount > 10) {
      config.videoQuality = 'low';
      config.audioQuality = 'low';
      config.maxBitrate = 150000;
      config.enableScreenShare = false;
      config.enableRecording = false;
    }

    return config;
  }

  /**
   * Update room load statistics
   */
  updateRoomLoad(roomId, participants, bandwidth, cpuImpact) {
    this.roomLoadMap.set(roomId, {
      participants,
      bandwidth,
      cpuImpact,
      lastUpdated: new Date()
    });
  }

  /**
   * Remove room from load tracking
   */
  removeRoom(roomId) {
    this.roomLoadMap.delete(roomId);
  }

  /**
   * Get current server load status
   */
  getLoadStatus() {
    const totalParticipants = Array.from(this.roomLoadMap.values())
      .reduce((sum, room) => sum + room.participants, 0);
    
    const totalBandwidth = Array.from(this.roomLoadMap.values())
      .reduce((sum, room) => sum + room.bandwidth, 0);

    return {
      ...this.serverStats,
      totalRooms: this.roomLoadMap.size,
      totalParticipants,
      totalBandwidth,
      loadLevel: this.getLoadLevel()
    };
  }

  /**
   * Get current load level (low, medium, high, critical)
   */
  getLoadLevel() {
    const cpu = this.serverStats.cpuUsage;
    const memory = this.serverStats.memoryUsage;
    const rooms = this.roomLoadMap.size;
    
    const cpuLevel = cpu > 90 ? 4 : cpu > 75 ? 3 : cpu > 50 ? 2 : 1;
    const memoryLevel = memory > 90 ? 4 : memory > 75 ? 3 : memory > 50 ? 2 : 1;
    const roomLevel = rooms > 40 ? 4 : rooms > 30 ? 3 : rooms > 20 ? 2 : 1;
    
    const maxLevel = Math.max(cpuLevel, memoryLevel, roomLevel);
    
    switch (maxLevel) {
      case 4: return 'critical';
      case 3: return 'high';
      case 2: return 'medium';
      default: return 'low';
    }
  }

  /**
   * Start system monitoring
   */
  startMonitoring() {
    const os = require('os');
    
    setInterval(() => {
      // CPU usage calculation
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      
      cpus.forEach(cpu => {
        for (let type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      });
      
      const idle = totalIdle / cpus.length;
      const total = totalTick / cpus.length;
      const usage = 100 - ~~(100 * idle / total);
      
      this.serverStats.cpuUsage = usage;
      
      // Memory usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      this.serverStats.memoryUsage = (usedMem / totalMem) * 100;
      
      // Clean up old room data
      this.cleanupOldRoomData();
      
    }, 5000); // Update every 5 seconds
  }

  /**
   * Clean up old room load data
   */
  cleanupOldRoomData() {
    const now = new Date();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    for (const [roomId, roomData] of this.roomLoadMap.entries()) {
      if (now - roomData.lastUpdated > maxAge) {
        this.roomLoadMap.delete(roomId);
      }
    }
  }

  /**
   * Get recommendations for room optimization
   */
  getRoomOptimizationRecommendations(roomId) {
    const roomLoad = this.roomLoadMap.get(roomId);
    const serverLoad = this.getLoadStatus();
    const recommendations = [];

    if (serverLoad.loadLevel === 'high' || serverLoad.loadLevel === 'critical') {
      recommendations.push({
        type: 'quality',
        message: 'Reduce video quality due to high server load',
        action: 'reduce_quality'
      });
    }

    if (roomLoad && roomLoad.participants > 8) {
      recommendations.push({
        type: 'participants',
        message: 'Consider splitting large meeting into smaller rooms',
        action: 'split_room'
      });
    }

    if (serverLoad.totalBandwidth > 100000000) { // 100 Mbps
      recommendations.push({
        type: 'bandwidth',
        message: 'High bandwidth usage detected, consider quality reduction',
        action: 'reduce_bitrate'
      });
    }

    return recommendations;
  }

  /**
   * Apply load balancing optimizations
   */
  applyOptimizations(roomId, socket) {
    const config = this.getOptimalRoomConfig(
      this.roomLoadMap.get(roomId)?.participants || 1
    );
    
    socket.emit('optimization-config', config);
    
    return config;
  }
}

module.exports = LoadBalancer;
