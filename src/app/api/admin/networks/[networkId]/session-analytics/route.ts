import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/server/db/mongoDB";
import SessionAnalyticsModel from "@/app/server/models/SessionAnalytics.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { networkId: string } }
) {
  try {
    await connectToDatabase();
    
    const { networkId } = await params;

    // Get session analytics for time range
    const sessionAnalytics = await SessionAnalyticsModel.find({
      networkId,
      // timestamp: { $gte: startTime }
    }).sort({ timestamp: -1 });

    if (sessionAnalytics.length === 0) {
      return NextResponse.json({
        total: 0,
        active: 0,
        completed: 0,
        averageDuration: 0,
        totalSpeedTests: 0,
        totalDataTransfer: { downloadGB: 0, uploadGB: 0 },
        deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0, unknown: 0 },
        hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({ hour, sessions: 0, averageSpeed: { download: 0, upload: 0 } })),
        sessionQuality: { completionRate: 0, avgTestsPerSession: 0, avgDataPerSession: 0 },
        trends: []
      });
    }

    // Get the most recent values for cumulative fields instead of summing
    const latest = sessionAnalytics[0]; // Most recent document (already sorted by timestamp DESC)
    
    // For cumulative fields, use the latest snapshot
    const totals = {
      totalSessions: latest.totalSessions || 0,
      activeSessions: latest.activeSessions || 0,
      completedSessions: latest.completedSessions || 0,
      totalSpeedTests: latest.totalSpeedTests || 0,
      totalDownloadGB: latest.totalDataTransfer?.downloadGB || 0,
      totalUploadGB: latest.totalDataTransfer?.uploadGB || 0,
      avgDuration: latest.averageDuration || 0
    };

    // FIXED: Get device breakdown from the most recent document
    const deviceBreakdown = latest.deviceBreakdown || { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };

    // Build hourly activity from latest data
    const hourlyActivity = latest?.hourlyActivity || Array.from({ length: 24 }, (_, hour) => ({ 
      hour, 
      sessions: 0,
      averageSpeed: { download: 0, upload: 0 }
    }));

    // Calculate quality metrics from the most recent document
    const qualityMetrics = latest.qualityMetrics || { 
      averageCompletionRate: 0, 
      averageSpeedTestsPerSession: 0, 
      averageDataPerSession: 0 
    };

    const response = {
      total: totals.totalSessions,
      active: totals.activeSessions,
      completed: totals.completedSessions,
      completionRate: totals.totalSessions > 0 ? Math.round((totals.completedSessions / totals.totalSessions) * 100) : 0,
      averageDuration: totals.avgDuration,
      totalSpeedTests: totals.totalSpeedTests,
      speedTestsPerSession: totals.totalSessions > 0 ? Math.round((totals.totalSpeedTests / totals.totalSessions) * 10) / 10 : 0,
      totalDataTransfer: {
        downloadGB: Math.round(totals.totalDownloadGB * 100) / 100,
        uploadGB: Math.round(totals.totalUploadGB * 100) / 100,
        totalGB: Math.round((totals.totalDownloadGB + totals.totalUploadGB) * 100) / 100
      },
      deviceBreakdown,
      devicePercentages: {
        mobile: deviceBreakdown.mobile > 0 ? Math.round((deviceBreakdown.mobile / (Object.values(deviceBreakdown) as number[]).reduce((sum, count) => sum + count, 0)) * 100) : 0,
        desktop: deviceBreakdown.desktop > 0 ? Math.round((deviceBreakdown.desktop / (Object.values(deviceBreakdown) as number[]).reduce((sum, count) => sum + count, 0)) * 100) : 0,
        tablet: deviceBreakdown.tablet > 0 ? Math.round((deviceBreakdown.tablet / (Object.values(deviceBreakdown) as number[]).reduce((sum, count) => sum + count, 0)) * 100) : 0,
        unknown: deviceBreakdown.unknown > 0 ? Math.round((deviceBreakdown.unknown / (Object.values(deviceBreakdown) as number[]).reduce((sum, count) => sum + count, 0)) * 100) : 0
      },
      hourlyActivity,
      sessionQuality: {
        completionRate: qualityMetrics.averageCompletionRate,
        avgTestsPerSession: qualityMetrics.averageSpeedTestsPerSession,
        avgDataPerSession: qualityMetrics.averageDataPerSession
      },
      trends: sessionAnalytics.slice(0, 20).map(analytics => ({
        timestamp: analytics.timestamp,
        totalSessions: analytics.totalSessions,
        activeSessions: analytics.activeSessions,
        completedSessions: analytics.completedSessions,
        averageDuration: analytics.averageDuration
      })),
      metadata: {
        dataPoints: sessionAnalytics.length,
        lastUpdated: sessionAnalytics[0]?.timestamp || null
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching session analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch session analytics' }, { status: 500 });
  }
}