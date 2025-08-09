import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/server/db/mongoDB";
import DataUsageSnapshotModel from "@/app/server/models/DataUsageSnapshot.model";
import SessionAnalyticsModel from "@/app/server/models/SessionAnalytics.model";
import SpeedTestHistoryModel from "@/app/server/models/SpeedTestHistory.model";
import SystemMetricsModel from "@/app/server/models/SystemMetrics.model";
import NetworkConfigModel from "@/app/server/models/NetworkConfig.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { networkId: string } }
) {
  try {
    await connectToDatabase();
    
    const { networkId } = await params;
    
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 300000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get network config and latest data
    const [
      networkConfig,
      latestMetrics,
      recentSpeedTests,
      latestDataUsage,
      latestSessionAnalytics
    ] = await Promise.all([
      NetworkConfigModel.findOne({ networkId }).lean().exec() as Promise<{
        networkId: string;
        ssid: string;
        location: { city: string; region: string };
        image?: string;
        lastSeen?: Date;
      } | null>,
      
      SystemMetricsModel.findOne({
        networkId,
        // timestamp: { $gte: fiveMinutesAgo }
      }).sort({ timestamp: -1 }),

      SpeedTestHistoryModel.find({
        networkId,
        // timestamp: { $gte: fiveMinutesAgo }
      }).sort({ timestamp: -1 }).limit(10),

      DataUsageSnapshotModel.findOne({
        networkId,
        // timestamp: { $gte: fiveMinutesAgo }
      }).sort({ timestamp: -1 }),

      SessionAnalyticsModel.findOne({
        networkId,
        // timestamp: { $gte: fiveMinutesAgo }
      }).sort({ timestamp: -1 })
    ]);

    if (!networkConfig) {
      return NextResponse.json(
        { error: 'Network not found' }, 
        { status: 404 }
      );
    }

    // Determine network status
    const isOnline = !!latestMetrics;
    
    // Calculate current average speed
    const averageSpeed = recentSpeedTests.length > 0 ? {
      download: Math.round((recentSpeedTests.reduce((sum, test) => sum + test.downloadMbps, 0) / recentSpeedTests.length) * 10) / 10,
      upload: Math.round((recentSpeedTests.reduce((sum, test) => sum + test.uploadMbps, 0) / recentSpeedTests.length) * 10) / 10,
      latency: Math.round((recentSpeedTests.reduce((sum, test) => sum + test.latencyMs, 0) / recentSpeedTests.length) * 10) / 10
    } : { download: 0, upload: 0, latency: 0 };

    // Generate alerts
    const alerts = [];
    if (latestMetrics) {
      if (latestMetrics.cpuUsage > 80) alerts.push({ type: 'warning', message: 'High CPU usage', value: `${latestMetrics.cpuUsage.toFixed(1)}%` });
      if (latestMetrics.memoryUsage > 90) alerts.push({ type: 'critical', message: 'Critical memory usage', value: `${latestMetrics.memoryUsage.toFixed(1)}%` });
      if (latestMetrics.temperature > 70) alerts.push({ type: 'warning', message: 'High temperature', value: `${latestMetrics.temperature.toFixed(1)}°C` });
      if (latestMetrics.diskUsage > 85) alerts.push({ type: 'warning', message: 'Low disk space', value: `${latestMetrics.diskUsage.toFixed(1)}%` });
    }

    if (!isOnline) {
      alerts.push({ type: 'critical', message: 'Network appears offline' });
    }

    // Calculate the hourly trends for the last 24 hours
    const hourlyTrends = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(last24Hours.getTime() + i * 60 * 60 * 1000);
      const hourStart = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours());
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      const metrics = latestMetrics && latestMetrics.timestamp >= hourStart && latestMetrics.timestamp < hourEnd ? latestMetrics : null;
      return {
        hour: hour.getHours(),
        date: hour.toISOString().split('T')[0],
        activeUsers: metrics ? metrics.activeUsers : 0,
        cpu: metrics ? metrics.cpuUsage : 0,
        memory: metrics ? metrics.memoryUsage : 0,
        downloadSpeed: metrics ? metrics.downloadSpeed : 0,
        uploadSpeed: metrics ? metrics.uploadSpeed : 0,
        temperature: metrics ? metrics.temperature : 0,
      };
    });

    // Build overview response
    const overviewData = {
      networkInfo: {
        networkId: networkConfig.networkId,
        ssid: networkConfig.ssid,
        location: `${networkConfig.location.city}, ${networkConfig.location.region}`,
        status: isOnline ? 'online' : 'offline',
        image: networkConfig.image ? `https://ipfs.io/ipfs/${networkConfig.image}` : null,
        lastSeen: latestMetrics?.timestamp || networkConfig.lastSeen
      },

      overview: {
        totalActiveUsers: latestMetrics?.activeUsers || 0,
        totalSessions: latestSessionAnalytics?.totalSessions || 0,
        activeSessions: latestSessionAnalytics?.activeSessions || 0,
        completedSessions: latestSessionAnalytics?.completedSessions || 0,
        averageSessionDuration: latestSessionAnalytics?.averageSessionDuration || 0,
        systemHealth: {
          cpu: latestMetrics?.cpuUsage || 0,
          memory: latestMetrics?.memoryUsage || 0,
          temperature: latestMetrics?.temperature || 0,
          diskUsage: latestMetrics?.diskUsage || 0
        }
      },

      performance: {
        averageSpeed,
        totalSpeedTests: recentSpeedTests.length,
        peakSpeed: recentSpeedTests.length > 0 ? {
          download: Math.max(...recentSpeedTests.map(t => t.downloadMbps)),
          upload: Math.max(...recentSpeedTests.map(t => t.uploadMbps))
        } : { download: 0, upload: 0 }
      },

      traffic: {
        totalDataTransfer: {
          downloadGB: latestDataUsage ? 
            Math.round((latestDataUsage.totalDownloadBytes / (1024 * 1024 * 1024)) * 100) / 100 : 0,
          uploadGB: latestDataUsage ? 
            Math.round((latestDataUsage.totalUploadBytes / (1024 * 1024 * 1024)) * 100) / 100 : 0,
          totalGB: latestDataUsage ? 
            Math.round(((latestDataUsage.totalDownloadBytes + latestDataUsage.totalUploadBytes) / (1024 * 1024 * 1024)) * 100) / 100 : 0
        },
        totalUsers: latestDataUsage?.totalUsers || 0,
        deviceBreakdown: latestDataUsage?.deviceBreakdown || 
          { mobile: 0, desktop: 0, tablet: 0, unknown: 0 }
      },

      health: {
        status: isOnline ? 'online' : 'offline',
        alerts,
        lastUpdate: latestMetrics?.timestamp || networkConfig.lastSeen,
        dataQuality: {
          hasRecentMetrics: !!latestMetrics,
          hasSpeedTests: recentSpeedTests.length > 0,
          hasDataUsage: !!latestDataUsage,
          hasSessionData: !!latestSessionAnalytics
        }
      },
      trends: {
        hourly: hourlyTrends
      },
      metadata: {
        timestamp: now.toISOString(),
        dataRange: {
          from: fiveMinutesAgo.toISOString(),
          to: now.toISOString(),
          trendsFrom: last24Hours.toISOString()
        },
        lastUpdated: now.toISOString(),
        totalDataPoints: latestMetrics ? 1 : 0
      }
    };

    return NextResponse.json(overviewData);
    
  } catch (error) {
    console.error('Error fetching network overview:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch network overview',
        details: process.env.NODE_ENV === 'development' && error && typeof error === 'object' && 'message' in error ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
}