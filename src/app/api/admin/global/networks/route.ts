import { connectToDatabase } from '@/app/server/db/mongoDB';
import NetworkConfigModel from '@/app/server/models/NetworkConfig.model';
import SystemMetricsModel from '@/app/server/models/SystemMetrics.model';
import SessionAnalyticsModel from '@/app/server/models/SessionAnalytics.model';
import DataUsageSnapshotModel from '@/app/server/models/DataUsageSnapshot.model';
import SpeedTestHistoryModel from '@/app/server/models/SpeedTestHistory.model';
import { NextResponse } from 'next/server';

// Define DeviceBreakdown type if not imported from elsewhere
type DeviceBreakdown = {
  mobile?: number;
  desktop?: number;
  tablet?: number;
  unknown?: number;
};

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 300000);

    // Get all networks
    const networks = await NetworkConfigModel.find({})
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    if (!networks || networks.length === 0) {
      return NextResponse.json({ 
        message: 'No networks found',
        networks: []
      }, { status: 200 });
    }

    // Extract networkIds for queries
    const networkIds = networks.map(n => n.networkId);

    // Get latest system metrics for each network (last 5 minutes = online)
    const latestMetrics = await SystemMetricsModel.aggregate([
      { 
        $match: { 
          networkId: { $in: networkIds },
          timestamp: { $gte: fiveMinutesAgo }
        } 
      },
      { $sort: { networkId: 1, timestamp: -1 } },
      {
        $group: {
          _id: '$networkId',
          latestMetric: { $first: '$$ROOT' }
        }
      }
    ]);

    // Get recent session analytics (last hour)
    const sessionAnalytics = await SessionAnalyticsModel.aggregate([
      { 
        $match: { 
          networkId: { $in: networkIds },
          timestamp: { $gte: fiveMinutesAgo }
        } 
      },
      {
        $group: {
          _id: '$networkId',
          totalSessions: { $sum: '$totalSessions' },
          activeSessions: { $sum: '$activeSessions' },
          completedSessions: { $sum: '$completedSessions' },
          averageDuration: { $avg: '$averageDuration' },
          totalSpeedTests: { $sum: '$totalSpeedTests' },
          totalDownloadGB: { $sum: '$totalDataTransfer.downloadGB' },
          totalUploadGB: { $sum: '$totalDataTransfer.uploadGB' }
        }
      }
    ]);

    // Get recent speed test data (last hour)
    const speedTestData = await SpeedTestHistoryModel.aggregate([
      { 
        $match: { 
          networkId: { $in: networkIds },
          timestamp: { $gte: fiveMinutesAgo }
        } 
      },
      {
        $group: {
          _id: '$networkId',
          avgDownload: { $avg: '$downloadMbps' },
          avgUpload: { $avg: '$uploadMbps' },
          avgLatency: { $avg: '$latencyMs' },
          totalTests: { $sum: 1 }
        }
      }
    ]);

    // Get recent data usage (last hour)
    const dataUsage = await DataUsageSnapshotModel.aggregate([
      { 
        $match: { 
          networkId: { $in: networkIds },
          timestamp: { $gte: fiveMinutesAgo }
        } 
      },
      {
        $group: {
          _id: '$networkId',
          totalUsers: { $sum: '$totalUsers' },
          totalDownloadBytes: { $sum: '$totalDownloadBytes' },
          totalUploadBytes: { $sum: '$totalUploadBytes' },
          deviceBreakdown: {
            $push: '$deviceBreakdown'
          }
        }
      }
    ]);

    // Create lookup maps
    const metricsMap = new Map(latestMetrics.map(m => [m._id, m.latestMetric]));
    const sessionMap = new Map(sessionAnalytics.map(s => [s._id, s]));
    const speedMap = new Map(speedTestData.map(s => [s._id, s]));
    const usageMap = new Map(dataUsage.map(u => [u._id, u]));

    // Define Alert type
    type Alert = { type: string; message: string };

    // Build network data with metrics
    const networksWithMetrics = networks.map((network) => {
      const networkId = network.networkId;
      const metrics = metricsMap.get(networkId);
      const sessions = sessionMap.get(networkId);
      const speeds = speedMap.get(networkId);
      const usage = usageMap.get(networkId);

      // Determine if network is online (has metrics from last 5 minutes)
      const isOnline = !!metrics;

      // Calculate device breakdown
      let deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };
      if (usage && usage.deviceBreakdown) {
        (usage.deviceBreakdown as DeviceBreakdown[]).forEach((breakdown: DeviceBreakdown) => {
          deviceBreakdown.mobile += breakdown.mobile || 0;
          deviceBreakdown.desktop += breakdown.desktop || 0;
          deviceBreakdown.tablet += breakdown.tablet || 0;
          deviceBreakdown.unknown += breakdown.unknown || 0;
        });
      }

      return {
        networkId: network.networkId,
        ssid: network.ssid,
        host: network.host,
        price: network.price,
        description: network.description,
        location: {
          country: network.location.country,
          region: network.location.region,
          city: network.location.city,
          area: network.location.area,
          coordinates: network.location.coordinates
        },
        contact: network.contact,
        hardware: network.hardware,
        status: isOnline ? 'online' : 'offline',
        image: network.image ? `https://ipfs.io/ipfs/${network.image}` : null,
        createdAt: network.createdAt,
        lastSeen: metrics ? metrics.timestamp : network.lastSeen,
        
        // Current metrics (real-time)
        currentMetrics: metrics ? {
          activeUsers: metrics.activeUsers || 0,
          cpuUsage: Math.round((metrics.cpuUsage || 0) * 10) / 10,
          memoryUsage: Math.round((metrics.memoryUsage || 0) * 10) / 10,
          temperature: Math.round((metrics.temperature || 0) * 10) / 10,
          diskUsage: Math.round((metrics.diskUsage || 0) * 10) / 10,
          networkTraffic: {
            rxBytes: metrics.networkTraffic?.rxBytes || 0,
            txBytes: metrics.networkTraffic?.txBytes || 0
          },
          timestamp: metrics.timestamp,
          collectedAt: metrics.collectedAt
        } : null,

        // Performance metrics (last hour)
        performance: {
          averageSpeed: speeds ? {
            download: Math.round((speeds.avgDownload || 0) * 10) / 10,
            upload: Math.round((speeds.avgUpload || 0) * 10) / 10,
            latency: Math.round((speeds.avgLatency || 0) * 10) / 10
          } : { download: 0, upload: 0, latency: 0 },
          totalSpeedTests: speeds?.totalTests || 0
        },

        // Session analytics (last hour)
        analytics: {
          totalSessions: sessions?.totalSessions || 0,
          activeSessions: sessions?.activeSessions || 0,
          completedSessions: sessions?.completedSessions || 0,
          averageDuration: Math.round(sessions?.averageDuration || 0),
          totalSpeedTests: sessions?.totalSpeedTests || 0,
          dataTransfer: {
            downloadGB: Math.round((sessions?.totalDownloadGB || 0) * 100) / 100,
            uploadGB: Math.round((sessions?.totalUploadGB || 0) * 100) / 100,
            totalGB: Math.round(((sessions?.totalDownloadGB || 0) + (sessions?.totalUploadGB || 0)) * 100) / 100
          }
        },

        // Data usage (last hour)
        dataUsage: {
          totalUsers: usage?.totalUsers || 0,
          totalDownloadBytes: usage?.totalDownloadBytes || 0,
          totalUploadBytes: usage?.totalUploadBytes || 0,
          totalBytes: (usage?.totalDownloadBytes || 0) + (usage?.totalUploadBytes || 0),
          totalDownloadGB: Math.round((usage?.totalDownloadBytes || 0) / (1024 * 1024 * 1024) * 100) / 100,
          totalUploadGB: Math.round((usage?.totalUploadBytes || 0) / (1024 * 1024 * 1024) * 100) / 100,
          deviceBreakdown
        },

        // Network health summary
        health: {
          status: isOnline ? 'online' : 'offline',
          lastActivity: metrics ? metrics.timestamp : network.lastSeen,
          dataQuality: {
            hasRecentMetrics: !!metrics,
            hasSessionData: !!sessions,
            hasSpeedTests: !!speeds,
            hasDataUsage: !!usage
          },
          alerts: [] as Alert[]
        }
      };
    });

    // Add health alerts
    networksWithMetrics.forEach(network => {
      const alerts = [];
      
      if (network.currentMetrics) {
        if (network.currentMetrics.cpuUsage > 80) {
          alerts.push({ type: 'warning', message: 'High CPU usage' });
        }
        if (network.currentMetrics.memoryUsage > 90) {
          alerts.push({ type: 'critical', message: 'High memory usage' });
        }
        if (network.currentMetrics.temperature > 70) {
          alerts.push({ type: 'warning', message: 'High temperature' });
        }
        if (network.currentMetrics.diskUsage > 85) {
          alerts.push({ type: 'warning', message: 'Low disk space' });
        }
      }

      if (!network.health.dataQuality.hasRecentMetrics) {
        alerts.push({ type: 'error', message: 'No recent system metrics' });
      }

      network.health.alerts = alerts;
    });

    // Sort networks: online first, then by lastSeen
    networksWithMetrics.sort((a, b) => {
      if (a.health.status !== b.health.status) {
        return a.health.status === 'online' ? -1 : 1;
      }
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });

    // Summary statistics
    const summary = {
      total: networksWithMetrics.length,
      online: networksWithMetrics.filter(n => n.health.status === 'online').length,
      offline: networksWithMetrics.filter(n => n.health.status === 'offline').length,
      withAlerts: networksWithMetrics.filter(n => n.health.alerts.length > 0).length,
      totalActiveUsers: networksWithMetrics.reduce((sum, n) => sum + (n.currentMetrics?.activeUsers || 0), 0),
      totalSessions: networksWithMetrics.reduce((sum, n) => sum + n.analytics.totalSessions, 0)
    };

    return NextResponse.json({
      summary,
      networks: networksWithMetrics,
      metadata: {
        lastUpdated: now.toISOString(),
        dataRange: {
          from: fiveMinutesAgo.toISOString(),
          to: now.toISOString()
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching networks:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch networks',
        details: process.env.NODE_ENV === 'development' && error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : undefined
      },
      { status: 500 }
    );
  }
}