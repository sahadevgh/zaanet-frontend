import mongoose, { Schema, Document } from 'mongoose';

export interface IDataUsageSnapshot extends Document {
  networkId: string; // Unique identifier for each hosted network
  timestamp: Date;
  hour: number; // 0-23 for hourly aggregation
  date: string; // YYYY-MM-DD for daily aggregation
  totalUsers: number;
  totalDownloadBytes: number;
  totalUploadBytes: number;
  totalBytes: number;
  averageUsagePerUser: {
    downloadBytes: number;
    uploadBytes: number;
  };
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
    unknown: number;
  };
  topUsers: Array<{
    hashedIP: string; // Store hashed IP for privacy
    totalBytes: number;
    downloadBytes: number;
    uploadBytes: number;
    deviceType: string;
  }>;
}

const DataUsageSnapshotSchema = new Schema<IDataUsageSnapshot>({
  networkId: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true, index: true },
  hour: { type: Number, required: true, min: 0, max: 23 },
  date: { type: String, required: true, index: true },
  totalUsers: { type: Number, required: true, default: 0 },
  totalDownloadBytes: { type: Number, required: true, default: 0 },
  totalUploadBytes: { type: Number, required: true, default: 0 },
  totalBytes: { type: Number, required: true, default: 0 },
  averageUsagePerUser: {
    downloadBytes: { type: Number, default: 0 },
    uploadBytes: { type: Number, default: 0 }
  },
  deviceBreakdown: {
    mobile: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
    unknown: { type: Number, default: 0 }
  },
  topUsers: [{
    hashedIP: { type: String, required: true },
    totalBytes: { type: Number, required: true },
    downloadBytes: { type: Number, required: true },
    uploadBytes: { type: Number, required: true },
    deviceType: { type: String, required: true }
  }]
}, {
  timestamps: true,
  collection: 'data_usage_snapshots'
});

DataUsageSnapshotSchema.index({ networkId: 1, date: -1, hour: -1 });
DataUsageSnapshotSchema.index({ networkId: 1, timestamp: -1 });

// Check if model exists before creating it**
const DataUsageSnapshotModel = mongoose.models.DataUsageSnapshot || 
  mongoose.model<IDataUsageSnapshot>('DataUsageSnapshot', DataUsageSnapshotSchema);

export default DataUsageSnapshotModel;