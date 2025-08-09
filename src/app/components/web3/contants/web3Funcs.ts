"use client";

import { ethers } from "ethers";
import { toast } from "@/hooks/use-toast";

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Function to load a contract using ethers.js
export const loadContract = async ({
  contractAddress,
  contractABI,
  withSigner = false,
}: {
  contractAddress: string;
  contractABI: ethers.InterfaceAbi;
  withSigner?: boolean;
}): Promise<ethers.Contract | null> => {
  try {
    let provider: ethers.JsonRpcProvider | ethers.BrowserProvider;
    let signerOrProvider: ethers.Signer | ethers.Provider;

    if (withSigner) {
      if (!window.ethereum) {
        toast({
          title: "Error",
          description: "Please install MetaMask or another Ethereum wallet.",
          variant: "destructive",
        });
        return null;
      }
      provider = new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();
      const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID || "421614";
      if (network.chainId.toString() !== expectedChainId) {
        toast({
          title: "Wrong Network",
          description: `Please switch to Arbitrum Sepolia (Chain ID: ${expectedChainId}).`,
          variant: "destructive",
        });
        return null;
      }

      try {
        const signer = await provider.getSigner();
        signerOrProvider = signer;
      } catch (signerError) {
        console.error('Failed to get signer:', signerError);
        toast({
          title: "Error",
          description: "Failed to connect wallet. Please ensure MetaMask is unlocked and try again.",
          variant: "destructive",
        });
        return null;
      }
    } else {
      const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
      if (!alchemyApiKey) {
        throw new Error("Alchemy API key is missing");
      }
      provider = new ethers.JsonRpcProvider(`https://arb-sepolia.g.alchemy.com/v2/${alchemyApiKey}`);
      signerOrProvider = provider;
    }

    const contract = new ethers.Contract(contractAddress, contractABI, signerOrProvider);
    return contract;
  } catch (error) {
    console.error("Error loading contract:", error);
    toast({
      title: "Error",
      description: "Failed to connect to the blockchain. Please check your wallet and network settings.",
      variant: "destructive",
    });
    return null;
  }
};


// Function to upload image to IPFS using Pinata
export async function uploadImageToIPFS(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`, // Add Pinata JWT to .env
        },
        body: formData,
      });
      const data = await response.json();

      // return the cid directly
      if (data.IpfsHash) {
        return data.IpfsHash;
      }

      throw new Error("Failed to upload image to IPFS");
    } catch (error) {
      console.error("IPFS upload error:", error);
      throw error;
    }
  }

  export async function uploadToIPFS(encryptedText: string): Promise<string> {
    const blob = new Blob([encryptedText], { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", blob, "password.txt");
  
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: formData,
    });
  
    const result = await response.json();
    if (!result.IpfsHash) {
      throw new Error("Failed to get IPFS CID");
    }
    return result.IpfsHash;
  }

