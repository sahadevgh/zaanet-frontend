"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { WifiNetwork } from "@/types";
import WifiNetworkCard from "@/components/wifi/WifiNetworkCard";
import { Button } from "@/components/ui/button";
import { MapPin, SortAsc, SortDesc, List, Map } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const mockNetworks: WifiNetwork[] = [
  {
    id: "1",
    name: "Zaa Home WiFi",
    location: { city: "Tamale", area: "Gumani", lat: 9.4034, lng: -0.8424 },
    speed: 25,
    price: "1.00",
    hostWallet: "0xA1FA...456C",
  },
  {
    id: "2",
    name: "Accra Cafe Network",
    location: { city: "Accra", area: "Osu", lat: 5.5537, lng: -0.1830 },
    speed: 50,
    price: "1.50",
    hostWallet: "0xC4F6...9B21",
  },
  {
    id: "3",
    name: "Downtown Hotspot",
    location: { city: "Tamale", area: "Central", lat: 9.4060, lng: -0.8390 },
    speed: 10,
    price: "0.75",
    hostWallet: "0xB888...ABCD",
  },
];

export default function BrowseNetworksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByArea, setSortByArea] = useState<"asc" | "desc" | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  function handleConnect(network: WifiNetwork) {
    alert(`Pretend to connect to ${network.name}`);
  }

  let filteredNetworks = mockNetworks.filter((network) =>
    `${network.location.city} ${network.location.area}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (sortByArea) {
    filteredNetworks = [...filteredNetworks].sort((a, b) =>
      sortByArea === "asc"
        ? a.location.area.localeCompare(b.location.area)
        : b.location.area.localeCompare(b.location.area)
    );
  }

  useEffect(() => {
    if (viewMode === "map") {
      const map = L.map("networks-map").setView([7.9465, -1.0232], 7); // Center on Ghana
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      filteredNetworks.forEach((network) => {
        L.marker([network.location.lat, network.location.lng])
          .addTo(map)
          .bindPopup(
            `<b>${network.name}</b><br>${network.location.city}, ${network.location.area}<br>Speed: ${network.speed} Mbps<br>Price: ${network.price} USDT`
          );
      });

      return () => {
        map.remove();
      };
    }
  }, [viewMode, filteredNetworks]);

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-4 text-zaanet-purple">Browse WiFi Networks</h1>
      <p className="text-gray-900 mb-8">
        Find affordable, nearby WiFi hotspots and connect with crypto. All payments are secure and instant.{" "}
        <Link href="/litepaper" className="text-zaanet-purple hover:underline">
          Learn more about ZaaNet
        </Link>
      </p>
      
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full max-w-md">
          <MapPin className="text-zaanet-purple" size={20} />
          <input
            type="text"
            placeholder="Search by city or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zaanet-purple text-gray-900"
            aria-label="Search WiFi networks by city or area"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortByArea === "asc" ? "default" : "outline"}
            onClick={() => setSortByArea(sortByArea === "asc" ? null : "asc")}
            className="text-zaanet-purple border-zaanet-purple"
            aria-label="Sort areas alphabetically ascending"
          >
            <SortAsc size={16} />
          </Button>
          <Button
            variant={sortByArea === "desc" ? "default" : "outline"}
            onClick={() => setSortByArea(sortByArea === "desc" ? null : "desc")}
            className="text-zaanet-purple border-zaanet-purple"
            aria-label="Sort areas alphabetically descending"
          >
            <SortDesc size={16} />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className="text-zaanet-purple border-zaanet-purple"
            aria-label="Switch to list view"
          >
            <List size={16} />
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            onClick={() => setViewMode("map")}
            className="text-zaanet-purple border-zaanet-purple"
            aria-label="Switch to map view"
          >
            <Map size={16} />
          </Button>
        </div>
      </div>

      {viewMode === "map" ? (
        <div id="networks-map" className="h-96 w-full rounded-lg border border-gray-300 mb-8" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNetworks.length > 0 ? (
            filteredNetworks.map((network) => (
              <WifiNetworkCard key={network.id} network={network} onConnect={handleConnect} />
            ))
          ) : (
            <p className="text-gray-900 col-span-full text-center">No networks found matching your search.</p>
          )}
        </div>
      )}
    </div>
  );
}