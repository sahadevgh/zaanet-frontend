import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db('zaanet');
const sessions = db.collection('sessions');

export async function GET(request: Request, { params }: { params: { sessionId: string } }) {
  const { sessionId } = params;
  try {
    await client.connect();
    const session = await sessions.findOne({ sessionId, active: true });
    await client.close();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    return NextResponse.json({ token: session.token });
  } catch {
    await client.close();
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}