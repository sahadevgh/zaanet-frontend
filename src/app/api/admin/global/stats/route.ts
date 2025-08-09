import { connectToDatabase } from '@/app/server/db/mongoDB';
import DataUsageSnapshotModel from '@/app/server/models/DataUsageSnapshot.model';
import SessionAnalyticsModel from '@/app/server/models/SessionAnalytics.model';
import SpeedTestHistoryModel from '@/app/server/models/SpeedTestHistory.model';
import SystemMetricsModel from '@/app/server/models/SystemMetrics.model';
import NetworkConfigModel from '@/app/server/models/NetworkConfig.model';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const networkId = searchParams.get('networkId'); // Optional network filter
    
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
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
      default:
        startTime.setDate(now.getDate() - 1);
    }

    // Build match condition
    const matchCondition: any = { timestamp: { $gte: startTime } };
    if (networkId) {
      matchCondition.networkId = networkId;
    }

    // Get network information for context
    const networkFilter = networkId ? { networkId } : {};
    const networks = await NetworkConfigModel.find(networkFilter).lean();
    const networkMap = new Map(networks.map(n => [n.networkId, n]));

    const [systemStats, speedStats, usageStats, sessionStats, timeSeriesData] = await Promise.all([
      // System performance across all networks => Aggregated metrics
      SystemMetricsModel.aggregate([
        { $match: matchCondition },
        { 
          $group: {
            _id: '$networkId',
            avgCPU: { $avg: '$cpuUsage' },
            maxCPU: { $max: '$cpuUsage' },
            minCPU: { $min: '$cpuUsage' },
            avgMemory: { $avg: '$memoryUsage' },
            maxMemory: { $max: '$memoryUsage' },
            minMemory: { $min: '$memoryUsage' },
            avgTemp: { $avg: '$temperature' },
            maxTemp: { $max: '$temperature' },
            minTemp: { $min: '$temperature' },
            avgDisk: { $avg: '$diskUsage' },
            maxDisk: { $max: '$diskUsage' },
            avgActiveUsers: { $avg: '$activeUsers' },
            maxActiveUsers: { $max: '$activeUsers' },
            totalActiveUsers: { $sum: '$activeUsers' },
            dataPoints: { $sum: 1 },
            firstSeen: { $min: '$timestamp' },
            lastSeen: { $max: '$timestamp' },
            avgNetworkTraffic: {
              $avg: { $add: ['$networkTraffic.rxBytes', '$networkTraffic.txBytes'] }
            }
          }
        }
      ]),

      // Speed test performance with better aggregation
      SpeedTestHistoryModel.aggregate([
        { $match: matchCondition },
        { 
          $group: {
            _id: {
              networkId: '$networkId',
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              hour: { $hour: '$timestamp' }
            },
            avgDownload: { $avg: '$downloadMbps' },
            maxDownload: { $max: '$downloadMbps' },
            minDownload: { $min: '$downloadMbps' },
            avgUpload: { $avg: '$uploadMbps' },
            maxUpload: { $max: '$uploadMbps' },
            minUpload: { $min: '$uploadMbps' },
            avgLatency: { $avg: '$latencyMs' },
            maxLatency: { $max: '$latencyMs' },
            minLatency: { $min: '$latencyMs' },
            testCount: { $sum: 1 },
            deviceTypes: { $push: '$deviceInfo.deviceType' },
            concurrentUsers: { $avg: '$concurrentUsers' }
          }
        },
        { 
          $group: {
            _id: '$_id.networkId',
            timeSeriesPerformance: {
              $push: {
                date: '$_id.date',
                hour: '$_id.hour',
                avgDownload: '$avgDownload',
                maxDownload: '$maxDownload',
                avgUpload: '$avgUpload',
                maxUpload: '$maxUpload',
                avgLatency: '$avgLatency',
                testCount: '$testCount',
                concurrentUsers: '$concurrentUsers'
              }
            },
            overallAvgDownload: { $avg: '$avgDownload' },
            overallMaxDownload: { $max: '$maxDownload' },
            overallAvgUpload: { $avg: '$avgUpload' },
            overallMaxUpload: { $max: '$maxUpload' },
            overallAvgLatency: { $avg: '$avgLatency' },
            totalTests: { $sum: '$testCount' },
            avgConcurrentUsers: { $avg: '$concurrentUsers' }
          }
        }
      ]),

      // Data usage trends with better time grouping
      DataUsageSnapshotModel.aggregate([
        { $match: matchCondition },
        { 
          $group: {
            _id: {
              networkId: '$networkId',
              date: '$date'
            },
            totalDownloadBytes: { $sum: '$totalDownloadBytes' },
            totalUploadBytes: { $sum: '$totalUploadBytes' },
            totalBytes: { $sum: '$totalBytes' },
            avgUsers: { $avg: '$totalUsers' },
            maxUsers: { $max: '$totalUsers' },
            deviceBreakdown: {
              $push: '$deviceBreakdown'
            },
            dataPoints: { $sum: 1 }
          }
        },
        { 
          $group: {
            _id: '$_id.networkId',
            dailyUsage: {
              $push: {
                date: '$_id.date',
                downloadGB: { $divide: ['$totalDownloadBytes', 1073741824] },
                uploadGB: { $divide: ['$totalUploadBytes', 1073741824] },
                totalGB: { $divide: ['$totalBytes', 1073741824] },
                avgUsers: '$avgUsers',
                maxUsers: '$maxUsers',
                dataPoints: '$dataPoints'
              }
            },
            totalDownloadBytes: { $sum: '$totalDownloadBytes' },
            totalUploadBytes: { $sum: '$totalUploadBytes' },
            totalBytes: { $sum: '$totalBytes' },
            avgDailyUsers: { $avg: '$avgUsers' },
            maxDailyUsers: { $max: '$maxUsers' }
          }
        }
      ]),

      // Session analytics with comprehensive metrics
      SessionAnalyticsModel.aggregate([
        { $match: matchCondition },
        { 
          $group: {
            _id: '$networkId',
            totalSessions: { $sum: '$totalSessions' },
            activeSessions: { $sum: '$activeSessions' },
            completedSessions: { $sum: '$completedSessions' },
            avgDuration: { $avg: '$averageDuration' },
            maxDuration: { $max: '$averageDuration' },
            totalSpeedTests: { $sum: '$totalSpeedTests' },
            totalDownloadGB: { $sum: '$totalDataTransfer.downloadGB' },
            totalUploadGB: { $sum: '$totalDataTransfer.uploadGB' },
            deviceBreakdown: { $push: '$deviceBreakdown' },
            qualityMetrics: { $push: '$qualityMetrics' },
            dataPoints: { $sum: 1 }
          }
        }
      ]),

      // Time series data for charts
      SystemMetricsModel.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              hour: { $hour: '$timestamp' }
            },
            avgCPU: { $avg: '$cpuUsage' },
            avgMemory: { $avg: '$memoryUsage' },
            avgTemp: { $avg: '$temperature' },
            totalActiveUsers: { $sum: '$activeUsers' },
            networkCount: { $addToSet: '$networkId' }
          }
        },
        { $sort: { '_id.date': 1, '_id.hour': 1 } }
      ])
    ]);

    // Process device breakdown globally
    const globalDeviceBreakdown = sessionStats.reduce((acc, network) => {
      network.deviceBreakdown.forEach((breakdown: any) => {
        acc.mobile += breakdown.mobile || 0;
        acc.desktop += breakdown.desktop || 0;
        acc.tablet += breakdown.tablet || 0;
        acc.unknown += breakdown.unknown || 0;
      });
      return acc;
    }, { mobile: 0, desktop: 0, tablet: 0, unknown: 0 });

    // Calculate quality metrics
    const globalQualityMetrics = sessionStats.reduce((acc, network) => {
      network.qualityMetrics.forEach((quality: any) => {
        acc.totalCompletionRate += quality.averageCompletionRate || 0;
        acc.totalSpeedTestsPerSession += quality.averageSpeedTestsPerSession || 0;
        acc.totalDataPerSession += quality.averageDataPerSession || 0;
        acc.count += 1;
      });
      return acc;
    }, { totalCompletionRate: 0, totalSpeedTestsPerSession: 0, totalDataPerSession: 0, count: 0 });

    // Build comprehensive response
    const globalStats = {
      timeRange,
      period: { 
        start: startTime.toISOString(), 
        end: now.toISOString(),
        durationHours: Math.round((now.getTime() - startTime.getTime()) / (1000 * 60 * 60))
      },
      filter: networkId ? { networkId } : { scope: 'global' },
      
      summary: {
        totalNetworks: systemStats.length,
        networksWithData: {
          systemMetrics: systemStats.length,
          speedTests: speedStats.length,
          dataUsage: usageStats.length,
          sessionAnalytics: sessionStats.length
        },
        totalSessions: sessionStats.reduce((sum, n) => sum + (n.totalSessions || 0), 0),
        activeSessions: sessionStats.reduce((sum, n) => sum + (n.activeSessions || 0), 0),
        completedSessions: sessionStats.reduce((sum, n) => sum + (n.completedSessions || 0), 0),
        completionRate: sessionStats.length > 0 ? 
          (sessionStats.reduce((sum, n) => sum + (n.completedSessions || 0), 0) / 
           sessionStats.reduce((sum, n) => sum + (n.totalSessions || 0), 0) * 100) : 0,
        totalSpeedTests: sessionStats.reduce((sum, n) => sum + (n.totalSpeedTests || 0), 0),
        totalDataGB: Math.round((usageStats.reduce((sum, n) => sum + (n.totalBytes || 0), 0) / (1024 * 1024 * 1024)) * 100) / 100,
        totalActiveUsers: systemStats.reduce((sum, n) => sum + (n.totalActiveUsers || 0), 0),
        avgActiveUsers: systemStats.length > 0 ? 
          Math.round(systemStats.reduce((sum, n) => sum + (n.avgActiveUsers || 0), 0) / systemStats.length) : 0
      },

      performance: {
        system: {
          cpu: {
            average: systemStats.length > 0 ? 
              Math.round((systemStats.reduce((sum, n) => sum + (n.avgCPU || 0), 0) / systemStats.length) * 10) / 10 : 0,
            maximum: Math.max(...systemStats.map(n => n.maxCPU || 0), 0),
            minimum: systemStats.length > 0 ? Math.min(...systemStats.map(n => n.minCPU || 100), 100) : 0
          },
          memory: {
            average: systemStats.length > 0 ? 
              Math.round((systemStats.reduce((sum, n) => sum + (n.avgMemory || 0), 0) / systemStats.length) * 10) / 10 : 0,
            maximum: Math.max(...systemStats.map(n => n.maxMemory || 0), 0),
            minimum: systemStats.length > 0 ? Math.min(...systemStats.map(n => n.minMemory || 100), 100) : 0
          },
          temperature: {
            average: systemStats.length > 0 ? 
              Math.round((systemStats.reduce((sum, n) => sum + (n.avgTemp || 0), 0) / systemStats.length) * 10) / 10 : 0,
            maximum: Math.max(...systemStats.map(n => n.maxTemp || 0), 0),
            minimum: systemStats.length > 0 ? Math.min(...systemStats.map(n => n.minTemp || 100), 100) : 0
          },
          disk: {
            average: systemStats.length > 0 ? 
              Math.round((systemStats.reduce((sum, n) => sum + (n.avgDisk || 0), 0) / systemStats.length) * 10) / 10 : 0,
            maximum: Math.max(...systemStats.map(n => n.maxDisk || 0), 0)
          }
        },
        network: {
          globalAverage: {
            download: speedStats.length > 0 ? 
              Math.round((speedStats.reduce((sum, n) => sum + (n.overallAvgDownload || 0), 0) / speedStats.length) * 10) / 10 : 0,
            upload: speedStats.length > 0 ? 
              Math.round((speedStats.reduce((sum, n) => sum + (n.overallAvgUpload || 0), 0) / speedStats.length) * 10) / 10 : 0,
            latency: speedStats.length > 0 ? 
              Math.round((speedStats.reduce((sum, n) => sum + (n.overallAvgLatency || 0), 0) / speedStats.length) * 10) / 10 : 0
          },
          peakPerformance: {
            maxDownload: Math.max(...speedStats.map(n => n.overallMaxDownload || 0), 0),
            maxUpload: Math.max(...speedStats.map(n => n.overallMaxUpload || 0), 0)
          },
          totalTests: speedStats.reduce((sum, n) => sum + (n.totalTests || 0), 0)
        }
      },

      usage: {
        global: {
          totalDownloadGB: Math.round((usageStats.reduce((sum, n) => sum + (n.totalDownloadBytes || 0), 0) / (1024 * 1024 * 1024)) * 100) / 100,
          totalUploadGB: Math.round((usageStats.reduce((sum, n) => sum + (n.totalUploadBytes || 0), 0) / (1024 * 1024 * 1024)) * 100) / 100,
          totalGB: Math.round((usageStats.reduce((sum, n) => sum + (n.totalBytes || 0), 0) / (1024 * 1024 * 1024)) * 100) / 100,
          avgDailyUsers: usageStats.length > 0 ? 
            Math.round(usageStats.reduce((sum, n) => sum + (n.avgDailyUsers || 0), 0) / usageStats.length) : 0,
          maxDailyUsers: Math.max(...usageStats.map(n => n.maxDailyUsers || 0), 0)
        },
        networkBreakdown: usageStats.map(network => {
          const networkInfo = networkMap.get(network._id);
          return {
            networkId: network._id,
            networkName: networkInfo?.ssid || 'Unknown',
            location: networkInfo?.location ? `${networkInfo.location.city}, ${networkInfo.location.region}` : 'Unknown',
            downloadGB: Math.round((network.totalDownloadBytes / (1024 * 1024 * 1024)) * 100) / 100,
            uploadGB: Math.round((network.totalUploadBytes / (1024 * 1024 * 1024)) * 100) / 100,
            totalGB: Math.round((network.totalBytes / (1024 * 1024 * 1024)) * 100) / 100,
            avgDailyUsers: Math.round(network.avgDailyUsers || 0),
            maxDailyUsers: network.maxDailyUsers || 0,
            dailyTrends: network.dailyUsage || []
          };
        })
      },

      devices: {
        breakdown: globalDeviceBreakdown,
        total: (Object.values(globalDeviceBreakdown) as number[]).reduce((sum, count) => sum + count, 0),
        percentages: {
          mobile: globalDeviceBreakdown.mobile > 0 ? 
            Math.round((globalDeviceBreakdown.mobile / (Object.values(globalDeviceBreakdown) as number[]).reduce((sum, count) => sum + count, 0)) * 100) : 0,
          desktop: globalDeviceBreakdown.desktop > 0 ? 
            Math.round((globalDeviceBreakdown.desktop / (Object.values(globalDeviceBreakdown) as number[]).reduce((sum: number, count: number) => sum + count, 0)) * 100) : 0,
          tablet: globalDeviceBreakdown.tablet > 0 ? 
            Math.round((globalDeviceBreakdown.tablet / (Object.values(globalDeviceBreakdown) as number[]).reduce((sum, count) => sum + count, 0)) * 100) : 0,
          unknown: globalDeviceBreakdown.unknown > 0 ? 
            Math.round((globalDeviceBreakdown.unknown / (Object.values(globalDeviceBreakdown) as number[]).reduce((sum, count) => sum + count, 0)) * 100) : 0
        }
      },

      quality: {
        averageCompletionRate: globalQualityMetrics.count > 0 ? 
          Math.round((globalQualityMetrics.totalCompletionRate / globalQualityMetrics.count) * 10) / 10 : 0,
        averageSpeedTestsPerSession: globalQualityMetrics.count > 0 ? 
          Math.round((globalQualityMetrics.totalSpeedTestsPerSession / globalQualityMetrics.count) * 10) / 10 : 0,
        averageDataPerSession: globalQualityMetrics.count > 0 ? 
          Math.round((globalQualityMetrics.totalDataPerSession / globalQualityMetrics.count) * 100) / 100 : 0
      },

      trends: {
        timeSeries: timeSeriesData.map(point => ({
          date: point._id.date,
          hour: point._id.hour,
          avgCPU: Math.round((point.avgCPU || 0) * 10) / 10,
          avgMemory: Math.round((point.avgMemory || 0) * 10) / 10,
          avgTemp: Math.round((point.avgTemp || 0) * 10) / 10,
          totalActiveUsers: point.totalActiveUsers || 0,
          activeNetworks: (point.networkCount || []).length
        }))
      },

      networkDetails: systemStats.map(network => {
        const networkInfo = networkMap.get(network._id);
        const speedInfo = speedStats.find(s => s._id === network._id);
        const usageInfo = usageStats.find(u => u._id === network._id);
        const sessionInfo = sessionStats.find(s => s._id === network._id);

        return {
          networkId: network._id,
          networkName: networkInfo?.ssid || 'Unknown',
          location: networkInfo?.location ? `${networkInfo.location.city}, ${networkInfo.location.region}` : 'Unknown',
          status: networkInfo?.status || 'unknown',
          system: {
            avgCPU: Math.round((network.avgCPU || 0) * 10) / 10,
            maxCPU: network.maxCPU || 0,
            avgMemory: Math.round((network.avgMemory || 0) * 10) / 10,
            maxMemory: network.maxMemory || 0,
            avgTemp: Math.round((network.avgTemp || 0) * 10) / 10,
            maxTemp: network.maxTemp || 0,
            avgActiveUsers: Math.round(network.avgActiveUsers || 0),
            maxActiveUsers: network.maxActiveUsers || 0,
            dataPoints: network.dataPoints || 0,
            uptime: {
              firstSeen: network.firstSeen,
              lastSeen: network.lastSeen,
              durationHours: network.firstSeen && network.lastSeen ? 
                Math.round((new Date(network.lastSeen).getTime() - new Date(network.firstSeen).getTime()) / (1000 * 60 * 60)) : 0
            }
          },
          performance: speedInfo ? {
            avgDownload: Math.round((speedInfo.overallAvgDownload || 0) * 10) / 10,
            maxDownload: speedInfo.overallMaxDownload || 0,
            avgUpload: Math.round((speedInfo.overallAvgUpload || 0) * 10) / 10,
            maxUpload: speedInfo.overallMaxUpload || 0,
            avgLatency: Math.round((speedInfo.overallAvgLatency || 0) * 10) / 10,
            totalTests: speedInfo.totalTests || 0,
            avgConcurrentUsers: Math.round(speedInfo.avgConcurrentUsers || 0)
          } : null,
          usage: usageInfo ? {
            totalGB: Math.round((usageInfo.totalBytes / (1024 * 1024 * 1024)) * 100) / 100,
            downloadGB: Math.round((usageInfo.totalDownloadBytes / (1024 * 1024 * 1024)) * 100) / 100,
            uploadGB: Math.round((usageInfo.totalUploadBytes / (1024 * 1024 * 1024)) * 100) / 100,
            avgDailyUsers: Math.round(usageInfo.avgDailyUsers || 0),
            maxDailyUsers: usageInfo.maxDailyUsers || 0
          } : null,
          sessions: sessionInfo ? {
            total: sessionInfo.totalSessions || 0,
            active: sessionInfo.activeSessions || 0,
            completed: sessionInfo.completedSessions || 0,
            avgDuration: Math.round(sessionInfo.avgDuration || 0),
            maxDuration: Math.round(sessionInfo.maxDuration || 0),
            speedTests: sessionInfo.totalSpeedTests || 0
          } : null
        };
      }),

      metadata: {
        generatedAt: now.toISOString(),
        dataRange: {
          start: startTime.toISOString(),
          end: now.toISOString(),
          duration: `${Math.round((now.getTime() - startTime.getTime()) / (1000 * 60 * 60))} hours`
        },
        dataQuality: {
          totalDataPoints: systemStats.reduce((sum, n) => sum + (n.dataPoints || 0), 0),
          networksWithCompleteData: systemStats.filter(n => 
            speedStats.some(s => s._id === n._id) && 
            usageStats.some(u => u._id === n._id) && 
            sessionStats.some(s => s._id === n._id)
          ).length
        }
      }
    };

    return Response.json(globalStats);
    
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return Response.json(
      { 
        error: 'Failed to fetch global statistics',
        details: process.env.NODE_ENV === 'development' && error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : undefined
      }, 
      { status: 500 }
    );
  }
}