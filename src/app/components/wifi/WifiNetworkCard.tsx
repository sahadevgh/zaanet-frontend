"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Wifi,
  Key,
  Eye,
  EyeOff,
  MapPin,
  Gauge,
  HardDrive,
  Loader2,
} from "lucide-react";
import type { WifiNetwork } from "@/types";
import CryptoJS from "crypto-js";
import Image from "next/image";

interface WifiNetworkCardProps {
  network: WifiNetwork;
  address: string;
  contract: ethers.Contract | null;
  onConnect?: (network: WifiNetwork) => void;
  stopProcessing: boolean;
}

// Generate a unique gradient based on network ID
const getGradientClass = (id: string) => {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Select from predefined gradient classes
  const gradients = [
    "bg-gradient-to-r from-purple-500 to-pink-500",
    "bg-gradient-to-r from-blue-500 to-cyan-500",
    "bg-gradient-to-r from-green-500 to-teal-500",
    "bg-gradient-to-r from-yellow-500 to-orange-500",
    "bg-gradient-to-r from-red-500 to-pink-500",
    "bg-gradient-to-r from-indigo-500 to-purple-500",
    "bg-gradient-to-r from-emerald-500 to-blue-500",
    "bg-gradient-to-r from-amber-500 to-red-500",
  ];

  return gradients[Math.abs(hash) % gradients.length];
};

const WifiNetworkCard: React.FC<WifiNetworkCardProps> = ({
  network,
  address,
  contract,
  onConnect,
  stopProcessing
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(
    null
  );
  const [isHovered, setIsHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Loading state for password decryption
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Fetch image from IPFS
  useEffect(() => {
    const fetchImage = async () => {
      if (!network.imageCID) {
        setImageLoading(false);
        setImageError(true);
        return;
      }

      try {
        setImageLoading(true);
        const response = await fetch(
          `https://ipfs.io/ipfs/${network.imageCID}`
        );
        if (!response.ok) throw new Error("Failed to fetch image");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setImageError(false);
      } catch (err) {
        console.error("Error loading image:", err);
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [network.imageCID]);

  const decryptPassword = React.useCallback(async () => {
    if (!hasPaid) return null;

    setIsDecrypting(true);
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
    } finally {
      setIsDecrypting(false);
    }
  }, [contract, hasPaid, network.id]);

  // Listen for payment events
  useEffect(() => {
    if (!contract || !address) return;
    
    const handlePaymentSuccess = async (payer: string, networkId: string) => {
      if (
        payer.toLowerCase() === address.toLowerCase() &&
        networkId === network.id
      ) {
        setHasPaid(true);
        setIsProcessingPayment(false);

        // Immediately try to decrypt password
        try {
          const password = await decryptPassword();
          setDecryptedPassword(password);
        } catch (err) {
          console.error("Failed to decrypt after payment:", err);
          setIsProcessingPayment(false);
        }
      }
    };

    contract.on("PaymentReceived", handlePaymentSuccess);

    return () => {
      contract.off("PaymentReceived", handlePaymentSuccess);
    };
  }, [contract, address, network.id, decryptPassword]);

  // Check initial payment status
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
    <Card
      className={`relative overflow-hidden transition-all duration-300 bg-zaanet-purple-light ${
        isHovered ? "shadow-lg" : "shadow-md"
      } border border-gray-200 dark:border-gray-700/25`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image display or fallback */}
      <div className="relative h-40 w-full overflow-hidden">
        {imageLoading ? (
          <div
            className={`animate-pulse bg-gradient-to-r ${getGradientClass(
              network.id
            )} w-full h-full`}
          />
        ) : imageUrl && !imageError ? (
          <>
            <Image
              src={imageUrl}
              alt={network.name}
              fill
              className="object-cover transition-transform duration-500"
              style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </>
        ) : (
          <div
            className={`h-full w-full flex items-center justify-center ${getGradientClass(
              network.id
            )}`}
          >
            <div className="text-white text-4xl font-bold opacity-80">
              {network.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-3">
          <Wifi className="text-purple-600 dark:text-purple-400" size={20} />
        </div>
        <div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {network.name}
          </CardTitle>
          <CardDescription className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-900">
            <MapPin size={14} />
            {network.location.city}, {network.location.area}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col gap-4">
        {/* Network description */}
        {network.description && (
          <p className="text-sm text-gray-600 dark:text-gray-600">
            {network.description}
          </p>
        )}

        {/* Network specs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-purple-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-900">Speed</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-900">
                {network.speed} Mbps
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-purple-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-900">Type</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-900">
                {network.type || "WiFi 6"}
              </p>
            </div>
          </div>
        </div>

        {/* Password section */}
        {hasPaid && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="text-purple-500" size={16} />
                <span className="text-sm font-medium">Network Password</span>
              </div>

              {isDecrypting ? (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Decrypting...</span>
                </div>
              ) : decryptedPassword ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-purple-600 dark:text-purple-400 p-0 h-auto gap-1"
                >
                  {showPassword ? (
                    <>
                      <EyeOff size={14} />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      <span>Show</span>
                    </>
                  )}
                </Button>
              ) : (
                <span className="text-sm text-gray-500">
                  Error loading password
                </span>
              )}
            </div>

            {showPassword && decryptedPassword && (
              <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                <p className="font-mono text-sm">{decryptedPassword}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-0">
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-900">
            Coordinates: {network.location.lat.toFixed(4)},{" "}
            {network.location.lng.toFixed(4)}
          </span>
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {network.price} ETH
          </span>
        </div>

        <Button
          size="lg"
          className={`w-full transition-all duration-300 ${
            hasPaid
              ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
          onClick={() => {
            if (onConnect) {
              setIsProcessingPayment(true);
              onConnect(network);
            }
          }}
          disabled={hasPaid || (isProcessingPayment && !stopProcessing)}
        >
          {(isProcessingPayment && !stopProcessing) ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : hasPaid ? (
            <div className="flex items-center gap-2">
              <span>Connected</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          ) : (
            "Connect to Network"
          )}
        </Button>
      </CardFooter>

      {/* Status badge */}
      {hasPaid && (
        <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Active
        </div>
      )}
    </Card>
  );
};

export default WifiNetworkCard;
