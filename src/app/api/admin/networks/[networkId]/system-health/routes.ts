import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/server/db/mongoDB";
import SystemMetricsModel from "@/app/server/models/SystemMetrics.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { networkId: string } }
) {
  try {
    await connectToDatabase();
    
    const { networkId } = await params;
    const latest = await SystemMetricsModel.findOne({ networkId })
      .sort({ timestamp: -1 });

    if (!latest) {
      return NextResponse.json({ error: 'No system health data found' }, { status: 404 });
    }

    return NextResponse.json({
      systemHealth: {
        cpu: latest.cpuUsage,
        memory: latest.memoryUsage,
        temperature: latest.temperature,
        diskUsage: latest.diskUsage
      },
      networkStatus: 'online',
      uptime: '24h 15m', // Calculate from network start time
      timestamp: latest.timestamp
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json({ error: 'Failed to fetch system health' }, { status: 500 });
  }
}