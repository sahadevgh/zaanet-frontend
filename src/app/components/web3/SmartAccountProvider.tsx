'use client'

import { createContext, useContext, useState, ReactNode } from 'react';
import { loadContract } from '@/app/components/web3/contants/web3Funcs';

import { toast } from '@/hooks/use-toast';
import { initSmartAccountClient } from './accountAbstraction';
import { contract_Abi, contractAddress } from './contants/projectData';

type UserType = 'guest' | 'host' | 'admin';

interface SmartAccountContextType {
  address: string | null;
  isConnected: boolean;
  userType: UserType;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const SmartAccountContext = createContext<SmartAccountContextType | null>(null);

export const SmartAccountProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userType, setUserType] = useState<UserType>('guest');

  const connect = async () => {
    try {
      const client = await initSmartAccountClient();
      const addr = client.account.address;

      setAddress(addr);
      setIsConnected(true);

      const contract = await loadContract({
        contractAddress: contractAddress,
        contractABI: contract_Abi,
      });

      const isHost = await contract?.isHost(addr);
      const owner = await contract?.owner();

      const role: UserType =
        addr.toLowerCase() === owner.toLowerCase()
          ? 'admin'
          : isHost
          ? 'host'
          : 'guest';

      setUserType(role);

      toast({
        title: 'Connected',
        description: `Smart account: ${addr.slice(0, 6)}...${addr.slice(-4)} (${role})`,
      });
    } catch (err) {
      console.error('Connection failed:', err);
      toast({
        title: 'Error',
        description: 'Connection failed.',
        variant: 'destructive',
      });
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setUserType('guest');

    toast({
      title: 'Disconnected',
      description: 'Smart account disconnected.',
    });
  };

  return (
    <SmartAccountContext.Provider value={{ address, isConnected, userType, connect, disconnect }}>
      {children}
    </SmartAccountContext.Provider>
  );
};

export const useSmartAccount = () => {
  const context = useContext(SmartAccountContext);
  if (!context) throw new Error('useSmartAccount must be used within a SmartAccountProvider');
  return context;
};
