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
    const latest = await SessionAnalyticsModel.findOne({ networkId })
      .sort({ timestamp: -1 });

    if (!latest) {
      return NextResponse.json({
        total: 0,
        active: 0,
        completed: 0,
        averageDuration: 0,
        totalSpeedTests: 0,
        totalDataTransfer: { downloadGB: 0, uploadGB: 0 },
        deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0, unknown: 0 },
        hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({ hour, sessions: 0 }))
      });
    }

    return NextResponse.json({
      total: latest.totalSessions,
      active: latest.activeSessions,
      completed: latest.completedSessions,
      averageDuration: latest.averageDuration,
      totalSpeedTests: latest.totalSpeedTests,
      totalDataTransfer: latest.totalDataTransfer,
      deviceBreakdown: latest.deviceBreakdown,
      hourlyActivity: latest.hourlyActivity
    });
  } catch (error) {
    console.error('Error fetching session analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch session analytics' }, { status: 500 });
  }
}