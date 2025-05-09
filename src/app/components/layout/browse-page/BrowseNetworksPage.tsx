"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { WifiNetwork } from "@/types";
import WifiNetworkCard from "@/app/components/wifi/WifiNetworkCard";
import { Button } from "@/app/components/ui/button";
import { MapPin, SortAsc, SortDesc, List, Map, Loader2 } from "lucide-react";
import { ethers } from "ethers";
import { Skeleton } from "@/app/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import ConnectManager from "../../wifi/ConnectManager";
import { loadContract } from "../../web3/contants/web3Funcs";
import { contract_Abi, contractAddress, usdtAbi, usdtContractAddress } from "../../web3/contants/projectData";
import { initSmartAccountClient } from "../../web3/accountAbstraction";
import { useSmartAccount } from "../../web3/SmartAccountProvider";

// HANDLE CONNECTION
interface HandleConnectParams {
  network: WifiNetwork;
  totalPrice: ethers.BigNumberish;
  duration: string;
  onComplete: (result: {
    success: boolean;
    token?: string | undefined;
  }) => void;
}

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
    const { address, connect, disconnect } = useSmartAccount();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [availableNetworks, setAvailableNetworks] = useState<WifiNetwork[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByArea, setSortByArea] = useState<"asc" | "desc" | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [isLoading, setIsLoading] = useState(false);
  const [openConManagerModal, setOpenConManagerModal] = useState(false);
  const [isSetNetwork, setIsSetNetwork] = useState<WifiNetwork | null>(null);


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

      const networkPromises = [];
      for (let i = 1; i <= networkIdCounter; i++) {
        networkPromises.push(contractInstance.getHostedNetworkById(i));
      }

      const networksRaw = await Promise.all(networkPromises);

      const networks: WifiNetwork[] = networksRaw
        .filter((network) => network.id !== 0 && network.isActive)
        .map((network) => ({
          id: network.id.toString(),
          metaDataCID: network.metaDataCID,
          price: ethers.formatUnits(network.price, 18),
          hostWallet: network.hostAddress,
          createdAt: new Date(Number(network.createdAt) * 1000), // ← actual Date
          updatedAt: new Date(Number(network.updatedAt) * 1000), // ← actual Date
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

  // Handle Connect
  async function handleConnect({
    network,
    totalPrice,
    duration,
    onComplete,
  }: HandleConnectParams): Promise<void> {
    try {
      const contractInstance = await loadContract({
        contractAddress,
        contractABI: contract_Abi,
      });
  
      const networkData = await contractInstance?.getHostedNetworkById(network.id);
      if (!networkData.isActive) throw new Error("Network is not active");
      if (Number(networkData.id) === 0) throw new Error("Network does not exist");
  
      const durationNum = parseInt(duration, 10);
      if (isNaN(durationNum) || durationNum <= 0)
        throw new Error("Invalid duration");
  
      const amountToSend = ethers.parseUnits(totalPrice.toString(), 18);
      const expectedPrice = networkData.price * BigInt(durationNum);
      if (expectedPrice !== amountToSend) {
        throw new Error(
          `Price mismatch: expected ${ethers.formatUnits(expectedPrice, 18)} USDT`
        );
      }
  
      // Encode approve call
      const usdtInterface = new ethers.Interface(usdtAbi);
      const approveCallData = usdtInterface.encodeFunctionData('approve', [contractAddress, amountToSend]);
  
      // Encode acceptPayment call
      const acceptPaymentCallData = contractInstance?.interface.encodeFunctionData('acceptPayment', [
        network.id,
        amountToSend,
        BigInt(durationNum)
      ]);
  
      // Initialize AA client dynamically
      const kernelClient = await initSmartAccountClient();
  
      // Send both calls in a single user operation using KernelClient
      const userOpHash = await kernelClient.sendUserOperation({
        callData: await kernelClient.account.encodeCalls([
          {
            to: usdtContractAddress,
            value: 0n,
            data: approveCallData as `0x${string}`,
          },
          {
            to: contractAddress,
            value: 0n,
            data: acceptPaymentCallData as `0x${string}`,
          },
        ]),
      });
  
      toast({ title: 'Transaction Sent', description: 'Processing payment via smart account...' });
     const tx =  await kernelClient.waitForUserOperationReceipt({ hash: userOpHash });
  
      // Trigger backend sync if transaction is successful
      if (tx) {
        toast({ title: 'Payment Successful', description: 'Syncing with backend...' });
        await axios.get('/api/sync-events');
      } else {
        throw new Error("Transaction failed");
      }
  
      // Attempt to fetch session token
      let token: string | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await axios.get<{ token: string }>(`/api/get-token-by-network/${network.id}`);
          token = res.data.token;
          break;
        } catch {
          await new Promise((res) => setTimeout(res, 1000));
        }
      }
  
      if (!token) throw new Error("Failed to retrieve session token");
  
      toast({ title: 'Success', description: `Connected to ${network.id}` });
      onComplete({ success: true, token });
    } catch (error: any) {
      console.error("Connection Error:", error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'An error occurred during connection.',
        variant: 'destructive',
      });
      onComplete({ success: false });
    }
  }


  // let filteredNetworks = availableNetworks.filter((network) =>
  //   `${network.metaDataCID}`
  //     .toLowerCase()
  //     .includes(searchTerm.toLowerCase())
  // );
  
  // if (sortByArea) {
  //   filteredNetworks = [...filteredNetworks].sort((a, b) =>
  //     sortByArea === "asc"
  //       ? a.location.area.localeCompare(b.location.area)
  //       : b.location.area.localeCompare(a.location.area)
  //   );
  // }
  

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
          {/* {filteredNetworks.length > 0 ? (
            filteredNetworks.map((network) => (
              <WifiNetworkCard
                key={network.id}
                network={network}
                address={address || ""}
                contract={contract}
                setIsSetNetwork={setIsSetNetwork}
                setOpenConManagerModal={setOpenConManagerModal}
              />
            ))
          ) : (
            <p className="text-gray-900 col-span-full text-center">
              No networks found matching your search.
            </p>
          )} */}
        </div>
      )}

      {openConManagerModal && isSetNetwork && (
        <ConnectManager
          isSetNetwork={isSetNetwork}
          setOpenConManagerModal={setOpenConManagerModal}
          onConnect={(network, totalPrice, duration, onComplete) => {
            handleConnect({
              network,
              totalPrice: parseFloat(totalPrice),
              duration,
              onComplete,
            });
          }}
        />
      )}
    </div>
  );
}
