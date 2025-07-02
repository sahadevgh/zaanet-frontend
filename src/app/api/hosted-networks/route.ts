import { connectToDatabase } from "@/app/server/db/mongoDB";
import NetworkConfigModel from "@/app/server/models/NetworkConfig.model";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const networks = await NetworkConfigModel.find({
      status: { $ne: "offline" } // Exclude offline networks
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!networks || networks.length === 0) {
      console.warn("No hosted networks found");
      return NextResponse.json({ message: "No hosted networks found" }, { status: 404 });
    }

    // Convert raw IPFS CID to gateway URL
    const networksWithImage = networks.map((network) => ({
      ...network,
      image: network.image ? `https://ipfs.io/ipfs/${network.image}` : "",
    }));

    return NextResponse.json(networksWithImage, { status: 200 });
  } catch (error) {
    console.error("Error fetching networks:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ message: "Error fetching networks" }, { status: 500 });
  }
}