"use client";

import React, { useState, useEffect } from "react";
import type { WifiNetwork } from "@/types";
import WifiNetworkCard from "@/app/components/wifi/WifiNetworkCard";
import { Button } from "@/app/components/ui/button";
import { MapPin, SortAsc, SortDesc, List, Map, Loader2 } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  network_Abi,
  storage_Abi,
  zaanetNetwork_CA,
  zaanetStorage_CA,
  ZERODEV_RPC,
} from "../../web3/contants/projectData";
import { createPublicClient, getContract, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const NetworkCardSkeleton = () => (
  <div className="p-4 border border-blue-300 rounded-lg shadow-sm bg-black/10">
    <Skeleton className="h-6 w-3/4 mb-3 bg-blue-950" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/2 bg-blue-900" />
      <Skeleton className="h-4 w-1/3 bg-blue-900" />
      <Skeleton className="h-4 w-1/4 bg-blue-900" />
    </div>
    <Skeleton className="h-10 w-full mt-4 bg-blue-100/10" />
  </div>
);

export default function BrowseNetworksPage() {
  const [availableNetworks, setAvailableNetworks] = useState<WifiNetwork[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByArea, setSortByArea] = useState<"asc" | "desc" | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [isLoading, setIsLoading] = useState(false);

  const fetchHostedNetworks = async () => {
    setIsLoading(true);
    try {
      const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http(ZERODEV_RPC),
      });

      const networkContract = getContract({
        address: zaanetNetwork_CA as `0x${string}`,
        abi: network_Abi,
        client: publicClient,
      });

      const storageContract = getContract({
        address: zaanetStorage_CA as `0x${string}`,
        abi: storage_Abi,
        client: publicClient,
      });

      const networkIdCounter = Number(
        await storageContract.read.networkIdCounter()
      );

      const networkPromises = [];
      for (let i = 1; i <= networkIdCounter; i++) {
        networkPromises.push(networkContract.read.getHostedNetworkById([i]));
      }

      const networksRaw = (await Promise.all(networkPromises)) as {
        id: number;
        metadataCID: string;
        price: number | string;
        host: string;
        isActive: boolean;
        ratingCount: number;
        successfullSessions: number;
        totalRating: number;
      }[];

      const metadataPromises = networksRaw.map((network) =>
        fetch(`https://ipfs.io/ipfs/${network.metadataCID}`)
          .then((res) => res.json())
          .catch(() => ({}))
      );

      const metadataList = await Promise.all(metadataPromises);

      const networks: WifiNetwork[] = networksRaw
        .filter((n) => n.id !== 0 && n.isActive)
        .map((network, i) => ({
          id: network.id.toString(),
          metadataCID: network.metadataCID,
          price: Number(network.price),
          hostWallet: network.host,
          ratingCount: Number(network.ratingCount),
          successfullSessions: Number(network.successfullSessions),
          totalRating: Number(network.totalRating),
          ...(metadataList[i] || {}),
        }));

      setAvailableNetworks(networks);
    } catch (error) {
      console.error("Failed to load networks:", error);
      setAvailableNetworks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHostedNetworks();
  }, []);

  let filteredNetworks = availableNetworks.filter((network) =>
    `${network.location.city} ${network.location.area}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (sortByArea) {
    filteredNetworks = [...filteredNetworks].sort((a, b) =>
      sortByArea === "asc"
        ? a.location.area.localeCompare(b.location.area)
        : b.location.area.localeCompare(a.location.area)
    );
  }

  return (
    <div className="container min-h-screen max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-4 text-blue-100">
        Explore WiFi Networks
      </h1>
      <p className="text-blue-200 mb-8 max-w-2xl">
        These are public networks hosted on ZaaNet. You can browse and learn
        about each network here. When you physically connect to a ZaaNet WiFi,
        you'll be redirected to a captive portal to make a payment and gain internet access.
      </p>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full max-w-md">
          <MapPin className="text-blue-100" size={20} />
          <input
            type="text"
            placeholder="Search by city or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-blue-100"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortByArea === "asc" ? "default" : "outline"}
            onClick={() => setSortByArea(sortByArea === "asc" ? null : "asc")}
          >
            <SortAsc size={16} />
          </Button>
          <Button
            variant={sortByArea === "desc" ? "default" : "outline"}
            onClick={() => setSortByArea(sortByArea === "desc" ? null : "desc")}
          >
            <SortDesc size={16} />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
          >
            <List size={16} />
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            onClick={() => setViewMode("map")}
          >
            <Map size={16} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        viewMode === "map" ? (
          <div className="flex items-center justify-center h-96 w-full rounded-lg border border-gray-300 mb-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-100" />
            <span className="ml-2 text-gray-900">Loading map...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <NetworkCardSkeleton key={i} />
            ))}
          </div>
        )
      ) : viewMode === "map" ? (
        <div className="h-96 w-full rounded-lg border border-gray-300 mb-8" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNetworks.length > 0 ? (
            filteredNetworks.map((network) => (
              <WifiNetworkCard
                key={network.id}
                id={network.id}
                hostWallet={network.hostWallet}
                name={network.ssid}
                location={network.location}
                description={network.description}
                speed={network.speed}
                price={network.price}
                image={network.image}
                ratingCount={network.ratingCount}
                successfullSessions={network.successfullSessions}
                totalRating={network.totalRating}
              />
            ))
          ) : (
            <p className="text-gray-900 col-span-full text-center">
              No networks found matching your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
