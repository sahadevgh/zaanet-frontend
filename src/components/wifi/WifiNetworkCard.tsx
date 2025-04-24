"use client";

import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi } from "lucide-react";
import type { WifiNetwork } from "@/types";

interface WifiNetworkCardProps {
  network: WifiNetwork;
  onConnect?: (network: WifiNetwork) => void;
}

const WifiNetworkCard: React.FC<WifiNetworkCardProps> = ({ network, onConnect }) => (

  <Card className="bg-zaanet-purple-light hover-scale transition-shadow duration-200 cursor-pointer border-zaanet-purple/[0.11] shadow-sm">
    <CardHeader className="flex flex-row items-start gap-4 pb-2">
      <div className="bg-zaanet-purple/10 rounded-full p-2">
        <Wifi color="#9b87f5" />
      </div>
      <div>
        <CardTitle className="text-lg text-gray-900">{network.name}</CardTitle>
        <CardDescription className="text-sm text-gray-700">
          {network.location.city}, {network.location.area} ({network.location.lat.toFixed(4)}, {network.location.lng.toFixed(4)})
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className="pt-0 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-700">Speed: {network.speed} Mbps</span>
        <span className="font-bold text-zaanet-purple text-md">{network.price} ETH</span>
      </div>
      <Button
        variant="outline"
        className="bg-zaanet-purple border-zaanet-purple text-white hover:bg-zaanet-purple hover:text-white mt-2 cursor-pointer"
        onClick={() => onConnect && onConnect(network)}
        aria-label={`Connect to ${network.name}`}
      >
        Connect
      </Button>
    </CardContent>
  </Card>
);

export default WifiNetworkCard;