import mongoose, { Schema, Document } from 'mongoose';

export interface ISpeedTestHistory extends Document {
  networkId: string; // Unique identifier for each hosted network
  sessionId: string;
  userIP: string;
  timestamp: Date;
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
  testType: 'auto' | 'manual' | 'periodic';
  concurrentUsers: number;
  deviceInfo: {
    deviceType: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

const SpeedTestHistorySchema = new Schema<ISpeedTestHistory>({
  networkId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  userIP: { type: String, required: true },
  timestamp: { type: Date, required: true, index: true },
  downloadMbps: { type: Number, required: true },
  uploadMbps: { type: Number, required: true },
  latencyMs: { type: Number, required: true },
  testType: { type: String, enum: ['auto', 'manual', 'periodic'], required: true },
  concurrentUsers: { type: Number, required: true },
  deviceInfo: {
    deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet'], required: true },
    os: { type: String, required: true },
    browser: { type: String, required: true }
  },
  location: {
    country: String,
    region: String,
    city: String
  }
}, {
  timestamps: true,
  collection: 'speed_test_history'
});

SpeedTestHistorySchema.index({ networkId: 1, timestamp: -1 });
SpeedTestHistorySchema.index({ networkId: 1, sessionId: 1, timestamp: -1 });
SpeedTestHistorySchema.index({ networkId: 1, testType: 1, timestamp: -1 });

// Check if model exists before creating it**
const SpeedTestHistoryModel = mongoose.models.SpeedTestHistory || 
  mongoose.model<ISpeedTestHistory>('SpeedTestHistory', SpeedTestHistorySchema);

export default SpeedTestHistoryModel;