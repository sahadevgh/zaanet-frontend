import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db('zaanet');
const sessions = db.collection('sessions');

export async function GET(
  request: Request,
  { params }: { params: { networkId: string; address: string } }
) {
  const { networkId, address } = params;
  try {
    await client.connect();
    const session = await sessions.findOne({
      networkId,
      guest: address.toLowerCase(),
      active: true,
    });
    await client.close();
    return NextResponse.json({ active: !!session });
  } catch (error) {
    console.error('Error fetching session:', error);
    await client.close();
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}