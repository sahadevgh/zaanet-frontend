import { connectToDatabase } from '@/app/server/db/mongoDB';
import DataUsageSnapshotModel from '@/app/server/models/DataUsageSnapshot.model';
import SessionAnalyticsModel from '@/app/server/models/SessionAnalytics.model';
import SpeedTestHistoryModel from '@/app/server/models/SpeedTestHistory.model';
import SystemMetricsModel from '@/app/server/models/SystemMetrics.model';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { 
      networks = [], 
      timeRange = '24h', 
      dataTypes = ['metrics', 'sessions', 'usage'],
      format = 'json' 
    } = body;

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

    const networkFilter = networks.length > 0 ? { networkId: { $in: networks } } : {};
    const timeFilter = { timestamp: { $gte: startTime, $lte: now } };
    const filter = { ...networkFilter, ...timeFilter };

    const exportData: any = {
      metadata: {
        exportedAt: now.toISOString(),
        timeRange: { start: startTime, end: now },
        networks: networks.length > 0 ? networks : 'all',
        dataTypes
      }
    };

    // Export system metrics
    if (dataTypes.includes('metrics')) {
      exportData.systemMetrics = await SystemMetricsModel.find(filter)
        .sort({ timestamp: -1 })
        .limit(10000); // Limit for performance
    }

    // Export session analytics
    if (dataTypes.includes('sessions')) {
      exportData.sessionAnalytics = await SessionAnalyticsModel.find(filter)
        .sort({ timestamp: -1 });
    }

    // Export data usage
    if (dataTypes.includes('usage')) {
      exportData.dataUsage = await DataUsageSnapshotModel.find(filter)
        .sort({ timestamp: -1 });
    }

    // Export speed tests
    if (dataTypes.includes('speed')) {
      exportData.speedTests = await SpeedTestHistoryModel.find(filter)
        .sort({ timestamp: -1 })
        .limit(5000); // Limit for performance
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(exportData);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="zaanet-export-${now.toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // JSON format
      return new Response(JSON.stringify(exportData), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="zaanet-export-${now.toISOString().split('T')[0]}.json"`
        }
      });
    }
  } catch (error) {
    console.error('Error exporting global data:', error);
    return Response.json(
      { error: 'Failed to export data' }, 
      { status: 500 }
    );
  }
}

function convertToCSV(data: any): string {
  // Simplified CSV conversion - you might want to use a proper CSV library
  let csv = '';
  
  if (data.systemMetrics) {
    csv += 'System Metrics\n';
    csv += 'networkId,timestamp,cpuUsage,memoryUsage,temperature,activeUsers\n';
    data.systemMetrics.forEach((metric: any) => {
      csv += `${metric.networkId},${metric.timestamp},${metric.cpuUsage},${metric.memoryUsage},${metric.temperature},${metric.activeUsers}\n`;
    });
    csv += '\n';
  }
  
  if (data.sessionAnalytics) {
    csv += 'Session Analytics\n';
    csv += 'networkId,timestamp,totalSessions,activeSessions,completedSessions,totalSpeedTests\n';
    data.sessionAnalytics.forEach((session: any) => {
      csv += `${session.networkId},${session.timestamp},${session.totalSessions},${session.activeSessions},${session.completedSessions},${session.totalSpeedTests}\n`;
    });
    csv += '\n';
  }
  
  if (data.dataUsage) {
    csv += 'Data Usage\n';
    csv += 'networkId,timestamp,totalUsers,totalDownloadBytes,totalUploadBytes,totalBytes\n';
    data.dataUsage.forEach((usage: any) => {
      csv += `${usage.networkId},${usage.timestamp},${usage.totalUsers},${usage.totalDownloadBytes},${usage.totalUploadBytes},${usage.totalBytes}\n`;
    });
    csv += '\n';
  }
  
  if (data.speedTests) {
    csv += 'Speed Tests\n';
    csv += 'networkId,timestamp,downloadMbps,uploadMbps,latencyMs\n';
    data.speedTests.forEach((test: any) => {
      csv += `${test.networkId},${test.timestamp},${test.downloadMbps},${test.uploadMbps},${test.latencyMs}\n`;
    });
    csv += '\n';
  }
  
  return csv;
}