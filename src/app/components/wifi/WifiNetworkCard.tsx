"use client";

import React from "react";
import { Wifi, MapPin, Star, User, CheckCircle } from "lucide-react";
import { formatUnits } from "viem";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { INetworkConfig } from "@/app/server/models/NetworkConfig.model";
import Image from "next/image";

interface WifiNetworkCardProps extends Pick<
  INetworkConfig,
  "networkId" | "ssid" | "price" | "description" | "image" | "ratingCount" | "location"
> {
  host?: string;
  totalRating?: number;
  successfulSessions?: number;
}

const getGradientClass = (networkId: string) => {
  let hash = 0;
  for (let i = 0; i < networkId.length; i++) {
    hash = networkId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const gradients = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-indigo-700",
    "from-green-500 to-teal-500",
    "from-blue-600 to-blue-950",
    "from-slate-700 to-slate-950",
    "from-indigo-500 to-purple-500",
    "from-emerald-500 to-blue-500",
    "from-amber-500 to-gray-800",
  ];

  return gradients[Math.abs(hash) % gradients.length];
};

const WifiNetworkCard: React.FC<WifiNetworkCardProps> = ({
  networkId,
  ssid,
  price,
  description,
  image,
  ratingCount,
  location,
  host,
  totalRating,
  successfulSessions,
}) => {
  const gradient = getGradientClass(networkId);
  const safeRatingCount = ratingCount ?? 0;
  const safeTotalRating = totalRating ?? 0;
  const averageRating = safeRatingCount > 0 ? (safeTotalRating / safeRatingCount).toFixed(1) : "0.0";

  console.log("Rendering WifiNetworkCard for:", ssid, "with image:", image);
  return (
    <Card className="relative overflow-hidden bg-blue-900 border border-blue-200/25 shadow hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden">
        {image ? (
          <>
            <div className="absolute inset-0 bg-cover bg-center">
              <Image
                src={image}
                alt={`${ssid} network image`}
                className="object-cover w-full h-full"
                width={1600}
                height={900}
                loading="lazy"
                quality={80}
              />
            </div>
            <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <Wifi size={12} />
              {ssid}
            </div>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
              {price} USDT/hour
            </div>
          </>
        ) : (
          <>
            <div className={`h-full w-full bg-gradient-to-r ${gradient} flex items-center justify-center`}>
              <span className="text-white text-4xl font-bold">{ssid.charAt(0).toUpperCase()}</span>
            </div>
            <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <Wifi size={12} />
              {ssid}
            </div>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
              {price} USDT/hour
            </div>
          </>
        )}
      </div>

      <CardContent className="p-4 flex flex-col gap-4">
        {/* Location & Rating */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-blue-200 text-sm">
            <MapPin size={14} />
            {location.city || "Unknown"}, {location.area || "Unknown"}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
            <Star size={12} fill="currentColor" />
            {averageRating} ({ratingCount})
          </div>
        </div>

        {/* Host & Stats */}
        {(host || successfulSessions !== undefined) && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {successfulSessions !== undefined && (
              <div className="flex items-center gap-2">
                <User size={14} className="text-green-600" />
                {successfulSessions} Sessions
              </div>
            )}
            {host && (
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-600" />
                {host.slice(0, 4)}...{host.slice(-4)}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-blue-300 line-clamp-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default WifiNetworkCard;