"use client";

import React, { useState, useEffect } from "react";
import { INetworkConfig } from "@/app/server/models/NetworkConfig.model";
import WifiNetworkCard from "@/app/components/wifi/WifiNetworkCard";
import { Button } from "@/app/components/ui/button";
import { MapPin, SortAsc, SortDesc, List, Map, Loader2 } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/axios";

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
  const [availableNetworks, setAvailableNetworks] = useState<INetworkConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByArea, setSortByArea] = useState<"asc" | "desc" | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [isLoading, setIsLoading] = useState(false);

  const fetchHostedNetworks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/hosted-networks", {
        timeout: 10000,
      });
      if (response.status !== 200) {
        throw new Error("Failed to fetch networks");
      }

      const networks = response.data as INetworkConfig[];
      if (!Array.isArray(networks) || networks.length === 0) {
        console.warn("No hosted networks found");
        setAvailableNetworks([]);
      } else {
        setAvailableNetworks(networks);
      }
    } catch (error) {
      console.error("Error fetching networks:", error);
      toast({
        title: "Error",
        description: "Failed to load networks. Please try again.",
        variant: "destructive",
      });
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
        ? (a.location.area ?? "").localeCompare(b.location.area ?? "")
        : (b.location.area ?? "").localeCompare(a.location.area ?? "")
    );
  }

  return (
    <div className="container min-h-screen max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-4 text-blue-100">
        Explore WiFi Networks
      </h1>
      <p className="text-blue-200 mb-8 max-w-2xl">
        Browse public networks hosted on ZaaNet. Connect to a network physically
        to access the captive portal for payment and internet access.
      </p>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full max-w-md">
          <MapPin className="text-blue-100" size={20} />
          <input
            type="text"
            placeholder="Search by city or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-blue-100 bg-blue-900 placeholder-blue-400"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortByArea === "asc" ? "default" : "outline"}
            onClick={() => setSortByArea(sortByArea === "asc" ? null : "asc")}
            className="bg-blue-800 text-blue-100 hover:bg-blue-700"
          >
            <SortAsc size={16} />
          </Button>
          <Button
            variant={sortByArea === "desc" ? "default" : "outline"}
            onClick={() => setSortByArea(sortByArea === "desc" ? null : "desc")}
            className="bg-blue-800 text-blue-100 hover:bg-blue-700"
          >
            <SortDesc size={16} />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className="bg-blue-800 text-blue-100 hover:bg-blue-700"
          >
            <List size={16} />
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            onClick={() => setViewMode("map")}
            className="bg-blue-800 text-blue-100 hover:bg-blue-700"
          >
            <Map size={16} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        viewMode === "map" ? (
          <div className="flex items-center justify-center h-96 w-full rounded-lg border border-blue-300 bg-blue-900/50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-100" />
            <span className="ml-2 text-blue-100">Loading map...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <NetworkCardSkeleton key={i} />
            ))}
          </div>
        )
      ) : viewMode === "map" ? (
        <div className="h-96 w-full rounded-lg border border-blue-300 bg-blue-900/50">
          {filteredNetworks.length > 0 ? (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps/embed?pb=!1m${filteredNetworks.length * 2}!${filteredNetworks
                .map(
                  (n, i) =>
                    `!${i * 2 + 2}m4!1m3!1d10000!2d${n.location.coordinates?.longitude || 0}!3d${n.location.coordinates?.latitude || 0}`
                )
                .join("")}`}
              allowFullScreen
              title="Network Locations"
            ></iframe>
          ) : (
            <p className="text-blue-100 text-center pt-40">No networks found for map view.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNetworks.length > 0 ? (
            filteredNetworks.map((network) => (
              <WifiNetworkCard
                key={network.networkId}
                networkId={network.networkId}
                ssid={network.ssid}
                price={network.price}
                description={network.description}
                image={network.image}
                ratingCount={network.ratingCount ?? 0}
                location={network.location}
              />
            ))
          ) : (
            <p className="text-blue-100 col-span-full text-center">
              No networks found matching your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}