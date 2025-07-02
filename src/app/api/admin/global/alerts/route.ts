import { connectToDatabase } from '@/app/server/db/mongoDB';
import NetworkConfigModel from '@/app/server/models/NetworkConfig.model';
import SystemMetricsModel from '@/app/server/models/SystemMetrics.model';

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    // Get recent system metrics that exceed thresholds
    const criticalMetrics = await SystemMetricsModel.find({
      timestamp: { $gte: oneHourAgo },
      $or: [
        { cpuUsage: { $gt: 85 } },
        { memoryUsage: { $gt: 90 } },
        { temperature: { $gt: 70 } },
        { diskUsage: { $gt: 85 } }
      ]
    }).sort({ timestamp: -1 });

    // Check for networks that haven't reported recently
    const activeNetworks = await NetworkConfigModel.find({ status: 'active' });
    const recentReports = await SystemMetricsModel.distinct('networkId', {
      timestamp: { $gte: new Date(now.getTime() - 300000) } // 5 minutes
    });

    const offlineNetworks = activeNetworks.filter(
      network => !recentReports.includes(network.networkId)
    );

    // Categorize alerts
    const alerts = {
      critical: criticalMetrics.filter(m => 
        m.cpuUsage > 90 || m.memoryUsage > 95 || m.temperature > 80
      ).map(metric => ({
        type: 'system_critical',
        networkId: metric.networkId,
        message: `Critical system alert: CPU: ${metric.cpuUsage}%, Memory: ${metric.memoryUsage}%, Temp: ${metric.temperature}°C`,
        timestamp: metric.timestamp,
        severity: 'critical'
      })),
      
      warning: criticalMetrics.filter(m => 
        (m.cpuUsage > 85 && m.cpuUsage <= 90) ||
        (m.memoryUsage > 90 && m.memoryUsage <= 95) ||
        (m.temperature > 70 && m.temperature <= 80)
      ).map(metric => ({
        type: 'system_warning',
        networkId: metric.networkId,
        message: `System warning: CPU: ${metric.cpuUsage}%, Memory: ${metric.memoryUsage}%, Temp: ${metric.temperature}°C`,
        timestamp: metric.timestamp,
        severity: 'warning'
      })),
      
      offline: offlineNetworks.map(network => ({
        type: 'network_offline',
        networkId: network.networkId,
        message: `Network ${network.networkName} has not reported in the last 5 minutes`,
        timestamp: network.lastSeen,
        severity: 'critical'
      }))
    };

    const summary = {
      total: alerts.critical.length + alerts.warning.length + alerts.offline.length,
      critical: alerts.critical.length,
      warning: alerts.warning.length,
      offline: alerts.offline.length
    };

    return Response.json({
      alerts,
      summary,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Error fetching global alerts:', error);
    return Response.json(
      { error: 'Failed to fetch alerts' }, 
      { status: 500 }
    );
  }
}