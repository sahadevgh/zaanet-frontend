import mongoose from 'mongoose';

    const SessionSchema = new mongoose.Schema({
        sessionId: { type: String, required: true, unique: true },
        networkId: { type: String, required: true },
        guest: { type: String, required: true },
        token: { type: String, required: true },
        duration: { type: Number, required: true }, // In hours
        startTime: { type: Date, default: null },
        active: { type: Boolean, default: false },
        status: {
          type: String,
          enum: ['pending', 'active', 'expired'],
          default: 'pending',
        },
        ips: { type: [String], default: [] },
      }, { timestamps: true });

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
