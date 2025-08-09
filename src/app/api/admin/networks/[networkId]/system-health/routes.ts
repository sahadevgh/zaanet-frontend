import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/server/db/mongoDB";
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
    const oneHourAgo = new Date(now.getTime() - 3600000);

    const [networkConfig, latest, recent] = await Promise.all([
      NetworkConfigModel.findOne({ networkId }).lean(),
      SystemMetricsModel.findOne({ networkId }).sort({ timestamp: -1 }),
      SystemMetricsModel.find({
        networkId,
        timestamp: { $gte: oneHourAgo }
      }).sort({ timestamp: -1 })
    ]);

    if (!networkConfig) {
      return NextResponse.json({ error: 'Network not found' }, { status: 404 });
    }

    if (!latest) {
      return NextResponse.json({
        networkStatus: 'offline',
        systemHealth: {
          cpu: 0,
          memory: 0,
          temperature: 0,
          diskUsage: 0
        },
        connectivity: {
          status: 'offline',
          lastSeen: (networkConfig as any).lastSeen,
          downtime: null
        },
        alerts: [{ type: 'critical', message: 'No system health data available' }],
        uptime: null,
        dataQuality: {
          hasRecentData: false,
          lastDataAge: null,
          totalDataPoints: 0
        }
      });
    }

    // Determine online status
    const isOnline = latest.timestamp >= fiveMinutesAgo;
    const dataAge = Math.round((now.getTime() - new Date(latest.timestamp).getTime()) / 1000);

    // Generate health alerts
    const alerts = [];
    if (!isOnline) {
      alerts.push({ 
        type: 'critical', 
        message: 'Network appears offline', 
        details: `Last seen ${Math.round(dataAge / 60)} minutes ago` 
      });
    } else {
      if (latest.cpuUsage > 80) alerts.push({ 
        type: 'warning', 
        message: 'High CPU usage', 
        value: `${latest.cpuUsage.toFixed(1)}%` 
      });
      if (latest.memoryUsage > 90) alerts.push({ 
        type: 'critical', 
        message: 'Critical memory usage', 
        value: `${latest.memoryUsage.toFixed(1)}%` 
      });
      if (latest.temperature > 70) alerts.push({ 
        type: 'warning', 
        message: 'High temperature', 
        value: `${latest.temperature.toFixed(1)}°C` 
      });
      if (latest.diskUsage > 85) alerts.push({ 
        type: 'warning', 
        message: 'Low disk space', 
        value: `${latest.diskUsage.toFixed(1)}%` 
      });
    }

    // Calculate uptime from first metric
    const firstMetric = recent.length > 0 ? recent[recent.length - 1] : latest;
    const uptimeSeconds = Math.round((latest.timestamp.getTime() - firstMetric.timestamp.getTime()) / 1000);
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

    // Calculate averages for the hour
    const hourlyAverages = recent.length > 0 ? {
      cpu: Math.round((recent.reduce((sum, m) => sum + m.cpuUsage, 0) / recent.length) * 10) / 10,
      memory: Math.round((recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length) * 10) / 10,
      temperature: Math.round((recent.reduce((sum, m) => sum + m.temperature, 0) / recent.length) * 10) / 10,
      diskUsage: Math.round((recent.reduce((sum, m) => sum + m.diskUsage, 0) / recent.length) * 10) / 10,
      activeUsers: Math.round(recent.reduce((sum, m) => sum + (m.activeUsers || 0), 0) / recent.length)
    } : null;

    const response = {
      networkStatus: isOnline ? 'online' : 'offline',
      systemHealth: {
        cpu: Math.round(latest.cpuUsage * 10) / 10,
        memory: Math.round(latest.memoryUsage * 10) / 10,
        temperature: Math.round(latest.temperature * 10) / 10,
        diskUsage: Math.round(latest.diskUsage * 10) / 10,
        activeUsers: latest.activeUsers || 0,
        networkTraffic: latest.networkTraffic || { rxBytes: 0, txBytes: 0 }
      },
      hourlyAverages,
      connectivity: {
        status: isOnline ? 'connected' : 'disconnected',
        lastSeen: latest.timestamp,
        dataAge: dataAge,
        ping: isOnline ? 'responsive' : 'timeout'
      },
      alerts,
      uptime: {
        formatted: `${uptimeHours}h ${uptimeMinutes}m`,
        seconds: uptimeSeconds,
        hours: uptimeHours,
        since: firstMetric.timestamp
      },
      dataQuality: {
        hasRecentData: isOnline,
        lastDataAge: dataAge,
        totalDataPoints: recent.length,
        expectedDataPoints: Math.floor((now.getTime() - oneHourAgo.getTime()) / 30000), // 30s intervals
        coverage: recent.length > 0 ? 
          Math.round((recent.length / Math.floor((now.getTime() - oneHourAgo.getTime()) / 30000)) * 100) : 0
      },
      trends: recent.slice(0, 20).map(metric => ({
        timestamp: metric.timestamp,
        cpu: Math.round(metric.cpuUsage * 10) / 10,
        memory: Math.round(metric.memoryUsage * 10) / 10,
        temperature: Math.round(metric.temperature * 10) / 10,
        activeUsers: metric.activeUsers || 0
      })),
      metadata: {
        networkId,
        timestamp: now.toISOString(),
        collectedAt: latest.collectedAt || latest.timestamp
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json({ error: 'Failed to fetch system health' }, { status: 500 });
  }
}