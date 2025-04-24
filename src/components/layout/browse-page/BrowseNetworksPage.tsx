'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { WifiNetwork } from '@/types';
import WifiNetworkCard from '@/components/wifi/WifiNetworkCard';
import { Button } from '@/components/ui/button';
import { MapPin, SortAsc, SortDesc, List, Map, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { contract_Abi, contractAddress, loadContract } from '@/contants';
import { ethers } from 'ethers';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccount, useWalletClient } from 'wagmi';
import { toast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortByArea, setSortByArea] = useState<'asc' | 'desc' | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  async function getAllHostedNetworksByIds(id: number) {
    const contractInstance = await loadContract({
      contractAddress,
      contractABI: contract_Abi,
    });
    if (!contractInstance) throw new Error('Failed to load contract');
    return contractInstance.getHostedNetworkById(id);
  }

  useEffect(() => {
    const fetchHostedNetworks = async () => {
      setIsLoading(true);
      try {
        const contractInstance = await loadContract({
          contractAddress,
          contractABI: contract_Abi,
        });
        if (!contractInstance) {
          console.error('Contract not loaded');
          return;
        }
        setContract(contractInstance);

        const networkIdCounter = Number(await contractInstance.networkIdCounter());
        const networkPromises: Promise<ReturnType<typeof getAllHostedNetworksByIds>>[] = [];

        for (let i = 1; i <= networkIdCounter; i++) {
          networkPromises.push(getAllHostedNetworksByIds(i));
        }

        const networksRaw = await Promise.all(networkPromises);

        const networks: WifiNetwork[] = networksRaw
          .filter((network) => network.id !== 0 && network.isActive)
          .map((network) => ({
            id: network.id.toString(),
            name: network.name,
            location: {
              city: network.location.city,
              area: network.location.area,
              lat: parseFloat(network.location.latitude) || 0,
              lng: parseFloat(network.location.longitude) || 0,
            },
            speed: parseInt(network.wifispeed) || 0,
            price: ethers.formatEther(network.price),
            hostWallet: network.hostAddress,
            password: '', // Initialize password as an empty string
          }));

        setAvailableNetworks(networks);
      } catch (error) {
        console.error('Error fetching networks:', error);
        setAvailableNetworks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostedNetworks();
  }, []);

  async function handleConnect(network: WifiNetwork) {
    if (!isConnected || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first.',
        variant: 'destructive',
      });
      return;
    }

    if (!contract || !walletClient) {
      toast({
        title: 'Error',
        description: 'Contract or wallet not loaded.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Call acceptPayment with the network's price
      const tx = await contract.acceptPayment(network.id, {
        value: ethers.parseEther(network.price),
      });

      toast({
        title: 'Payment Sent',
        description: `Processing payment for ${network.name}...`,
      });

      // Wait for transaction confirmation
      await tx.wait();

      // Fetch passwordCID
      const passwordCID = await contract.getPasswordCID(network.id);

      // Fetch encrypted password from IPFS
      const response = await fetch(`https://ipfs.io/ipfs/${passwordCID}`);
      const encryptedPassword = await response.text();

      // Decrypt password (assumes secretKey is available)
      const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY!;
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
      const password = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (!password) {
        throw new Error('Failed to decrypt password');
      }

      // Update network with password
      setAvailableNetworks((prev) =>
        prev.map((n) =>
          n.id === network.id ? { ...n, password } : n
        )
      );

      toast({
        title: 'Success',
        description: `Connected to ${network.name}. Password: ${password}`,
      });
    } catch (error: unknown) {
      console.error('Connection error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to connect to network. Check your balance or network status.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
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
      sortByArea === 'asc'
        ? a.location.area.localeCompare(b.location.area)
        : b.location.area.localeCompare(a.location.area)
    );
  }

  useEffect(() => {
    if (viewMode === 'map') {
      const map = L.map('networks-map').setView([7.9465, -1.0232], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      filteredNetworks.forEach((network) => {
        L.marker([network.location.lat, network.location.lng])
          .addTo(map)
          .bindPopup(
            `<b>${network.name}</b><br>${network.location.city}, ${network.location.area}<br>Speed: ${network.speed} Mbps<br>Price: ${network.price} ETH`
          );
      });

      return () => {
        map.remove();
      };
    }
  }, [viewMode, filteredNetworks]);

  return (
    <div className="container min-h-screen max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-4 text-zaanet-purple">
        Browse WiFi Networks
      </h1>
      <p className="text-gray-900 mb-8">
        Find affordable, nearby WiFi hotspots and connect with crypto. All
        payments are secure and instant.{' '}
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
            variant={sortByArea === 'asc' ? 'default' : 'outline'}
            onClick={() => setSortByArea(sortByArea === 'asc' ? null : 'asc')}
            className="text-zaanet-purple border-zaanet-purple"
            aria-label="Sort areas alphabetically ascending"
          >
            <SortAsc size={16} />
          </Button>
          <Button
            variant={sortByArea === 'desc' ? 'default' : 'outline'}
            onClick={() => setSortByArea(sortByArea === 'desc' ? null : 'desc')}
            className="text-zaanet-purple border-zaanet-purple"
            aria-label="Sort areas alphabetically descending"
          >
            <SortDesc size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className="text-zaanet-purple border-zaanet-purple"
            aria-label="Switch to list view"
          >
            <List size={16} />
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
            className="text-zaanet-purple border-zaanet-purple"
            aria-label="Switch to map view"
          >
            <Map size={16} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        viewMode === 'map' ? (
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
      ) : viewMode === 'map' ? (
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