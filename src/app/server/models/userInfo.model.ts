import mongoose, { Schema, Document } from "mongoose";
import { Address } from "viem";

// Define the UserInfo interface
export interface UserInfo extends Document {
  email?: string | null;
  phoneNumber?: string | null;
  name?: string | null;
  walletAddress: Address; // required, validated elsewhere as a proper 0x address
  createdAt: Date;
  updatedAt: Date;
}

// Define the UserInfo schema
const userInfoSchema = new Schema<UserInfo>(
    {
      email: {
        type: String,
        trim: true,
        default: null,
      },
      phoneNumber: {
        type: String,
        trim: true,
        default: null,
      },
      name: {
        type: String,
        trim: true,
        default: null,
      },
      walletAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );
  

export const UserInfoModel = mongoose.model<UserInfo>("UserInfo", userInfoSchema);