"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Wifi, Key } from "lucide-react";
import type { WifiNetwork } from "@/types";
import CryptoJS from "crypto-js";

interface WifiNetworkCardProps {
  network: WifiNetwork;
  address: string;
  contract: ethers.Contract | null;
  onConnect?: (network: WifiNetwork) => void;
}

const WifiNetworkCard: React.FC<WifiNetworkCardProps> = ({
  network,
  address,
  contract,
  onConnect,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(
    null
  );

  const decryptPassword = React.useCallback(async () => {
    if (!hasPaid) return null;

    try {
      const passwordCID = await contract?.getPasswordCID(network.id);
      if (!passwordCID) throw new Error("Empty CID");

      const response = await fetch(`https://ipfs.io/ipfs/${passwordCID}`);
      if (!response.ok) throw new Error("Failed to fetch password from IPFS");
      const encryptedPassword = await response.text();

      const secretKey = process.env.NEXT_PUBLIC_CRYPTOJS_SECRET_KEY!;
      if (!secretKey) throw new Error("Decryption key not set in environment");

      const decryptedBytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
      const password = decryptedBytes.toString(CryptoJS.enc.Utf8);
      if (!password) throw new Error("Failed to decrypt password");
      return password;
    } catch (err) {
      console.error("Decryption failed:", err);
      return null;
    }
  }, [contract, hasPaid, network.id]);

  useEffect(() => {
    const checkPayment = async () => {
      if (!contract || !address) return;
      try {
        const paid = await contract.hasPaid(network.id, address);
        setHasPaid(paid);
      } catch (err) {
        console.error("Error checking payment:", err);
      }
    };
    checkPayment();
  }, [address, contract, network.id]);

  useEffect(() => {
    const fetchDecryptedPassword = async () => {
      if (!hasPaid) return;
      try {
        const password = await decryptPassword();
        setDecryptedPassword(password ?? null);
      } catch (err) {
        console.error("Failed to decrypt password:", err);
      }
    };
    fetchDecryptedPassword();
  }, [hasPaid, decryptPassword]);

  return (
    <Card className="bg-zaanet-purple-light hover-scale transition-shadow duration-200 cursor-pointer border-zaanet-purple/[0.11] shadow-sm">
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <div className="bg-zaanet-purple/10 rounded-full p-2">
          <Wifi color="#9b87f5" />
        </div>
        <div>
          <CardTitle className="text-lg text-gray-900">
            {network.name}
          </CardTitle>
          <CardDescription className="text-sm text-gray-700">
            {network.location.city}, {network.location.area} (
            {network.location.lat.toFixed(4)}, {network.location.lng.toFixed(4)}
            )
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-700">
            Speed: {network.speed} Mbps
          </span>
          <span className="font-bold text-zaanet-purple text-md">
            {network.price} ETH
          </span>
        </div>

        {hasPaid && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Key className="text-zaanet-purple" size={16} />
            <span>Password: {showPassword ? decryptedPassword : "••••"}</span>
            <Button
              variant="link"
              onClick={() => setShowPassword(!showPassword)}
              className="text-zaanet-purple p-0 h-auto"
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          className="bg-zaanet-purple border-zaanet-purple text-white hover:bg-zaanet-purple hover:text-white mt-2 cursor-pointer"
          onClick={() => onConnect && onConnect(network)}
          aria-label={`Connect to ${network.name}`}
          disabled={hasPaid}
        >
          {hasPaid ? "Connected" : "Connect"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WifiNetworkCard;
