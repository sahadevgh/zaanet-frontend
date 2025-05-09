import { connectToDatabase } from '@/app/server/db/mongodb';
import sessionModel from '@/app/server/models/Session.model';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;

  try {
    // Ensure MongoDB connection is available
    await connectToDatabase();

    // Find an active session matching the sessionId
    const session = await sessionModel.findOne({ sessionId, active: true });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ token: session.token });
  } catch (err) {
    console.error('Failed to fetch token:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
