import { connectToDatabase } from "@/app/server/db/mongoDB";
import { NextResponse } from "next/server";
import { UserInfoModel } from "@/app/server/models/userInfo.model";

export async function POST(request: Request) {
  const { userInfo } = await request.json();

  let { email, name, walletAddress } = userInfo;

  // Basic validation
  if (!name || !walletAddress) {
    return NextResponse.json(
      { error: "Name and wallet address are required" },
      { status: 400 }
    );
  }

  // Normalize wallet address
  walletAddress = walletAddress.toLowerCase();

  try {
    await connectToDatabase();

    // Use wallet address for uniqueness
    const existingUser = await UserInfoModel.findOne({ walletAddress });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const newUserInfo = new UserInfoModel({
      email: email ?? null,
      name,
      walletAddress,
      createdAt: new Date(),
    });

    await newUserInfo.save();

    return NextResponse.json(
      { message: "User info saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving user info:", error);
    return NextResponse.json(
      { error: "Failed to save user info" },
      { status: 500 }
    );
  }
}
