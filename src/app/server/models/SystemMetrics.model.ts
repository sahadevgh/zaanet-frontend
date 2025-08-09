import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemMetrics extends Document {
  networkId: string; // Unique identifier for each hosted network
  timestamp: Date;
  activeUsers: number;
  cpuUsage: number;
  memoryUsage: number;
  temperature: number;
  networkTraffic: {
    rxBytes: number;
    txBytes: number;
  };
  diskUsage: number;
  source: 'pi' | 'admin'; // Track which server collected this
  collectedAt: Date;
}

const SystemMetricsSchema = new Schema<ISystemMetrics>({
  networkId: { type: String, required: true },
  timestamp: { type: Date, required: true, index: true },
  activeUsers: { type: Number, required: true, default: 0 },
  cpuUsage: { type: Number, required: true, default: 0 },
  memoryUsage: { type: Number, required: true, default: 0 },
  temperature: { type: Number, required: true, default: 0 },
  networkTraffic: {
    rxBytes: { type: Number, default: 0 },
    txBytes: { type: Number, default: 0 }
  },
  diskUsage: { type: Number, required: true, default: 0 },
  source: { type: String, enum: ['pi', 'admin'], default: 'pi' },
  collectedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'system_metrics'
});

// Index for efficient network-specific and time-based queries
SystemMetricsSchema.index({ networkId: 1, timestamp: -1 });
SystemMetricsSchema.index({ networkId: 1, collectedAt: -1 });
SystemMetricsSchema.index({ networkId: 1, source: 1, timestamp: -1 });

// Check if model exists before creating it
const SystemMetricsModel = mongoose.models.SystemMetrics || 
  mongoose.model<ISystemMetrics>('SystemMetrics', SystemMetricsSchema);

export default SystemMetricsModel;