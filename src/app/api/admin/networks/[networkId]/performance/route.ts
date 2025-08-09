import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/server/db/mongoDB";
import SpeedTestHistoryModel from "@/app/server/models/SpeedTestHistory.model";
import SystemMetricsModel from "@/app/server/models/SystemMetrics.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { networkId: string } }
) {
  try {
    await connectToDatabase();
    
    const { networkId } = await params;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '1h';
    
    // Calculate time range
    const now = new Date();
    let startTime = new Date();
    
    switch (timeRange) {
      case '15m':
        startTime.setMinutes(now.getMinutes() - 15);
        break;
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '6h':
        startTime.setHours(now.getHours() - 6);
        break;
      case '24h':
        startTime.setDate(now.getDate() - 1);
        break;
      default:
        startTime.setHours(now.getHours() - 1);
    }

    const [speedTests, systemMetrics] = await Promise.all([
      SpeedTestHistoryModel.find({
        networkId,
        timestamp: { $gte: startTime }
      }).sort({ timestamp: 1 }),

      SystemMetricsModel.find({
        networkId,
        timestamp: { $gte: startTime }
      }).sort({ timestamp: 1 })
    ]);

    // Process speed test data
    const speedData = speedTests.map(test => ({
      timestamp: test.timestamp.toISOString(),
      download: Math.round(test.downloadMbps * 10) / 10,
      upload: Math.round(test.uploadMbps * 10) / 10,
      latency: Math.round(test.latencyMs * 10) / 10,
      deviceType: test.deviceInfo?.deviceType || 'unknown',
      concurrentUsers: test.concurrentUsers || 0
    }));

    // Process system metrics data
    const systemData = systemMetrics.map(metric => ({
      timestamp: metric.timestamp.toISOString(),
      cpu: Math.round(metric.cpuUsage * 10) / 10,
      memory: Math.round(metric.memoryUsage * 10) / 10,
      temperature: Math.round(metric.temperature * 10) / 10,
      diskUsage: Math.round(metric.diskUsage * 10) / 10,
      activeUsers: metric.activeUsers || 0,
      networkTraffic: {
        rxBytes: metric.networkTraffic?.rxBytes || 0,
        txBytes: metric.networkTraffic?.txBytes || 0
      }
    }));

    // Calculate averages and peaks
    const averageSpeed = speedTests.length > 0 ? {
      download: Math.round((speedTests.reduce((sum, test) => sum + test.downloadMbps, 0) / speedTests.length) * 10) / 10,
      upload: Math.round((speedTests.reduce((sum, test) => sum + test.uploadMbps, 0) / speedTests.length) * 10) / 10,
      latency: Math.round((speedTests.reduce((sum, test) => sum + test.latencyMs, 0) / speedTests.length) * 10) / 10
    } : { download: 0, upload: 0, latency: 0 };

    const peakSpeed = speedTests.length > 0 ? {
      download: Math.max(...speedTests.map(t => t.downloadMbps)),
      upload: Math.max(...speedTests.map(t => t.uploadMbps)),
      minLatency: Math.min(...speedTests.map(t => t.latencyMs))
    } : { download: 0, upload: 0, minLatency: 0 };

    const systemAverages = systemMetrics.length > 0 ? {
      cpu: Math.round((systemMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / systemMetrics.length) * 10) / 10,
      memory: Math.round((systemMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / systemMetrics.length) * 10) / 10,
      temperature: Math.round((systemMetrics.reduce((sum, m) => sum + m.temperature, 0) / systemMetrics.length) * 10) / 10,
      diskUsage: Math.round((systemMetrics.reduce((sum, m) => sum + m.diskUsage, 0) / systemMetrics.length) * 10) / 10,
      activeUsers: Math.round(systemMetrics.reduce((sum, m) => sum + (m.activeUsers || 0), 0) / systemMetrics.length)
    } : { cpu: 0, memory: 0, temperature: 0, diskUsage: 0, activeUsers: 0 };

    const systemPeaks = systemMetrics.length > 0 ? {
      maxCPU: Math.max(...systemMetrics.map(m => m.cpuUsage)),
      maxMemory: Math.max(...systemMetrics.map(m => m.memoryUsage)),
      maxTemperature: Math.max(...systemMetrics.map(m => m.temperature)),
      maxActiveUsers: Math.max(...systemMetrics.map(m => m.activeUsers || 0))
    } : { maxCPU: 0, maxMemory: 0, maxTemperature: 0, maxActiveUsers: 0 };

    const response = {
      speedPerformance: {
        current: averageSpeed,
        peak: peakSpeed,
        totalTests: speedTests.length,
        data: speedData
      },
      systemPerformance: {
        current: systemAverages,
        peak: systemPeaks,
        totalDataPoints: systemMetrics.length,
        data: systemData
      },
      summary: {
        averageSpeed,
        peakSpeed,
        systemHealth: systemAverages,
        systemPeaks,
        performance: speedTests.length > 0 && systemMetrics.length > 0 ? 'good' : 
                    speedTests.length === 0 && systemMetrics.length === 0 ? 'no-data' : 'limited-data'
      },
      metadata: {
        timeRange,
        dataRange: {
          start: startTime.toISOString(),
          end: now.toISOString()
        },
        speedTestCount: speedTests.length,
        systemMetricsCount: systemMetrics.length,
        lastUpdated: now.toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
  }
}