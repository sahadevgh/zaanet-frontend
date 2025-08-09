import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/server/db/mongoDB";
import DataUsageSnapshotModel from "@/app/server/models/DataUsageSnapshot.model";
import ReportSnapshotModel from "@/app/server/models/ReportSnapshot.model";
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'hourly';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let timeRange;
    if (startDate && endDate) {
      timeRange = {
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      };
    } else {
      // Default to last hour for hourly, last day for daily
      const now = new Date();
      if (type === 'daily') {
        timeRange = {
          start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          end: now
        };
      } else {
        timeRange = {
          start: new Date(now.getTime() - 60 * 60 * 1000),
          end: now
        };
      }
    }

    // Find existing report or generate new one
    let report = await ReportSnapshotModel.findOne({
      networkId,
      reportType: type,
      'timeRange.start': timeRange.start,
      'timeRange.end': timeRange.end
    });

    if (!report) {
      // Generate new report by aggregating data
      const [systemMetrics, speedTests, dataSnapshots, sessionAnalytics] = await Promise.all([
        SystemMetricsModel.find({
          networkId,
          timestamp: { $gte: timeRange.start, $lte: timeRange.end }
        }),
        SpeedTestHistoryModel.find({
          networkId,
          timestamp: { $gte: timeRange.start, $lte: timeRange.end }
        }),
        DataUsageSnapshotModel.find({
          networkId,
          timestamp: { $gte: timeRange.start, $lte: timeRange.end }
        }),
        SessionAnalyticsModel.find({
          networkId,
          timestamp: { $gte: timeRange.start, $lte: timeRange.end }
        })
      ]);

      // Calculate aggregated metrics
      const avgCPU = systemMetrics.length > 0 ?
        systemMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / systemMetrics.length : 0;
      const avgMemory = systemMetrics.length > 0 ?
        systemMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / systemMetrics.length : 0;
      const maxTemp = systemMetrics.length > 0 ?
        Math.max(...systemMetrics.map(m => m.temperature)) : 0;

      const avgDownloadSpeed = speedTests.length > 0 ?
        speedTests.reduce((sum, s) => sum + s.downloadMbps, 0) / speedTests.length : 0;
      const avgUploadSpeed = speedTests.length > 0 ?
        speedTests.reduce((sum, s) => sum + s.uploadMbps, 0) / speedTests.length : 0;

      const totalSessions = sessionAnalytics.reduce((sum, s) => sum + s.totalSessions, 0);
      const activeSessions = sessionAnalytics.length > 0 ?
        sessionAnalytics[sessionAnalytics.length - 1].activeSessions : 0;

      const generatedReport = {
        summary: {
          totalSessions,
          activeSessions,
          completedSessions: sessionAnalytics.reduce((sum, s) => sum + s.completedSessions, 0),
          testDuration: Math.floor((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60)),
          peakConcurrentUsers: Math.max(...systemMetrics.map(m => m.activeUsers), 0)
        },
        performance: {
          averageSpeed: { download: avgDownloadSpeed, upload: avgUploadSpeed },
          peakSpeed: {
            download: speedTests.length > 0 ? Math.max(...speedTests.map(s => s.downloadMbps)) : 0,
            upload: speedTests.length > 0 ? Math.max(...speedTests.map(s => s.uploadMbps)) : 0
          },
          systemHealth: {
            averageCPU: avgCPU,
            averageMemory: avgMemory,
            maxTemperature: maxTemp,
            averageDiskUsage: systemMetrics.length > 0 ?
              systemMetrics.reduce((sum, m) => sum + m.diskUsage, 0) / systemMetrics.length : 0
          }
        }
      };
      return NextResponse.json(generatedReport);
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}