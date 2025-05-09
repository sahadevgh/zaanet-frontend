import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env');
}

// Declare a global type-safe cache for mongoose connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = (global as typeof global & { _mongoose?: MongooseCache })._mongoose || {
  conn: null,
  promise: null,
};

if (!cached) {
  cached = (global as typeof global & { _mongoose?: MongooseCache })._mongoose = {
    conn: null as typeof mongoose | null,
    promise: null as Promise<typeof mongoose> | null,
  };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI as string, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
