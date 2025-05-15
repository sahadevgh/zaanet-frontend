"use client";

import React, { useEffect, useState } from "react";
import { Wifi, MapPin, Star, User, CheckCircle, Signal } from "lucide-react";
import type { WifiNetwork } from "@/types";
import { formatUnits } from "viem";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";

interface WifiNetworkCardProps {
  id: string;
  name: string;
  price: number;
  hostWallet: string;
  ratingCount: number;
  successfullSessions: number;
  totalRating: number;
  location: {
    country: string;
    city: string;
    area: string;
    lat: number;
    lng: number;
  };
  speed: number;
  description?: string;
  image?: File;
}

const getGradientClass = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
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
  id,
  name,
  price,
  hostWallet,
  ratingCount,
  successfullSessions,
  totalRating,
  location,
  speed,
  description,
  image,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const gradient = getGradientClass(id);
  const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0.0";

  useEffect(() => {
    if (!image) {
      setImageError(true);
      return;
    }

    fetch(`https://ipfs.io/ipfs/${image}`)
      .then((res) => res.ok ? res.blob() : Promise.reject())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      })
      .catch(() => setImageError(true));

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [image]);

  const getSignalStrength = (speed: number) => {
    if (speed >= 100) return 4;
    if (speed >= 50) return 3;
    if (speed >= 25) return 2;
    return 1;
  };

  const signalStrength = getSignalStrength(speed);

  return (
    <Card className="relative overflow-hidden bg-blue-900 border border-blue-200/25 shadow hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden">
        {imageUrl && !imageError ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-r ${gradient} flex items-center justify-center`}>
            <span className="text-white text-4xl font-bold">{name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <Wifi size={12} />
          {name}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
          {formatUnits(BigInt(price), 18)} USDT/hr
        </div>
      </div>

      <CardContent className="p-4 flex flex-col gap-4">
        {/* Location & Rating */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-blue-200 text-sm">
            <MapPin size={14} />
            {location.city}, {location.area}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
            <Star size={12} fill="currentColor" />
            {averageRating} ({ratingCount})
          </div>
        </div>

        {/* Speed */}
        <div className="flex justify-between items-center border-b border-muted pb-2">
          <div className="flex items-center gap-2">
            <Signal size={16} className="text-green-600" />
            <div className="text-sm font-medium">{speed} Mbps</div>
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={cn(
                  "w-1 rounded-full",
                  bar <= signalStrength ? "bg-green-600" : "bg-muted",
                  bar === 1 ? "h-1" : bar === 2 ? "h-2" : bar === 3 ? "h-3" : "h-4"
                )}
              />
            ))}
          </div>
        </div>

        {/* Host & Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User size={14} className="text-green-600" />
            {successfullSessions} Sessions
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-green-600" />
            {hostWallet.slice(0, 4)}...{hostWallet.slice(-4)}
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default WifiNetworkCard;
