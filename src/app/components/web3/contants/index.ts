"use client"

import { ethers } from "ethers";
import { toast } from "@/hooks/use-toast";

export const contractAddress = "0x72AD0FAb5b1046b1A95a3f6a1664431E85F561aa";

export const contract_Abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "EnforcedPause",
    type: "error",
  },
  {
    inputs: [],
    name: "ExpectedPause",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newFeePercent",
        type: "uint256",
      },
    ],
    name: "FeePercentUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "hostAddress",
        type: "address",
      },
    ],
    name: "HostDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "hostAddress",
        type: "address",
      },
    ],
    name: "HostedNetworkUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "hostAddress",
        type: "address",
      },
    ],
    name: "NewNetworkHosted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "PaymentReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_HOSTS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "acceptPayment",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "deleteHostedNetwork",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getHostedNetworkById",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "hostAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "passwordCID",
            type: "string",
          },
          {
            components: [
              {
                internalType: "string",
                name: "city",
                type: "string",
              },
              {
                internalType: "string",
                name: "country",
                type: "string",
              },
              {
                internalType: "string",
                name: "area",
                type: "string",
              },
              {
                internalType: "string",
                name: "latitude",
                type: "string",
              },
              {
                internalType: "string",
                name: "longitude",
                type: "string",
              },
            ],
            internalType: "struct ZaanetContract.Location",
            name: "location",
            type: "tuple",
          },
          {
            internalType: "string",
            name: "wifispeed",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "string",
            name: "imageCID",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
        ],
        internalType: "struct ZaanetContract.ZaanetHost",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_host",
        type: "address",
      },
    ],
    name: "getHostedNetworksByAddress",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "hostAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "passwordCID",
            type: "string",
          },
          {
            components: [
              {
                internalType: "string",
                name: "city",
                type: "string",
              },
              {
                internalType: "string",
                name: "country",
                type: "string",
              },
              {
                internalType: "string",
                name: "area",
                type: "string",
              },
              {
                internalType: "string",
                name: "latitude",
                type: "string",
              },
              {
                internalType: "string",
                name: "longitude",
                type: "string",
              },
            ],
            internalType: "struct ZaanetContract.Location",
            name: "location",
            type: "tuple",
          },
          {
            internalType: "string",
            name: "wifispeed",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "string",
            name: "imageCID",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
        ],
        internalType: "struct ZaanetContract.ZaanetHost[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getPasswordCID",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "hasPaid",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_passwordCID",
        type: "string",
      },
      {
        internalType: "string",
        name: "_city",
        type: "string",
      },
      {
        internalType: "string",
        name: "_country",
        type: "string",
      },
      {
        internalType: "string",
        name: "_area",
        type: "string",
      },
      {
        internalType: "string",
        name: "_latitude",
        type: "string",
      },
      {
        internalType: "string",
        name: "_longitude",
        type: "string",
      },
      {
        internalType: "string",
        name: "_wifispeed",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
      {
        internalType: "string",
        name: "_imageCID",
        type: "string",
      },
    ],
    name: "hostANetwork",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "hostedNetworkById",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "hostAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "passwordCID",
        type: "string",
      },
      {
        components: [
          {
            internalType: "string",
            name: "city",
            type: "string",
          },
          {
            internalType: "string",
            name: "country",
            type: "string",
          },
          {
            internalType: "string",
            name: "area",
            type: "string",
          },
          {
            internalType: "string",
            name: "latitude",
            type: "string",
          },
          {
            internalType: "string",
            name: "longitude",
            type: "string",
          },
        ],
        internalType: "struct ZaanetContract.Location",
        name: "location",
        type: "tuple",
      },
      {
        internalType: "string",
        name: "wifispeed",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "imageCID",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "hostedNetworksByAddress",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "hostAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "passwordCID",
        type: "string",
      },
      {
        components: [
          {
            internalType: "string",
            name: "city",
            type: "string",
          },
          {
            internalType: "string",
            name: "country",
            type: "string",
          },
          {
            internalType: "string",
            name: "area",
            type: "string",
          },
          {
            internalType: "string",
            name: "latitude",
            type: "string",
          },
          {
            internalType: "string",
            name: "longitude",
            type: "string",
          },
        ],
        internalType: "struct ZaanetContract.Location",
        name: "location",
        type: "tuple",
      },
      {
        internalType: "string",
        name: "wifispeed",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "imageCID",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isHost",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "networkIdCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "networkIdsByAddress",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "totalEarnedByAddress",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "totalEarnedByHostedNetwork",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "passwordCID",
            type: "string",
          },
          {
            internalType: "string",
            name: "city",
            type: "string",
          },
          {
            internalType: "string",
            name: "country",
            type: "string",
          },
          {
            internalType: "string",
            name: "area",
            type: "string",
          },
          {
            internalType: "string",
            name: "latitude",
            type: "string",
          },
          {
            internalType: "string",
            name: "longitude",
            type: "string",
          },
          {
            internalType: "string",
            name: "wifispeed",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "string",
            name: "imageCID",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
        ],
        internalType: "struct ZaanetContract.UpdateNetworkParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "updateHostedNetwork",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newFeePercent",
        type: "uint256",
      },
    ],
    name: "updateZaanetFeePercent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "zaanetFeePercent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];


// Function to load the contract
export const loadContract = async ({
  contractAddress,
  contractABI,
}: {
  contractAddress: string;
  contractABI: ethers.InterfaceAbi;
}) => {
  try {
    if (!window.ethereum) {
      toast({
        title: "Error",
        description: "Please install MetaMask or another Ethereum wallet.",
        variant: "destructive",
      });
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Check network (e.g., ensure it's the correct chain)
    const network = await provider.getNetwork();
    const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID || "421614"; // Arbitrum sepolia
    if (network.chainId.toString() !== expectedChainId) {
      toast({
        title: "Wrong Network",
        description: `Please switch to Arbitrum Sepolia (Chain ID: ${expectedChainId}).`,
        variant: "destructive",
      });
      return;
    }

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    return contract;
  } catch (error) {
    console.error("Error loading contract:", error);
    toast({
      title: "Error",
      description: "Failed to connect to the blockchain. Please try again.",
      variant: "destructive",
    });
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
  