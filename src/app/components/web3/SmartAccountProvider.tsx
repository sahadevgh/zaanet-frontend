"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { initSmartAccountClient } from "./accountAbstraction";
import {
  network_Abi,
  zaanetNetwork_CA,
  ZERODEV_RPC,
} from "./contants/projectData";
import { getContract, http } from "viem";
import { createPublicClient } from "viem";
import { arbitrumSepolia } from "viem/chains";

type UserType = "guest" | "host" | "admin";

interface SmartAccountContextType {
  address: string | null;
  isConnected: boolean;
  userType: UserType;
  connect: (forceModal?: boolean) => Promise<void>;
  disconnect: () => void;
}

const SmartAccountContext = createContext<SmartAccountContextType | null>(null);

export const SmartAccountProvider = ({ children, cookie }: { children: ReactNode, cookie: string | null }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userType, setUserType] = useState<UserType>("guest");

  const connect = async (forceModal = false) => {
    try {
      const client = await initSmartAccountClient(forceModal);
      const addr = client.account.address;

      setAddress(addr);
      setIsConnected(true);
      localStorage.setItem("smartAccountConnected", "true"); // store flag

      // Prepare viem clients
      const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http(ZERODEV_RPC),
      });

      // Smart account client for write
      const networkContract = getContract({
        address: zaanetNetwork_CA as `0x${string}`,
        abi: network_Abi,
        client, // smart account client
      });

      // Public client for read-only
      const adminContract = getContract({
        address: zaanetNetwork_CA as `0x${string}`,
        abi: network_Abi,
        client: publicClient,
      });

      // Check roles
      const admin = await adminContract.read.owner();
      const isHost = await networkContract.read.isRegisteredHost([addr]);

      // Ensure admin is a string before using toLowerCase
      const adminAddress = typeof admin === "string" ? admin : String(admin);

      let role: UserType =
        addr.toLowerCase() === adminAddress.toLowerCase()
          ? "admin"
          : isHost
          ? "host"
          : "guest";

      // If cookie exists and has a valid role, use it instead
      if (cookie && ["guest", "host", "admin"].includes(cookie)) {
        role = cookie as UserType;
      }

      setUserType(role);

      toast({
        title: "Connected",
        description: `Smart account: ${addr.slice(0, 6)}...${addr.slice(
          -4
        )} (${role})`,
      });
    } catch (err) {
      console.error("Connection failed:", err);
      toast({
        title: "Error",
        description: "Connection failed.",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setUserType("guest");
    localStorage.removeItem("smartAccountConnected"); // clear flag

    toast({
      title: "Disconnected",
      description: "Smart account disconnected.",
    });
  };

  // Auto-reconnect on reload if flag exists
  useEffect(() => {
    const shouldReconnect = localStorage.getItem("smartAccountConnected");
    if (shouldReconnect && !isConnected) {
      connect(); // silent reconnect
    }
  }, []);

  return (
    <SmartAccountContext.Provider
      value={{ address, isConnected, userType, connect, disconnect }}
    >
      {children}
    </SmartAccountContext.Provider>
  );
};

export const useSmartAccount = () => {
  const context = useContext(SmartAccountContext);
  if (!context)
    throw new Error(
      "useSmartAccount must be used within a SmartAccountProvider"
    );
  return context;
};
