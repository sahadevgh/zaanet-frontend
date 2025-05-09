import mongoose from 'mongoose';

const MetadataSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true }
});

export default mongoose.models.Metadata || mongoose.model('Metadata', MetadataSchema);
