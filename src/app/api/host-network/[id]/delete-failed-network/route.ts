import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/server/db/mongoDB';
import NetworkConfigModel from '@/app/server/models/NetworkConfig.model';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id } = await params; // Await params to resolve dynamic route parameter

    if (!id) {
      console.error('No ID provided for deletion');
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await NetworkConfigModel.findByIdAndDelete(id).lean();
    if (!result) {
      console.error(`No document found with _id: ${id}`);
      return NextResponse.json({ error: 'Network configuration not found' }, { status: 404 });
    }

    console.log(`Successfully deleted NetworkConfig with _id: ${id}`);
    return NextResponse.json({ message: 'Network configuration deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting network configuration:', {
      error: error instanceof Error ? error.message : String(error),
      id: (await params).id,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ error: 'Failed to delete network configuration' }, { status: 500 });
  }
}
