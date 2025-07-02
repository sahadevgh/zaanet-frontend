import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/server/db/mongoDB";
import DataUsageSnapshotModel from "@/app/server/models/DataUsageSnapshot.model";
import SessionAnalyticsModel from "@/app/server/models/SessionAnalytics.model";
import SpeedTestHistoryModel from "@/app/server/models/SpeedTestHistory.model";
import SystemMetricsModel from "@/app/server/models/SystemMetrics.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { networkId: string } }
) {
  try {
    await connectToDatabase();
    
    const { networkId } = await params;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    // Get latest metrics for this network
    const [latestMetrics, recentSpeedTests, latestDataUsage, latestSessionAnalytics] = await Promise.all([
      SystemMetricsModel.findOne({
        networkId,
        timestamp: { $gte: oneHourAgo }
      }).sort({ timestamp: -1 }),

      SpeedTestHistoryModel.find({
        networkId,
        timestamp: { $gte: oneHourAgo }
      }).sort({ timestamp: -1 }).limit(10),

      DataUsageSnapshotModel.findOne({
        networkId,
        timestamp: { $gte: oneHourAgo }
      }).sort({ timestamp: -1 }),

      SessionAnalyticsModel.findOne({
        networkId,
        timestamp: { $gte: oneHourAgo }
      }).sort({ timestamp: -1 })
    ]);

    // Calculate average speed from recent tests
    const averageSpeed = recentSpeedTests.length > 0 ? {
      download: recentSpeedTests.reduce((sum, test) => sum + test.downloadMbps, 0) / recentSpeedTests.length,
      upload: recentSpeedTests.reduce((sum, test) => sum + test.uploadMbps, 0) / recentSpeedTests.length
    } : { download: 0, upload: 0 };

    const dashboardData = {
      overview: {
        activeUsers: latestMetrics?.activeUsers || 0,
        totalSessions: latestSessionAnalytics?.totalSessions || 0,
        systemHealth: {
          cpu: latestMetrics?.cpuUsage || 0,
          memory: latestMetrics?.memoryUsage || 0,
          temperature: latestMetrics?.temperature || 0,
          diskUsage: latestMetrics?.diskUsage || 0
        }
      },
      performance: {
        averageSpeed
      },
      traffic: {
        totalDataTransfer: {
          downloadGB: (latestDataUsage?.totalDownloadBytes || 0) / (1024 * 1024 * 1024),
          uploadGB: (latestDataUsage?.totalUploadBytes || 0) / (1024 * 1024 * 1024)
        }
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}