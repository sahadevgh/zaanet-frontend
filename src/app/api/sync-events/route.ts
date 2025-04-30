import { ethers } from 'ethers';
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS!,
  ['event SessionStarted(uint256 sessionId, uint256 networkId, address guest, uint256 duration, uint256 amount, uint256 expiry)'],
  provider
);
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db('zaanet');
const sessions = db.collection('sessions');
const SECRET = process.env.JWT_SECRET!;

export async function GET() {
  try {
    await client.connect();
    const lastBlock = await db.collection('metadata').findOne({ key: 'lastBlock' });
    const fromBlock = lastBlock ? lastBlock.value + 1 : await provider.getBlockNumber() - 1000;
    const events = await contract.queryFilter('SessionStarted', fromBlock);

    for (const event of events) {
      const { sessionId, networkId, guest, duration, expiry } = (event as ethers.EventLog).args;
      const existing = await sessions.findOne({ sessionId: sessionId.toString() });
      if (existing) continue;

      const token = jwt.sign({ sessionId, networkId, guest, expiry: Number(expiry) }, SECRET);
      await sessions.insertOne({
        sessionId: sessionId.toString(),
        networkId: networkId.toString(),
        guest,
        token,
        expiry: new Date(Number(expiry) * 1000),
        active: true,
        ips: [],
      });

      setTimeout(async () => {
        await client.connect();
        await sessions.updateOne({ sessionId: sessionId.toString() }, { $set: { active: false } });
        await client.close();
      }, Number(duration) * 1000);
    }

    await db.collection('metadata').updateOne(
      { key: 'lastBlock' },
      { $set: { value: await provider.getBlockNumber() } },
      { upsert: true }
    );

    await client.close();
    return NextResponse.json({ status: 'Events synced' });
  } catch (error) {
    console.error('Sync error:', error);
    await client.close();
    return NextResponse.json({ error: 'Failed to sync events' }, { status: 500 });
  }
}