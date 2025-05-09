import { connectToDatabase } from '@/app/server/db/mongoDB';
import SessionModel from '@/app/server/models/Session.model';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  try {
    const { token, ip } = await request.json();

    interface DecodedToken {
      sessionId: string;
    }

    await connectToDatabase();

    const decoded = jwt.verify(token, SECRET) as DecodedToken;

    const session = await SessionModel.findOne({ sessionId: decoded.sessionId });

    if (!session) {
      return NextResponse.json({ valid: false, error: 'Session not found' }, { status: 404 });
    }

    // If session has not started yet, start now
    if (!session.startTime) {
      const now = new Date();
      await SessionModel.updateOne(
        { sessionId: decoded.sessionId },
        {
          $set: {
            startTime: now,
            active: true,
            status: 'active',
          },
        }
      );
    }

    // Re-fetch session after possible update
    const updated = await SessionModel.findOne({ sessionId: decoded.sessionId });

    // Check expiry
    const expiresAt = new Date(updated!.startTime.getTime() + updated!.duration * 1000);
    if (Date.now() > expiresAt.getTime()) {
      await SessionModel.updateOne(
        { sessionId: decoded.sessionId },
        { $set: { active: false, status: 'expired' } }
      );
      return NextResponse.json({ valid: false, error: 'Session expired' }, { status: 401 });
    }

    // Track IP
    await SessionModel.updateOne(
      { sessionId: decoded.sessionId },
      { $addToSet: { ips: ip } }
    );

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error('Token validation error:', err);
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
}
