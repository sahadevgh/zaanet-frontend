import { zaanetNetwork_CA } from '@/app/components/web3/contants/projectData';
import { connectToDatabase } from '@/app/server/db/mongoDB';
import MetadataModel from '@/app/server/models/Metadata.model';
import sessionModel from '@/app/server/models/Session.model';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL);
const contract = new ethers.Contract(
  zaanetNetwork_CA,
  [
    'event SessionStarted(uint256 sessionId, uint256 networkId, address guest, uint256 duration, uint256 amount)'
  ],
  provider
);

const SECRET = process.env.JWT_SECRET!;

export async function GET() {
  try {
    await connectToDatabase();

    const last = await MetadataModel.findOne({ key: 'lastBlock' });
    const fromBlock = last ? last.value + 1 : await provider.getBlockNumber() - 1000;

    const events = await contract.queryFilter('SessionStarted', fromBlock);

    for (const event of events) {
      const { sessionId, networkId, guest, duration } = (event as ethers.EventLog).args;

      const existing = await sessionModel.findOne({ sessionId: sessionId.toString() });
      if (existing) continue;

      // Generate token for session
      const token = jwt.sign(
        {
          sessionId,
          networkId,
          guest
        },
        SECRET
      );

      // Save the new session with a pending state
      await sessionModel.create({
        sessionId: sessionId.toString(),
        networkId: networkId.toString(),
        guest,
        token,
        duration: Number(duration), // store raw session duration
        startTime: null,
        active: false,
        status: 'pending',
        ips: [],
      });
    }

    const latestBlock = await provider.getBlockNumber();
    await MetadataModel.updateOne(
      { key: 'lastBlock' },
      { $set: { value: latestBlock } },
      { upsert: true }
    );

    return NextResponse.json({ status: 'Events synced' });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync events' }, { status: 500 });
  }
}
