import { connectToDatabase } from '@/app/server/db/mongoDB';
import NetworkConfigModel from '@/app/server/models/NetworkConfig.model';
import SystemMetricsModel from '@/app/server/models/SystemMetrics.model';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();

    const networks = await NetworkConfigModel.find({})
      .sort({ createdAt: -1 });


    // Get latest system metrics for each network
    const dbIds = networks.map(n => n._id);
    const latestMetrics = await SystemMetricsModel.aggregate([
      { $match: { dbId: { $in: dbIds } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$dbId',
          latestMetric: { $first: '$$ROOT' }
        }
      }
    ]);

    const metricsMap = new Map(latestMetrics.map(m => [m._id, m.latestMetric]));

    const networksWithMetrics = networks.map((network) => {
      const metrics = metricsMap.get(network.networkId);
      return {
        ...network,
        image: network.image ? `https://ipfs.io/ipfs/${network.image}` : "",
        metrics: metrics
          ? {
            activeUsers: metrics.activeUsers || 0,
            totalSessions: metrics.totalSessions || 0,
            systemHealth: {
              cpu: metrics.cpuUsage || 0,
              memory: metrics.memoryUsage || 0,
              temperature: metrics.temperature || 0,
              diskUsage: metrics.diskUsage || 0,
            },
            averageSpeed: {
              download: metrics.downloadSpeed || 0,
              upload: metrics.uploadSpeed || 0,
            },
            totalDataTransfer: {
              downloadGB: metrics.downloadGB || 0,
              uploadGB: metrics.uploadGB || 0,
            },
            timestamp: metrics.timestamp,
          }
          : null,
      };
    });

    // Prepare response
    if (!networksWithMetrics || networksWithMetrics.length === 0) {
      console.warn('No hosted networks found');
      return NextResponse.json({ message: 'No hosted networks found' }, { status: 404 });
    }

    const networkData = networksWithMetrics.map((network) => ({
      networkId: network._doc.networkId,
      ssid: network._doc.ssid,
      location: network._doc.location,
      status: network._doc.status,
      image: network.image,
      metrics: network.metrics ? {
        activeUsers: network.metrics.activeUsers || 0,
        totalSessions: network.metrics.totalSessions || 0,
        systemHealth: {
          cpu: network.metrics.systemHealth.cpu || 0,
          memory: network.metrics.systemHealth.memory || 0,
          temperature: network.metrics.systemHealth.temperature || 0,
          diskUsage: network.metrics.systemHealth.diskUsage || 0,
        },
        averageSpeed: {
          download: network.metrics.averageSpeed.download || 0,
          upload: network.metrics.averageSpeed.upload || 0,
        },
        totalDataTransfer: {
          downloadGB: network.metrics.totalDataTransfer.downloadGB || 0,
          uploadGB: network.metrics.totalDataTransfer.uploadGB || 0,
        },
        timestamp: network.metrics.timestamp,
      } : null,
    }));

    return NextResponse.json(networkData, { status: 200 });

  } catch (error) {
    console.error('Error fetching networks:', error);
    return Response.json(
      { error: 'Failed to fetch networks' },
      { status: 500 }
    );
  }
}