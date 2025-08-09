
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/server/db/mongoDB";
import DataUsageSnapshotModel from "@/app/server/models/DataUsageSnapshot.model";


interface DeviceBreakdown {
      mobile: number;
      desktop: number;
      tablet: number;
      unknown: number;
    }

    interface AverageUsagePerUser {
      downloadBytes: number;
      uploadBytes: number;
    }


    interface Trend {
      timestamp: Date;
      date?: string;
      hour?: number;
      downloadGB: number;
      uploadGB: number;
      totalGB: number;
      users: number;
      deviceBreakdown?: DeviceBreakdown;
    }

    interface TopUser {
      hashedIP: string;
      totalBytes: number;
      totalGB: number;
      downloadBytes: number;
      uploadBytes: number;
      deviceType?: string;
    }

    interface CurrentData {
      totalUsers: number;
      totalDownloadBytes: number;
      totalUploadBytes: number;
      totalBytes: number;
      totalDownloadGB: number;
      totalUploadGB: number;
      totalGB: number;
      averageUsagePerUser: AverageUsagePerUser;
      deviceBreakdown: DeviceBreakdown;
      timestamp?: Date;
    }

    interface HistoricalData {
      totalDownloadGB: number;
      totalUploadGB: number;
      totalGB: number;
      peakUsers: number;
      averageUsers: number;
      trends: Trend[];
    }

    interface Metadata {
      timeRange: string;
      dataPoints: number;
      lastUpdated?: Date;
    }

    interface DataUsageResponse {
      current: CurrentData;
      historical: HistoricalData;
      topUsers: TopUser[];
      metadata: Metadata;
    }

    
export async function GET(
  request: NextRequest,
  { params }: { params: { networkId: string } }
) {
  try {
    await connectToDatabase();
    
    const { networkId } = await params;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    
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
      default:
        startTime.setDate(now.getDate() - 1);
    }

    const [latest, historical] = await Promise.all([
      DataUsageSnapshotModel.findOne({ networkId }).sort({ timestamp: -1 }),
      DataUsageSnapshotModel.find({
        networkId,
        timestamp: { $gte: startTime }
      }).sort({ timestamp: -1 })
    ]);

    if (!latest) {
      return NextResponse.json({
        current: {
          totalUsers: 0,
          totalDownloadBytes: 0,
          totalUploadBytes: 0,
          totalBytes: 0,
          totalDownloadGB: 0,
          totalUploadGB: 0,
          totalGB: 0,
          averageUsagePerUser: { downloadBytes: 0, uploadBytes: 0 },
          deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0, unknown: 0 }
        },
        historical: {
          totalDownloadGB: 0,
          totalUploadGB: 0,
          totalGB: 0,
          peakUsers: 0,
          averageUsers: 0,
          trends: []
        },
        topUsers: []
      });
    }

    // Calculate historical totals
    const historicalTotals = historical.reduce((acc, snapshot) => ({
      downloadBytes: acc.downloadBytes + (snapshot.totalDownloadBytes || 0),
      uploadBytes: acc.uploadBytes + (snapshot.totalUploadBytes || 0),
      totalUsers: Math.max(acc.totalUsers, snapshot.totalUsers || 0),
      userSum: acc.userSum + (snapshot.totalUsers || 0),
      count: acc.count + 1
    }), { downloadBytes: 0, uploadBytes: 0, totalUsers: 0, userSum: 0, count: 0 });

    

    const response: DataUsageResponse = {
      current: {
        totalUsers: latest.totalUsers || 0,
        totalDownloadBytes: latest.totalDownloadBytes || 0,
        totalUploadBytes: latest.totalUploadBytes || 0,
        totalBytes: latest.totalBytes || 0,
        totalDownloadGB: Math.round((latest.totalDownloadBytes || 0) / (1024 * 1024 * 1024) * 100) / 100,
        totalUploadGB: Math.round((latest.totalUploadBytes || 0) / (1024 * 1024 * 1024) * 100) / 100,
        totalGB: Math.round((latest.totalBytes || 0) / (1024 * 1024 * 1024) * 100) / 100,
        averageUsagePerUser: (latest.averageUsagePerUser as AverageUsagePerUser) || { downloadBytes: 0, uploadBytes: 0 },
        deviceBreakdown: (latest.deviceBreakdown as DeviceBreakdown) || { mobile: 0, desktop: 0, tablet: 0, unknown: 0 },
        timestamp: latest.timestamp as Date
      },
      historical: {
        totalDownloadGB: Math.round(historicalTotals.downloadBytes / (1024 * 1024 * 1024) * 100) / 100,
        totalUploadGB: Math.round(historicalTotals.uploadBytes / (1024 * 1024 * 1024) * 100) / 100,
        totalGB: Math.round((historicalTotals.downloadBytes + historicalTotals.uploadBytes) / (1024 * 1024 * 1024) * 100) / 100,
        peakUsers: historicalTotals.totalUsers,
        averageUsers: historicalTotals.count > 0 ? Math.round(historicalTotals.userSum / historicalTotals.count) : 0,
        trends: historical.slice(0, 24).map((snapshot): Trend => ({
          timestamp: snapshot.timestamp as Date,
          date: snapshot.date as string,
          hour: snapshot.hour as number,
          downloadGB: Math.round((snapshot.totalDownloadBytes || 0) / (1024 * 1024 * 1024) * 100) / 100,
          uploadGB: Math.round((snapshot.totalUploadBytes || 0) / (1024 * 1024 * 1024) * 100) / 100,
          totalGB: Math.round((snapshot.totalBytes || 0) / (1024 * 1024 * 1024) * 100) / 100,
          users: snapshot.totalUsers || 0,
          deviceBreakdown: snapshot.deviceBreakdown as DeviceBreakdown
        }))
      },
      topUsers: (latest.topUsers as TopUser[])?.map((user: any): TopUser => ({
        hashedIP: user.hashedIP as string,
        totalBytes: user.totalBytes as number,
        totalGB: Math.round((user.totalBytes as number) / (1024 * 1024 * 1024) * 100) / 100,
        downloadBytes: user.downloadBytes as number,
        uploadBytes: user.uploadBytes as number,
        deviceType: user.deviceType as string
      })) || [],
      metadata: {
        timeRange: timeRange as string,
        dataPoints: historical.length,
        lastUpdated: latest.timestamp as Date
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching data usage:', error);
    return NextResponse.json({ error: 'Failed to fetch data usage' }, { status: 500 });
  }
}