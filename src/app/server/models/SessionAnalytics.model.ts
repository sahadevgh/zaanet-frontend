import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionAnalytics extends Document {
  networkId: string; // Unique identifier for each hosted network
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  timestamp: Date;
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  averageDuration: number; // in seconds
  totalSpeedTests: number;
  totalDataTransfer: {
    downloadGB: number;
    uploadGB: number;
    totalGB?: number; 
  };
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
    unknown: number;
  };
  hourlyActivity: Array<{
    hour: number;
    sessions: number;
    averageSpeed: { download: number; upload: number };
  }>;
  qualityMetrics: {
    averageCompletionRate: number;
    averageSpeedTestsPerSession: number;
    averageDataPerSession: number;
  };
}

const SessionAnalyticsSchema = new Schema<ISessionAnalytics>({
  networkId: { type: String, index: true },
  date: { type: String, index: true },
  hour: { type: Number, min: 0, max: 23 },
  timestamp: { type: Date, index: true },
  totalSessions: { type: Number, default: 0 },
  activeSessions: { type: Number, default: 0 },
  completedSessions: { type: Number, default: 0 },
  averageDuration: { type: Number, default: 0 },
  totalSpeedTests: { type: Number, default: 0 },
  totalDataTransfer: {
    downloadGB: { type: Number, default: 0 },
    uploadGB: { type: Number, default: 0 },
    totalGB: { type: Number, default: 0 }
  },
  deviceBreakdown: {
    mobile: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
    unknown: { type: Number, default: 0 }
  },
  hourlyActivity: [{
    hour: { type: Number, required: true },
    sessions: { type: Number, default: 0 },
    averageSpeed: {
      download: { type: Number, default: 0 },
      upload: { type: Number, default: 0 },
      totalGB: { type: Number, default: 0 }
    }
  }],
  qualityMetrics: {
    averageCompletionRate: { type: Number, default: 0 },
    averageSpeedTestsPerSession: { type: Number, default: 0 },
    averageDataPerSession: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  collection: 'session_analytics'
});

SessionAnalyticsSchema.index({ networkId: 1, date: -1, hour: -1 });
SessionAnalyticsSchema.index({ networkId: 1, timestamp: -1 });

// Check if model exists before creating it**
const SessionAnalyticsModel = mongoose.models.SessionAnalytics || 
  mongoose.model<ISessionAnalytics>('SessionAnalytics', SessionAnalyticsSchema);

export default SessionAnalyticsModel;