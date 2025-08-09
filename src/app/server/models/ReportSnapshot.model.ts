import mongoose, { Schema, Document } from 'mongoose';

export interface INetworkConfig extends Document {
  networkId: string;
  networkName: string;
  location: {
    country: string;
    region: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  configuration: {
    maxConcurrentUsers: number;
    bandwidthLimitMbps: number;
    sessionTimeoutMinutes: number;
    dataCollectionEnabled: boolean;
    reportingEnabled: boolean;
  };
  hardware: {
    deviceType: 'raspberry-pi-4' | 'raspberry-pi-5' | 'custom';
    specifications?: {
      cpu: string;
      memory: string;
      storage: string;
    };
  };
  contact: {
    ownerName: string;
    ownerEmail: string;
    adminEmails: string[];
  };
  status: 'active' | 'maintenance' | 'offline';
  createdAt: Date;
  lastSeen: Date;
  version: string; // Software version
}

const NetworkConfigSchema = new Schema<INetworkConfig>({
  networkId: { type: String, required: true, unique: true, index: true },
  networkName: { type: String, required: true },
  location: {
    country: { type: String, required: true },
    region: { type: String, required: true },
    city: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  configuration: {
    maxConcurrentUsers: { type: Number, default: 50 },
    bandwidthLimitMbps: { type: Number, default: 100 },
    sessionTimeoutMinutes: { type: Number, default: 60 },
    dataCollectionEnabled: { type: Boolean, default: true },
    reportingEnabled: { type: Boolean, default: true }
  },
  hardware: {
    deviceType: { 
      type: String, 
      enum: ['raspberry-pi-4', 'raspberry-pi-5', 'custom'], 
      default: 'raspberry-pi-4' 
    },
    specifications: {
      cpu: String,
      memory: String,
      storage: String
    }
  },
  contact: {
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    adminEmails: [{ type: String }]
  },
  status: { 
    type: String, 
    enum: ['active', 'maintenance', 'offline'], 
    default: 'active' 
  },
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  version: { type: String, required: true }
}, {
  timestamps: true,
  collection: 'network_configs'
});

// **THIS IS THE KEY CHANGE** - Check if model exists before creating it
const NetworkConfigModel = mongoose.models.NetworkConfig || 
  mongoose.model<INetworkConfig>('NetworkConfig', NetworkConfigSchema);

export default NetworkConfigModel;