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

    // Get all active networks
    const activeNetworks = await NetworkConfigModel.find({ 
      status: 'offline' 
    });

    // Aggregate data across all networks
    const [globalMetrics, globalSpeedTests, globalDataUsage, globalSessions] = await Promise.all([
      SystemMetricsModel.aggregate([
        { $match: { timestamp: { $gte: oneHourAgo } } },
        { $group: {
          _id: '$_id',
          latestMetric: { $last: '$$ROOT' },
          avgCPU: { $avg: '$cpuUsage' },
          avgMemory: { $avg: '$memoryUsage' },
          maxTemp: { $max: '$temperature' },
          totalActiveUsers: { $sum: '$activeUsers' }
        }}
      ]),

      SpeedTestHistoryModel.aggregate([
        { $match: { timestamp: { $gte: oneHourAgo } } },
        { $group: {
          _id: null,
          avgDownload: { $avg: '$downloadMbps' },
          avgUpload: { $avg: '$uploadMbps' },
          avgLatency: { $avg: '$latencyMs' },
          totalTests: { $sum: 1 }
        }}
      ]),

      DataUsageSnapshotModel.aggregate([
        { $match: { timestamp: { $gte: oneHourAgo } } },
        { $group: {
          _id: null,
          totalDownloadBytes: { $sum: '$totalDownloadBytes' },
          totalUploadBytes: { $sum: '$totalUploadBytes' },
          totalUsers: { $sum: '$totalUsers' }
        }}
      ]),

      SessionAnalyticsModel.aggregate([
        { $match: { timestamp: { $gte: oneHourAgo } } },
        { $group: {
          _id: null,
          totalSessions: { $sum: '$totalSessions' },
          activeSessions: { $sum: '$activeSessions' },
          completedSessions: { $sum: '$completedSessions' },
          totalSpeedTests: { $sum: '$totalSpeedTests' }
        }}
      ])
    ]);

    const speedData = globalSpeedTests[0] || {};
    const usageData = globalDataUsage[0] || {};
    const sessionData = globalSessions[0] || {};

    const globalDashboardData = {
      networks: {
        total: activeNetworks.length,
        active: globalMetrics.length,
        online: globalMetrics.filter(n => n.latestMetric).length
      },
      overview: {
        totalActiveUsers: globalMetrics.reduce((sum, n) => sum + (n.totalActiveUsers || 0), 0),
        totalSessions: sessionData.totalSessions || 0,
        activeSessions: sessionData.activeSessions || 0,
        completedSessions: sessionData.completedSessions || 0,
        systemHealth: {
          cpu: globalMetrics.length > 0 ? 
            globalMetrics.reduce((sum, n) => sum + (n.avgCPU || 0), 0) / globalMetrics.length : 0,
          memory: globalMetrics.length > 0 ? 
            globalMetrics.reduce((sum, n) => sum + (n.avgMemory || 0), 0) / globalMetrics.length : 0,
          temperature: Math.max(...globalMetrics.map(n => n.maxTemp || 0), 0),
          diskUsage: 0 // Add disk usage calculation if available
        }
      },
      performance: {
        averageSpeed: {
          download: speedData.avgDownload || 0,
          upload: speedData.avgUpload || 0,
          latency: speedData.avgLatency || 0
        },
        totalSpeedTests: speedData.totalTests || 0
      },
      traffic: {
        totalDataTransfer: {
          downloadGB: (usageData.totalDownloadBytes || 0) / (1024 * 1024 * 1024),
          uploadGB: (usageData.totalUploadBytes || 0) / (1024 * 1024 * 1024)
        }
      },
      dataUsage: {
        totalDownloadGB: (usageData.totalDownloadBytes || 0) / (1024 * 1024 * 1024),
        totalUploadGB: (usageData.totalUploadBytes || 0) / (1024 * 1024 * 1024),
        totalUsers: usageData.totalUsers || 0
      },
      networkBreakdown: globalMetrics.map(network => ({
        networkId: network._id,
        activeUsers: network.totalActiveUsers || 0,
        avgCPU: network.avgCPU || 0,
        avgMemory: network.avgMemory || 0,
        maxTemp: network.maxTemp || 0,
        status: network.latestMetric ? 'online' : 'offline'
      })),
      timestamp: now.toISOString()
    };

    return Response.json(globalDashboardData);
  } catch (error) {
    console.error('Error fetching global dashboard data:', error);
    return Response.json(
      { error: 'Failed to fetch global dashboard data' }, 
      { status: 500 }
    );
  }
}