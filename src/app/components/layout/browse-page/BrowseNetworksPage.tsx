"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { WifiNetwork } from "@/types";
import WifiNetworkCard from "@/app/components/wifi/WifiNetworkCard";
import { Button } from "@/app/components/ui/button";
import { MapPin, SortAsc, SortDesc, List, Map, Loader2 } from "lucide-react";
import {
  contract_Abi,
  contractAddress,
  loadContract,
} from "@/app/components/web3/contants";
import { ethers } from "ethers";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "@/hooks/use-toast";
import CryptoJS from "crypto-js";

export const NetworkCardSkeleton = () => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <Skeleton className="h-6 w-3/4 mb-3 bg-gray-200" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2 bg-gray-200" />
        <Skeleton className="h-4 w-1/3 bg-gray-200" />
        <Skeleton className="h-4 w-1/4 bg-gray-200" />
      </div>
      <Skeleton className="h-10 w-full mt-4 bg-zaanet-purple/10" />
    </div>
  );
};

export default function BrowseNetworksPage() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [availableNetworks, setAvailableNetworks] = useState<WifiNetwork[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByArea, setSortByArea] = useState<"asc" | "desc" | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  async function getAllHostedNetworksByIds(id: number) {
    const contractInstance = await loadContract({
      contractAddress,
      contractABI: contract_Abi,
    });
    if (!contractInstance) throw new Error("Failed to load contract");
    return contractInstance.getHostedNetworkById(id);
  }

  const fetchHostedNetworks = async () => {
    setIsLoading(true);
    try {
      const contractInstance = await loadContract({
        contractAddress,
        contractABI: contract_Abi,
      });
      if (!contractInstance) {
        console.error("Contract not loaded");
        return;
      }
      setContract(contractInstance);

      const networkIdCounter = Number(
        await contractInstance.networkIdCounter()
      );
      const networkPromises: Promise<
        ReturnType<typeof getAllHostedNetworksByIds>
      >[] = [];

      for (let i = 1; i <= networkIdCounter; i++) {
        networkPromises.push(getAllHostedNetworksByIds(i));
      }

      const networksRaw = await Promise.all(networkPromises);

      const networks: WifiNetwork[] = networksRaw
        .filter((network) => network.id !== 0 && network.isActive)
        .map((network) => ({
          id: network.id.toString(),
          name: network.name,
          description: network.description || "No description available",
          imageCID: network.imageCID || "",
          type: network.type || "Unknown",
          location: {
            city: network.location.city,
            area: network.location.area,
            lat: parseFloat(network.location.latitude) || 0,
            lng: parseFloat(network.location.longitude) || 0,
          },
          speed: parseInt(network.wifispeed) || 0,
          price: ethers.formatUnits(network.price, 18), // USDT, 18 decimals
          hostWallet: network.hostAddress,
          password: "",
        }));

      setAvailableNetworks(networks);
    } catch (error) {
      console.error("Error fetching networks:", error);
      setAvailableNetworks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHostedNetworks();
  }, []);

  async function handleConnect(network: WifiNetwork) {
    if (!isConnected || !address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    if (!contract || !walletClient) {
      toast({
        title: "Error",
        description: "Contract or wallet not loaded.",
        variant: "destructive",
      });
      return;
    }

    try {
      const networkData = await contract.getHostedNetworkById(network.id);
      if (!networkData.isActive) {
        throw new Error("Network is not active");
      }
      if (Number(networkData.id) === 0) {
        throw new Error("Network does not exist");
      }

      let passwordCID: string;
      const hasPaid = await contract.hasPaid(network.id, address);
      if (hasPaid) {
        passwordCID = await contract.getPasswordCID(network.id);
      } else {
        // Convert price string (e.g., "0.01") to wei
        const priceInETH = ethers.parseEther(network.price);

        const tx = await contract.acceptPayment(network.id, {
          value: priceInETH, // Send ETH with the transaction
          gasLimit: 200_000,
        });

        toast({
          title: "Payment Sent",
          description: `Processing payment for ${network.name}...`,
        });

        await tx.wait();
        passwordCID = await contract.getPasswordCID(network.id);
      }

      if (!passwordCID.match(/^(Qm[1-9A-Za-z]{44}|bafy[0-9a-z]{50})$/)) {
        throw new Error("Invalid IPFS CID");
      }

      const response = await fetch(`https://ipfs.io/ipfs/${passwordCID}`);
      if (!response.ok) throw new Error("Failed to fetch password from IPFS");
      const encryptedPassword = await response.text();

      const secretKey = process.env.NEXT_PUBLIC_CRYPTOJS_SECRET_KEY!;
      if (!secretKey) throw new Error("Decryption key not set in environment");

      const decryptedBytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
      const password = decryptedBytes.toString(CryptoJS.enc.Utf8);
      if (!password) throw new Error("Failed to decrypt password");

      setAvailableNetworks((prev) =>
        prev.map((n) => (n.id === network.id ? { ...n, password } : n))
      );

      setTimeout(() => fetchHostedNetworks(), 3000); // debounce-like

      toast({
        title: "Success",
        description: `Connected to ${network.name}. Password: ${password}`,
      });
    } catch (error: unknown) {
      console.error("Connection error:", error);
      let errorMessage =
        "Failed to connect to network. Check your balance or network status.";
      if (error instanceof Error) {
        const message = error.message;
        if (message.includes("Network does not exist"))
          errorMessage = "This network is no longer available.";
        else if (message.includes("Network is not active"))
          errorMessage = "This network is currently inactive.";
        else if (message.includes("Invalid IPFS CID"))
          errorMessage = "Invalid IPFS CID returned by contract.";
        else if (message.includes("fetch"))
          errorMessage = "Unable to retrieve password from IPFS.";
        else if (message.includes("decrypt"))
          errorMessage = "Failed to decrypt password. Check encryption key.";
        else if (message.includes("Decryption key"))
          errorMessage = "Decryption key is missing in environment.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

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
      <h1 className="text-3xl font-bold mb-4 text-zaanet-purple">
        Browse WiFi Networks
      </h1>
      <p className="text-gray-900 mb-8">
        Find affordable, nearby WiFi hotspots and connect with crypto. All
        payments are secure and instant.{" "}
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

      {isLoading ? (
        viewMode === "map" ? (
          <div className="flex items-center justify-center h-96 w-full rounded-lg border border-gray-300 mb-8">
            <Loader2 className="h-8 w-8 animate-spin text-zaanet-purple" />
            <span className="ml-2 text-gray-900">Loading map...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <NetworkCardSkeleton key={index} />
            ))}
          </div>
        )
      ) : viewMode === "map" ? (
        <div
          id="networks-map"
          className="h-96 w-full rounded-lg border border-gray-300 mb-8"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNetworks.length > 0 ? (
            filteredNetworks.map((network) => (
              <WifiNetworkCard
                key={network.id}
                network={network}
                address={address || ""}
                contract={contract}
                onConnect={handleConnect}
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
