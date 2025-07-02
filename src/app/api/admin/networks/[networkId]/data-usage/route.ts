import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/server/db/mongoDB";
import DataUsageSnapshotModel from "@/app/server/models/DataUsageSnapshot.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { networkId: string } }
) {
  try {
    await connectToDatabase();
    
    const { networkId } = await params;
    const latest = await DataUsageSnapshotModel.findOne({ networkId })
      .sort({ timestamp: -1 });

    if (!latest) {
      return NextResponse.json({
        error: 'No data usage found'
      }, { status: 404 });
    }

    return NextResponse.json({
      totalUsers: latest.totalUsers,
      totalDownloadBytes: latest.totalDownloadBytes,
      totalUploadBytes: latest.totalUploadBytes,
      totalBytes: latest.totalBytes,
      averageUsagePerUser: latest.averageUsagePerUser,
      heaviestUsers: latest.topUsers
    });
  } catch (error) {
    console.error('Error fetching data usage:', error);
    return NextResponse.json({ error: 'Failed to fetch data usage' }, { status: 500 });
  }
}