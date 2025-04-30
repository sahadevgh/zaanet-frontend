import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db('zaanet');
const sessions = db.collection('sessions');
const SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  const { token, ip } = await request.json();
  try {
    await client.connect();
    
    interface DecodedToken {
      sessionId: string;
      iat?: number;
      exp?: number;
    }
    
    const decoded = jwt.verify(token, SECRET) as DecodedToken;
    const session = await sessions.findOne({ sessionId: decoded.sessionId, active: true });
    if (!session || session.expiry < new Date()) {
      await client.close();
      return NextResponse.json({ valid: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    // Monitor IPs
    await sessions.updateOne(
      { sessionId: decoded.sessionId },
      { $addToSet: { ips: ip } }
    );
    const updatedSession = await sessions.findOne({ sessionId: decoded.sessionId });
    if (updatedSession?.ips.length > 1) {
      console.warn(`Multiple IPs detected for session ${decoded.sessionId}`);
      // Future: Notify Host via dashboard or email
    }

    await client.close();
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error during token validation:', error);
    await client.close();
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
}