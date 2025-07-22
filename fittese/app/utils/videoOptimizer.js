/**
 * Video Quality Optimizer for Multiple Users
 * Optimizes video quality based on network conditions and participant count
 */
class VideoOptimizer {
  constructor() {
    this.qualityLevels = {
      low: {
        video: { width: 320, height: 240, frameRate: 15, bitrate: 150000 },
        audio: { bitrate: 32000 }
      },
      medium: {
        video: { width: 640, height: 480, frameRate: 20, bitrate: 500000 },
        audio: { bitrate: 64000 }
      },
      high: {
        video: { width: 1280, height: 720, frameRate: 30, bitrate: 1500000 },
        audio: { bitrate: 128000 }
      },
      ultra: {
        video: { width: 1920, height: 1080, frameRate: 30, bitrate: 3000000 },
        audio: { bitrate: 128000 }
      }
    };

    this.networkThresholds = {
      excellent: 2000, // kbps
      good: 1000,
      fair: 500,
      poor: 200
    };
  }

  /**
   * Get optimal video constraints based on participant count and network
   */
  getOptimalConstraints(participantCount, networkQuality = 'good', isScreenShare = false) {
    let quality = 'medium';

    // Adjust quality based on participant count
    if (participantCount <= 2) {
      quality = networkQuality === 'excellent' ? 'high' : 'medium';
    } else if (participantCount <= 4) {
      quality = networkQuality === 'excellent' ? 'medium' : 'low';
    } else if (participantCount <= 8) {
      quality = 'low';
    } else {
      // For more than 8 participants, use very low quality
      quality = 'low';
    }

    // Screen share gets higher quality
    if (isScreenShare) {
      quality = participantCount <= 4 ? 'high' : 'medium';
    }

    const constraints = this.qualityLevels[quality];
    
    return {
      video: {
        width: { ideal: constraints.video.width },
        height: { ideal: constraints.video.height },
        frameRate: { ideal: constraints.video.frameRate },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1
      }
    };
  }

  /**
   * Get screen share constraints
   */
  getScreenShareConstraints(participantCount) {
    let quality = 'high';
    
    if (participantCount > 6) {
      quality = 'medium';
    } else if (participantCount > 10) {
      quality = 'low';
    }

    const constraints = this.qualityLevels[quality];

    return {
      video: {
        width: { ideal: constraints.video.width },
        height: { ideal: constraints.video.height },
        frameRate: { ideal: Math.min(constraints.video.frameRate, 15) },
        cursor: 'always'
      },
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    };
  }

  /**
   * Get adaptive bitrate settings for peer connection
   */
  getAdaptiveBitrateSettings(participantCount, networkQuality = 'good') {
    let quality = 'medium';

    if (participantCount <= 2) {
      quality = networkQuality === 'excellent' ? 'high' : 'medium';
    } else if (participantCount <= 4) {
      quality = networkQuality === 'excellent' ? 'medium' : 'low';
    } else {
      quality = 'low';
    }

    const settings = this.qualityLevels[quality];

    return {
      video: {
        maxBitrate: settings.video.bitrate,
        minBitrate: Math.floor(settings.video.bitrate * 0.3),
        startBitrate: Math.floor(settings.video.bitrate * 0.7)
      },
      audio: {
        maxBitrate: settings.audio.bitrate,
        minBitrate: 16000,
        startBitrate: settings.audio.bitrate
      }
    };
  }

  /**
   * Detect network quality based on connection stats
   */
  detectNetworkQuality(stats) {
    if (!stats) return 'good';

    const bandwidth = stats.availableOutgoingBitrate || stats.bandwidth || 1000;
    const rtt = stats.roundTripTime || stats.rtt || 50;
    const packetLoss = stats.packetLossRate || 0;

    let quality = 'good';

    if (bandwidth > this.networkThresholds.excellent && rtt < 50 && packetLoss < 0.01) {
      quality = 'excellent';
    } else if (bandwidth > this.networkThresholds.good && rtt < 100 && packetLoss < 0.03) {
      quality = 'good';
    } else if (bandwidth > this.networkThresholds.fair && rtt < 200 && packetLoss < 0.05) {
      quality = 'fair';
    } else {
      quality = 'poor';
    }

    return quality;
  }

  /**
   * Apply bandwidth adaptation to peer connection
   */
  async applyBandwidthAdaptation(peerConnection, participantCount, networkQuality) {
    try {
      const senders = peerConnection.getSenders();
      const bitrateSettings = this.getAdaptiveBitrateSettings(participantCount, networkQuality);

      for (const sender of senders) {
        if (sender.track) {
          const params = sender.getParameters();
          
          if (sender.track.kind === 'video') {
            if (params.encodings && params.encodings.length > 0) {
              params.encodings[0].maxBitrate = bitrateSettings.video.maxBitrate;
              params.encodings[0].minBitrate = bitrateSettings.video.minBitrate;
              await sender.setParameters(params);
            }
          } else if (sender.track.kind === 'audio') {
            if (params.encodings && params.encodings.length > 0) {
              params.encodings[0].maxBitrate = bitrateSettings.audio.maxBitrate;
              await sender.setParameters(params);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error applying bandwidth adaptation:', error);
    }
  }

  /**
   * Get simulcast configuration for scalable video
   */
  getSimulcastConfig(participantCount) {
    if (participantCount <= 4) {
      return {
        encodings: [
          { rid: 'high', maxBitrate: 1500000, scaleResolutionDownBy: 1 },
          { rid: 'medium', maxBitrate: 500000, scaleResolutionDownBy: 2 },
          { rid: 'low', maxBitrate: 150000, scaleResolutionDownBy: 4 }
        ]
      };
    } else {
      return {
        encodings: [
          { rid: 'medium', maxBitrate: 500000, scaleResolutionDownBy: 1 },
          { rid: 'low', maxBitrate: 150000, scaleResolutionDownBy: 2 }
        ]
      };
    }
  }

  /**
   * Monitor connection quality and adjust settings
   */
  async monitorConnectionQuality(peerConnection, onQualityChange) {
    const monitor = async () => {
      try {
        const stats = await peerConnection.getStats();
        let bandwidth = 0;
        let rtt = 0;
        let packetLoss = 0;

        stats.forEach(report => {
          if (report.type === 'outbound-rtp' && report.kind === 'video') {
            bandwidth = report.availableOutgoingBitrate || 0;
          } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            rtt = report.currentRoundTripTime || 0;
          } else if (report.type === 'inbound-rtp') {
            packetLoss = report.packetsLost / (report.packetsReceived + report.packetsLost) || 0;
          }
        });

        const quality = this.detectNetworkQuality({ bandwidth: bandwidth * 1000, rtt: rtt * 1000, packetLoss });
        onQualityChange(quality, { bandwidth, rtt, packetLoss });

      } catch (error) {
        console.error('Error monitoring connection quality:', error);
      }
    };

    // Monitor every 5 seconds
    const interval = setInterval(monitor, 5000);
    
    // Return cleanup function
    return () => clearInterval(interval);
  }
}

module.exports = VideoOptimizer;
