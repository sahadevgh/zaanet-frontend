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
    const oneHourAgo = new Date(Date.now() - 3600000);

    const [speedTests, systemMetrics] = await Promise.all([
      SpeedTestHistoryModel.find({
        networkId,
        timestamp: { $gte: oneHourAgo }
      }).sort({ timestamp: 1 }),

      SystemMetricsModel.find({
        networkId,
        timestamp: { $gte: oneHourAgo }
      }).sort({ timestamp: 1 })
    ]);

    const speedData = speedTests.map(test => ({
      timestamp: test.timestamp.toISOString(),
      download: test.downloadMbps,
      upload: test.uploadMbps
    }));

    const systemData = systemMetrics.map(metric => ({
      timestamp: metric.timestamp.toISOString(),
      cpu: metric.cpuUsage,
      memory: metric.memoryUsage,
      temperature: metric.temperature
    }));

    const averageSpeed = speedTests.length > 0 ? {
      download: speedTests.reduce((sum, test) => sum + test.downloadMbps, 0) / speedTests.length,
      upload: speedTests.reduce((sum, test) => sum + test.uploadMbps, 0) / speedTests.length
    } : { download: 0, upload: 0 };

    return NextResponse.json({
      speedData,
      systemMetrics: systemData,
      averageSpeed
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
  }
}