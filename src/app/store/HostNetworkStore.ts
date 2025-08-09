import { create } from 'zustand';
import { toast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { arbitrumSepolia } from "viem/chains";
import api from "@/lib/axios";
import { zaanetNetwork_CA, network_Abi } from '../components/web3/contants/projectData';
import { uploadImageToIPFS, loadContract } from '../components/web3/contants/web3Funcs';

interface HostForm {
  ssid: string;
  price: number;
  description?: string;
  image?: File;
  location: {
    country: string;
    region: string;
    city: string;
    area: string;
    lat: number;
    lng: number;
  };
  contact: {
    ownerName: string;
    ownerEmail: string;
    adminEmails?: string[];
  };
  hardware: {
    deviceType: 'raspberry-pi-4' | 'raspberry-pi-5' | 'custom';
    specifications?: {
      cpu?: string;
      memory?: string;
      storage?: string;
    };
  };
}

interface HostNetworkStore {
  isHostingNetwork: boolean;
  setLoading: (loading: boolean) => void;
  hostNetwork: (data: HostForm, isConnected: boolean, onComplete: (success: boolean) => void) => Promise<void>;
}

export const useHostNetworkStore = create<HostNetworkStore>((set, get) => ({
  isHostingNetwork: false,

  setLoading: (loading: boolean) => set({ isHostingNetwork: loading }),

  hostNetwork: async (data: HostForm, isConnected: boolean, onComplete: (success: boolean) => void) => {
    set({ isHostingNetwork: true });
    try {
      if (!isConnected) {
        toast({
          title: "Error",
          description: "Smart account is not connected.",
          variant: "destructive",
        });
        onComplete(false);
        return;
      }

      // Check if wallet is on Arbitrum Sepolia
      if (arbitrumSepolia.id !== arbitrumSepolia.id) {
        toast({
          title: "Error",
          description: "Please switch to Arbitrum Sepolia network in your wallet.",
          variant: "destructive",
        });
        onComplete(false);
        return;
      }

      let imageCID = "";
      if (data.image) {
        try {
          imageCID = await uploadImageToIPFS(data.image);
        } catch (ipfsError) {
          console.error('IPFS upload error:', ipfsError);
          throw new Error('Failed to upload image to IPFS');
        }
      }

      const { location } = data;
      if (
        !location.city ||
        !location.country ||
        !location.region ||
        !location.area ||
        !location.lat ||
        !location.lng
      ) {
        toast({
          title: "Error",
          description: "Please provide complete location details.",
          variant: "destructive",
        });
        onComplete(false);
        return;
      }

      const priceString = Number(data.price).toFixed(18);
      const amountToSend = ethers.parseUnits(priceString, 18);

      const metadata = {
        ssid: data.ssid,
        price: data.price,
        description: data.description,
        image: imageCID,
        ratingCount: 0,
        location: {
          country: location.country,
          region: location.region,
          city: location.city,
          area: location.area,
          coordinates: { latitude: location.lat, longitude: location.lng },
        },
        contact: data.contact,
        hardware: data.hardware,
        status: "offline",
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      };

      let mongoDataId;
      try {
        const response = await api.post("/host-network", metadata, {
          timeout: 10000,
        });
        if (response.status !== 200 && response.status !== 201) {
          throw new Error("Failed to save network configuration to database");
        }
        mongoDataId = (response.data as { mongoDataId: string }).mongoDataId;
        if (!mongoDataId) {
          throw new Error("Invalid response: mongoDataId not found");
        }
      } catch (dbError: any) {
        console.error('MongoDB save error:', dbError);
        let errorMessage = "Failed to save network configuration to database";
        if (dbError.code === "ECONNABORTED") {
          errorMessage = "Request to save network timed out. Please check server status.";
        }
        throw new Error(errorMessage);
      }

      let networkContract;
      try {
        networkContract = await loadContract({
          contractAddress: zaanetNetwork_CA,
          contractABI: network_Abi,
          withSigner: true,
        });
        if (!networkContract) {
          throw new Error("Failed to initialize network contract");
        }
      } catch (contractError) {
        console.error('Contract load error:', contractError);
        // Rollback MongoDB document
        try {
          await api.delete(`/host-network/${mongoDataId}/delete-failed-network`);
          console.log(`Rolled back MongoDB document with _id: ${mongoDataId}`);
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
        throw new Error('Failed to load network contract. Please check wallet connection.');
      }

      try {
        // Register the network on the BLOCKCHAIN
        const tx = await networkContract.registerNetwork(amountToSend, mongoDataId, true);
        const receipt = await tx.wait();
        if (!receipt || receipt.status !== 1) {
          throw new Error("Transaction failed or was reverted");
        }
      } catch (txError: any) {
        console.error('Blockchain transaction error:', txError);
        // Rollback MongoDB document
        try {
          await api.delete(`/host-network/${mongoDataId}/delete-failed-network`);
          console.log(`Rolled back MongoDB document with _id: ${mongoDataId}`);
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
        let errorMessage = "Blockchain transaction failed";
        if (txError.code === "INSUFFICIENT_FUNDS") {
          errorMessage = "Insufficient funds for transaction. Please add funds to your wallet.";
        } else if (txError.code === "ACTION_REJECTED") {
          errorMessage = "Transaction rejected by wallet. Please approve the transaction.";
        } else if (txError.reason) {
          errorMessage = `Transaction reverted: ${txError.reason}`;
        }
        throw new Error(errorMessage);
      }

      toast({
        title: "Network Listed!",
        description: "Your WiFi network is now hosted and available to users.",
      });
      onComplete(true);
    } catch (error: unknown) {
      console.error('Transaction error:', error);
      let errorMessage = "Failed to list your network. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      onComplete(false);
    } finally {
      set({ isHostingNetwork: false });
    }
  },
}));