'use client'

import { useEffect, useState } from 'react';
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from '@rainbow-me/rainbowkit';
import { useDisconnect, useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/app/components/ui/button';
import { ConnectButton } from './ConnectButton';
import { LoadingSpinner } from '@/lib/LoadingSpinner';
import DropdownMenu from '../layout/DropdownMenu';
import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';
import { loadContract } from './contants/web3Funcs';
import { admin_Abi, network_Abi, zaanetAdmin_CA, zaanetNetwork_CA } from './contants/projectData';

type UserType = 'guest' | 'host' | 'admin';

interface ConnectBtnProps {
  backgroundColor?: string;
  emoji?: string;
  isConnected: boolean;
  address: string | undefined;
}

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

export const ConnectBtn = ({
  backgroundColor,
  emoji = '👤',
  isConnected,
  address,
}: ConnectBtnProps) => {
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const { disconnect } = useDisconnect();
  const { isConnecting, chain } = useAccount();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userType, setUserType] = useState<UserType>('guest');

  const isCorrectNetwork = chain?.id === CHAIN_ID;

  // Check user role on blockchain
  const checkUserRole = async (userAddress: string): Promise<UserType> => {
    try {
      const [adminContract, networkContract] = await Promise.all([
        loadContract({
          contractAddress: zaanetAdmin_CA,
          contractABI: admin_Abi,
          withSigner: false,
        }),
        loadContract({
          contractAddress: zaanetNetwork_CA,
          contractABI: network_Abi,
          withSigner: false,
        })
      ]);

      if (!adminContract || !networkContract) {
        throw new Error('Failed to load contracts');
      }

      const [isHost, adminAddress] = await Promise.all([
        networkContract.isHost(userAddress),
        adminContract?.admin()
      ]);

      const normalizedUserAddress = userAddress.toLowerCase();
      const normalizedAdminAddress = adminAddress.toLowerCase();

      if (normalizedUserAddress === normalizedAdminAddress) return 'admin';
      if (isHost && normalizedUserAddress !== normalizedAdminAddress) return 'host';
      return 'guest';
      
    } catch (error) {
      console.error('Error checking user role:', error);
      return 'guest';
    }
  };

  // Handle wallet connection
  const handleConnect = async () => {
    if (isConnected) {
      disconnect();
      setUserType('guest');
      toast({
        title: 'Disconnected',
        description: 'Wallet disconnected successfully.',
      });
      return;
    }

    try {
      await openConnectModal?.();
    } catch {
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect wallet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Update user role when connection state changes
  useEffect(() => {
    if (!isConnected || !address) {
      setUserType('guest');
      return;
    }

    if (!isCorrectNetwork) {
      toast({
        title: 'Wrong Network',
        description: 'Please switch to the correct network.',
        variant: 'destructive',
      });
      return;
    }

    checkUserRole(address).then(role => {
      setUserType(role);
      toast({
        title: 'Connected',
        description: `Logged in as ${role}.`,
      });
    });
  }, [isConnected, address, isCorrectNetwork]);

  // Show connect button when not connected
  if (!isConnected) {
    return (
      <ConnectButton
        onClick={handleConnect}
        disabled={isConnecting}
        variant="outline"
        size="lg"
        className={cn(
          "relative overflow-hidden",
          "transition-all duration-300 ease-out hover:scale-[1.02]",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2">
          {isConnecting ? (
            <>
              <LoadingSpinner />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </>
          )}
        </div>
      </ConnectButton>
    );
  }

  // Show network switch button when on wrong network
  if (!isCorrectNetwork) {
    return (
      <Button
        onClick={openChainModal}
        className={cn(
          "bg-red-500 hover:bg-red-600 text-white",
          "transition-all duration-300 ease-out hover:scale-[1.02]",
          "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        )}
      >
        Switch Network
      </Button>
    );
  }

  // Show user avatar with dropdown when connected and on correct network
  return (
    <div className="relative">
      <motion.button
        type="button"
        aria-label="User menu"
        className={cn(
          "h-11 w-11 rounded-xl flex items-center justify-center",
          "cursor-pointer transition-transform duration-300",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        )}
        style={{
          backgroundColor,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        }}
        onClick={() => setDropdownOpen(prev => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xl">{emoji}</span>
      </motion.button>

      <DropdownMenu
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        openAccountModal={openAccountModal}
        openChainModal={openChainModal}
        userType={userType}
      />
    </div>
  );
};