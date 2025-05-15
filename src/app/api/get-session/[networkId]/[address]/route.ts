import { connectToDatabase } from '@/app/server/db/mongoDB';
import SessionModel from '@/app/server/models/Session.model';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: any
) {
  const { networkId, address } = params;

  try {
    await connectToDatabase();

    const session = await SessionModel.findOne({
      networkId,
      guest: address.toLowerCase(),
      active: true,
    });

    return NextResponse.json({ active: !!session });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
