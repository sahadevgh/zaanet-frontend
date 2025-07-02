import { connectToDatabase } from '@/app/server/db/mongoDB';
import DataUsageSnapshotModel from '@/app/server/models/DataUsageSnapshot.model';
import SessionAnalyticsModel from '@/app/server/models/SessionAnalytics.model';
import SpeedTestHistoryModel from '@/app/server/models/SpeedTestHistory.model';
import SystemMetricsModel from '@/app/server/models/SystemMetrics.model';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    
    // Calculate time range
    const now = new Date();
    let startTime = new Date();
    
    switch (timeRange) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '6h':
        startTime.setHours(now.getHours() - 6);
        break;
      case '24h':
        startTime.setDate(now.getDate() - 1);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      default:
        startTime.setDate(now.getDate() - 1);
    }

    const [systemStats, speedStats, usageStats, sessionStats] = await Promise.all([
      // System performance across all networks
      SystemMetricsModel.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        { $group: {
          _id: '$networkId',
          avgCPU: { $avg: '$cpuUsage' },
          maxCPU: { $max: '$cpuUsage' },
          avgMemory: { $avg: '$memoryUsage' },
          maxMemory: { $max: '$memoryUsage' },
          avgTemp: { $avg: '$temperature' },
          maxTemp: { $max: '$temperature' },
          totalActiveUsers: { $sum: '$activeUsers' },
          dataPoints: { $sum: 1 }
        }}
      ]),

      // Speed test performance
      SpeedTestHistoryModel.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        { $group: {
          _id: {
            networkId: '$networkId',
            hour: { $hour: '$timestamp' }
          },
          avgDownload: { $avg: '$downloadMbps' },
          avgUpload: { $avg: '$uploadMbps' },
          avgLatency: { $avg: '$latencyMs' },
          testCount: { $sum: 1 }
        }},
        { $group: {
          _id: '$_id.networkId',
          hourlyPerformance: {
            $push: {
              hour: '$_id.hour',
              avgDownload: '$avgDownload',
              avgUpload: '$avgUpload',
              avgLatency: '$avgLatency',
              testCount: '$testCount'
            }
          },
          overallAvgDownload: { $avg: '$avgDownload' },
          overallAvgUpload: { $avg: '$avgUpload' },
          totalTests: { $sum: '$testCount' }
        }}
      ]),

      // Data usage trends
      DataUsageSnapshotModel.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        { $group: {
          _id: {
            networkId: '$networkId',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          totalDownloadGB: { $sum: { $divide: ['$totalDownloadBytes', 1073741824] } },
          totalUploadGB: { $sum: { $divide: ['$totalUploadBytes', 1073741824] } },
          avgUsers: { $avg: '$totalUsers' },
          maxUsers: { $max: '$totalUsers' }
        }},
        { $group: {
          _id: '$_id.networkId',
          dailyUsage: {
            $push: {
              date: '$_id.date',
              downloadGB: '$totalDownloadGB',
              uploadGB: '$totalUploadGB',
              avgUsers: '$avgUsers',
              maxUsers: '$maxUsers'
            }
          },
          totalDownloadGB: { $sum: '$totalDownloadGB' },
          totalUploadGB: { $sum: '$totalUploadGB' }
        }}
      ]),

      // Session analytics
      SessionAnalyticsModel.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        { $group: {
          _id: '$networkId',
          totalSessions: { $sum: '$totalSessions' },
          completedSessions: { $sum: '$completedSessions' },
          avgDuration: { $avg: '$averageDuration' },
          totalSpeedTests: { $sum: '$totalSpeedTests' },
          deviceBreakdown: {
            $push: '$deviceBreakdown'
          }
        }}
      ])
    ]);

    // Aggregate device breakdown across all networks
    const globalDeviceBreakdown = sessionStats.reduce((acc, network) => {
      network.deviceBreakdown.forEach((breakdown: any) => {
        acc.mobile += breakdown.mobile || 0;
        acc.desktop += breakdown.desktop || 0;
        acc.tablet += breakdown.tablet || 0;
        acc.unknown += breakdown.unknown || 0;
      });
      return acc;
    }, { mobile: 0, desktop: 0, tablet: 0, unknown: 0 });

    const globalStats = {
      timeRange,
      period: { start: startTime, end: now },
      summary: {
        totalNetworks: systemStats.length,
        totalSessions: sessionStats.reduce((sum, n) => sum + (n.totalSessions || 0), 0),
        completedSessions: sessionStats.reduce((sum, n) => sum + (n.completedSessions || 0), 0),
        totalSpeedTests: sessionStats.reduce((sum, n) => sum + (n.totalSpeedTests || 0), 0),
        totalDataGB: usageStats.reduce((sum, n) => sum + (n.totalDownloadGB || 0) + (n.totalUploadGB || 0), 0)
      },
      performance: {
        avgCPU: systemStats.length > 0 ? 
          systemStats.reduce((sum, n) => sum + (n.avgCPU || 0), 0) / systemStats.length : 0,
        maxCPU: Math.max(...systemStats.map(n => n.maxCPU || 0), 0),
        avgMemory: systemStats.length > 0 ? 
          systemStats.reduce((sum, n) => sum + (n.avgMemory || 0), 0) / systemStats.length : 0,
        maxMemory: Math.max(...systemStats.map(n => n.maxMemory || 0), 0),
        avgTemperature: systemStats.length > 0 ? 
          systemStats.reduce((sum, n) => sum + (n.avgTemp || 0), 0) / systemStats.length : 0,
        maxTemperature: Math.max(...systemStats.map(n => n.maxTemp || 0), 0)
      },
      speed: {
        globalAverage: {
          download: speedStats.length > 0 ? 
            speedStats.reduce((sum, n) => sum + (n.overallAvgDownload || 0), 0) / speedStats.length : 0,
          upload: speedStats.length > 0 ? 
            speedStats.reduce((sum, n) => sum + (n.overallAvgUpload || 0), 0) / speedStats.length : 0
        },
        networkBreakdown: speedStats.map(network => ({
          networkId: network._id,
          avgDownload: network.overallAvgDownload || 0,
          avgUpload: network.overallAvgUpload || 0,
          totalTests: network.totalTests || 0,
          hourlyPerformance: network.hourlyPerformance || []
        }))
      },
      usage: {
        totalDownloadGB: usageStats.reduce((sum, n) => sum + (n.totalDownloadGB || 0), 0),
        totalUploadGB: usageStats.reduce((sum, n) => sum + (n.totalUploadGB || 0), 0),
        networkBreakdown: usageStats.map(network => ({
          networkId: network._id,
          downloadGB: network.totalDownloadGB || 0,
          uploadGB: network.totalUploadGB || 0,
          dailyUsage: network.dailyUsage || []
        }))
      },
      devices: globalDeviceBreakdown,
      networkPerformance: systemStats.map(network => ({
        networkId: network._id,
        avgCPU: network.avgCPU || 0,
        maxCPU: network.maxCPU || 0,
        avgMemory: network.avgMemory || 0,
        maxMemory: network.maxMemory || 0,
        avgTemp: network.avgTemp || 0,
        maxTemp: network.maxTemp || 0,
        totalActiveUsers: network.totalActiveUsers || 0,
        dataPoints: network.dataPoints || 0
      }))
    };

    return Response.json(globalStats);
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return Response.json(
      { error: 'Failed to fetch global statistics' }, 
      { status: 500 }
    );
  }
}