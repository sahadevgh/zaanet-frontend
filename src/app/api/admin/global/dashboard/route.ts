import { connectToDatabase } from '@/app/server/db/mongoDB';
import DataUsageSnapshotModel from '@/app/server/models/DataUsageSnapshot.model';
import NetworkConfigModel from '@/app/server/models/NetworkConfig.model';
import SessionAnalyticsModel from '@/app/server/models/SessionAnalytics.model';
import SpeedTestHistoryModel from '@/app/server/models/SpeedTestHistory.model';
import SystemMetricsModel from '@/app/server/models/SystemMetrics.model';

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const last24Hours = new Date(now.getTime() - 24 * 3600000);

    // Get all networks (not just offline ones)
    const allNetworks = await NetworkConfigModel.find({});

    // Get recent system metrics for network health check
    const recentMetrics = await SystemMetricsModel.find({
      timestamp: { $gte: new Date(now.getTime() - 300000) } // Last 5 minutes
    });

    // Determine which networks are currently online based on recent metrics
    const onlineNetworkIds = new Set(recentMetrics.map(m => m.networkId));

    // Aggregate system metrics from last hour
    const systemMetricsAgg = await SystemMetricsModel.aggregate([
      { $match: { timestamp: { $gte: oneHourAgo } } },
      {
        $group: {
          _id: '$networkId',
          latestTimestamp: { $max: '$timestamp' },
          avgCPU: { $avg: '$cpuUsage' },
          avgMemory: { $avg: '$memoryUsage' },
          maxTemp: { $max: '$temperature' },
          avgActiveUsers: { $avg: '$activeUsers' },
          maxActiveUsers: { $max: '$activeUsers' },
          avgDiskUsage: { $avg: '$diskUsage' },
          sampleCount: { $sum: 1 }
        }
      }
    ]);

    // Aggregate speed test data from last hour
    const speedTestAgg = await SpeedTestHistoryModel.aggregate([
      { $match: { timestamp: { $gte: oneHourAgo } } },
      {
        $group: {
          _id: null,
          avgDownload: { $avg: '$downloadMbps' },
          avgUpload: { $avg: '$uploadMbps' },
          avgLatency: { $avg: '$latencyMs' },
          totalTests: { $sum: 1 },
          networkCount: { $addToSet: '$networkId' }
        }
      }
    ]);

    // Aggregate data usage from last hour
    const dataUsageAgg = await DataUsageSnapshotModel.aggregate([
      { $match: { timestamp: { $gte: oneHourAgo } } },
      {
        $group: {
          _id: null,
          totalDownloadBytes: { $sum: '$totalDownloadBytes' },
          totalUploadBytes: { $sum: '$totalUploadBytes' },
          totalUsers: { $sum: '$totalUsers' },
          totalMobile: { $sum: '$deviceBreakdown.mobile' },
          totalDesktop: { $sum: '$deviceBreakdown.desktop' },
          totalTablet: { $sum: '$deviceBreakdown.tablet' },
          totalUnknown: { $sum: '$deviceBreakdown.unknown' }
        }
      }
    ]);

    // Aggregate session analytics from last hour
    const sessionAgg = await SessionAnalyticsModel.aggregate([
      { $match: { timestamp: { $gte: oneHourAgo } } },
      // Sort by timestamp descending to get most recent first
      { $sort: { networkId: 1, timestamp: -1 } },
      // Group by networkId and take the first (most recent) document
      {
        $group: {
          _id: '$networkId',
          latestTimestamp: { $first: '$timestamp' },
          totalSessions: { $first: '$totalSessions' },
          activeSessions: { $first: '$activeSessions' },
          completedSessions: { $first: '$completedSessions' },
          averageDuration: { $first: '$averageDuration' },
          totalSpeedTests: { $first: '$totalSpeedTests' },
          totalDownloadGB: { $first: '$totalDataTransfer.downloadGB' },
          totalUploadGB: { $first: '$totalDataTransfer.uploadGB' }
        }
      },
      // Then sum across all networks
      {
        $group: {
          _id: null,
          totalSessions: { $sum: '$totalSessions' },
          totalActiveSessions: { $sum: '$activeSessions' },
          totalCompletedSessions: { $sum: '$completedSessions' },
          avgDuration: { $avg: '$averageDuration' },
          totalSpeedTests: { $sum: '$totalSpeedTests' },
          totalDownloadGB: { $sum: '$totalDownloadGB' },
          totalUploadGB: { $sum: '$totalUploadGB' }
        }
      }
    ]);
    // Get 24-hour trend data for charts
    const hourlyTrends = await SystemMetricsModel.aggregate([
      { $match: { timestamp: { $gte: last24Hours } } },
      {
        $group: {
          _id: {
            hour: { $hour: '$timestamp' },
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          avgActiveUsers: { $avg: '$activeUsers' },
          avgCPU: { $avg: '$cpuUsage' },
          avgMemory: { $avg: '$memoryUsage' },
          maxTemp: { $max: '$temperature' }
        }
      },
      { $sort: { '_id.date': 1, '_id.hour': 1 } },
      { $limit: 24 }
    ]);

    // Process aggregated data
    const speedData = speedTestAgg[0] || {};
    const usageData = dataUsageAgg[0] || {};
    const sessionData = sessionAgg[0] || {};

    // Calculate network statistics
    const onlineNetworks = allNetworks.filter(n => onlineNetworkIds.has(n.networkId));
    const totalActiveUsers = systemMetricsAgg.reduce((sum, n) => sum + (n.avgActiveUsers || 0), 0);

    // Build network breakdown with actual data
    const networkBreakdown = allNetworks.map(network => {
      const metrics = systemMetricsAgg.find(m => m._id === network.networkId);
      const isOnline = onlineNetworkIds.has(network.networkId);

      return {
        networkId: network.networkId,
        ssid: network.ssid,
        location: `${network.location.city}, ${network.location.region}`,
        activeUsers: Math.round(metrics?.avgActiveUsers || 0),
        maxUsers: metrics?.maxActiveUsers || 0,
        avgCPU: Math.round((metrics?.avgCPU || 0) * 10) / 10,
        avgMemory: Math.round((metrics?.avgMemory || 0) * 10) / 10,
        maxTemp: Math.round((metrics?.maxTemp || 0) * 10) / 10,
        diskUsage: Math.round((metrics?.avgDiskUsage || 0) * 10) / 10,
        status: isOnline ? 'online' : 'offline',
        lastSeen: network.lastSeen,
        dataPoints: metrics?.sampleCount || 0
      };
    });

    // Hourly activity trends
    const hourlyActivityTrends = hourlyTrends.map(trend => ({
      hour: trend._id.hour,
      date: trend._id.date,
      activeUsers: Math.round(trend.avgActiveUsers || 0),
      cpu: Math.round((trend.avgCPU || 0) * 10) / 10,
      memory: Math.round((trend.avgMemory || 0) * 10) / 10,
      temperature: Math.round((trend.maxTemp || 0) * 10) / 10
    }));

    // Build response
    const globalDashboardData = {
      networks: {
        total: allNetworks.length,
        online: onlineNetworks.length,
        offline: allNetworks.length - onlineNetworks.length,
        active: systemMetricsAgg.length // Networks with recent data
      },
      overview: {
        totalActiveUsers: Math.round(totalActiveUsers),
        totalSessions: sessionData.totalSessions || 0,
        activeSessions: sessionData.totalActiveSessions || 0,
        completedSessions: sessionData.totalCompletedSessions || 0,
        averageSessionDuration: Math.round(sessionData.avgDuration || 0),
        systemHealth: {
          cpu: systemMetricsAgg.length > 0 ?
            Math.round((systemMetricsAgg.reduce((sum, n) => sum + (n.avgCPU || 0), 0) / systemMetricsAgg.length) * 10) / 10 : 0,
          memory: systemMetricsAgg.length > 0 ?
            Math.round((systemMetricsAgg.reduce((sum, n) => sum + (n.avgMemory || 0), 0) / systemMetricsAgg.length) * 10) / 10 : 0,
          temperature: systemMetricsAgg.length > 0 ?
            Math.round(Math.max(...systemMetricsAgg.map(n => n.maxTemp || 0)) * 10) / 10 : 0,
          diskUsage: systemMetricsAgg.length > 0 ?
            Math.round((systemMetricsAgg.reduce((sum, n) => sum + (n.avgDiskUsage || 0), 0) / systemMetricsAgg.length) * 10) / 10 : 0
        }
      },
      performance: {
        averageSpeed: {
          download: Math.round((speedData.avgDownload || 0) * 10) / 10,
          upload: Math.round((speedData.avgUpload || 0) * 10) / 10,
          latency: Math.round((speedData.avgLatency || 0) * 10) / 10
        },
        totalSpeedTests: speedData.totalTests || 0,
        networksWithSpeedTests: (speedData.networkCount || []).length
      },
      traffic: {
        totalDataTransfer: {
          downloadGB: Math.round((usageData.totalDownloadBytes || 0) / (1024 * 1024 * 1024) * 100) / 100,
          uploadGB: Math.round((usageData.totalUploadBytes || 0) / (1024 * 1024 * 1024) * 100) / 100,
          totalGB: Math.round(((usageData.totalDownloadBytes || 0) + (usageData.totalUploadBytes || 0)) / (1024 * 1024 * 1024) * 100) / 100
        },
        totalUsers: usageData.totalUsers || 0,
        deviceBreakdown: {
          mobile: usageData.totalMobile || 0,
          desktop: usageData.totalDesktop || 0,
          tablet: usageData.totalTablet || 0,
          unknown: usageData.totalUnknown || 0
        }
      },
      trends: {
        hourly: hourlyTrends.map(trend => ({
          hour: trend._id.hour,
          date: trend._id.date,
          activeUsers: Math.round(trend.avgActiveUsers || 0),
          cpu: Math.round((trend.avgCPU || 0) * 10) / 10,
          memory: Math.round((trend.avgMemory || 0) * 10) / 10,
          temperature: Math.round((trend.maxTemp || 0) * 10) / 10
        }))
      },
      networkBreakdown,
      hourlyActivityTrends,
      metadata: {
        dataRange: {
          from: oneHourAgo.toISOString(),
          to: now.toISOString(),
          trendsFrom: last24Hours.toISOString()
        },
        lastUpdated: now.toISOString(),
        onlineNetworks: Array.from(onlineNetworkIds),
        totalDataPoints: systemMetricsAgg.reduce((sum, n) => sum + (n.sampleCount || 0), 0)
      }
    };

    return Response.json(globalDashboardData);

  } catch (error) {
    console.error('Error fetching global dashboard data:', error);
    let errorMessage: string | undefined = undefined;
    if (process.env.NODE_ENV === 'development' && error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message?: string }).message;
    }
    return Response.json(
      {
        error: 'Failed to fetch global dashboard data',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}