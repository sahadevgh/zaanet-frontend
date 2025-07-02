import mongoose, { Schema, Document } from 'mongoose';

export interface INetworkConfig extends Document {
  networkId: string;
  ssid: string;
  host: string; 
  price: number; 
  description: string; 
  image: string;
  ratingCount?: number; 
  totalRating?: number; // Total rating score
  successfulSessions?: number; // Number of successful sessions
  location: {
    country: string;
    region: string;
    city: string;
    area?: string; 
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
    contact: {
    ownerName: string;
    ownerEmail: string;
    adminEmails: string[];
  };
    hardware: {
    deviceType: 'raspberry-pi-4' | 'raspberry-pi-5' | 'custom';
    specifications?: {
      cpu: string;
      memory: string;
      storage: string;
    };
  };
  status: 'active' | 'maintenance' | 'offline';
  createdAt: Date;
  lastSeen: Date;
}

const NetworkConfigSchema = new Schema<INetworkConfig>({
  networkId: { type: String, required: true },
  ssid: { type: String, required: true },
  host: { type: String, required: true }, // Host address for the network
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String },
  ratingCount: { type: Number, default: 0 },
  totalRating: { type: Number, default: 0 }, // Total rating score
  successfulSessions: { type: Number, default: 0 }, // Number of successful sessions
  location: {
    country: { type: String, required: true },
    region: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
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
    default: 'offline'
  },
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: 'network_configs'
});

// Check if model exists before creating it
const NetworkConfigModel = mongoose.models.NetworkConfig || 
  mongoose.model<INetworkConfig>('NetworkConfig', NetworkConfigSchema);

export default NetworkConfigModel;