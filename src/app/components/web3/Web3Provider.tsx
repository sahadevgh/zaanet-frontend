'use client'

import { useEffect, useRef, useState } from 'react';
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
import { contract_Abi, contractAddress, loadContract } from '@/app/components/web3/contants';
import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';

interface ConnectBtnProps {
  backgroundColor?: string;
  emoji?: string;
  isConnected: boolean;
  address: string | undefined;
}

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
  const [userType, setUserType] = useState<'guest' | 'host' | 'admin'>('guest');
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  async function checkRoleType(address: string): Promise<'guest' | 'host' | 'admin'> {
    try {
      const contract = await loadContract({
        contractAddress,
        contractABI: contract_Abi,
      });
      if (!contract) {
        throw new Error('Failed to load contract');
      }
      const isHost = await contract.isHost(address);
      const owner = await contract.owner();
      if (address.toLowerCase() === owner.toLowerCase()) {
        return 'admin';
      } else if (isHost) {
        return 'host';
      }
      return 'guest';
    } catch (error) {
      console.error('Error checking role:', error);
      return 'guest';
    }
  }

  useEffect(() => {
    if (isConnected && address && chain?.id === Number(process.env.NEXT_PUBLIC_CHAIN_ID)) {
      checkRoleType(address).then((role) => {
        if (isMounted.current) {
          setUserType(role);
          toast({
            title: 'Role Detected',
            description: `Logged in as ${role}.`,
          });
        }
      });
    } else if (isConnected && chain?.id !== Number(process.env.NEXT_PUBLIC_CHAIN_ID)) {
      toast({
        title: 'Network Mismatch',
        description: 'Please switch to the Sepolia network.',
        variant: 'destructive',
      });
    }
  }, [isConnected, address, chain]);

  const handleConnectClick = async () => {
    if (isConnected) {
      try {
        disconnect();
        setUserType('guest');
        toast({
          title: 'Disconnected',
          description: 'Wallet disconnected successfully.',
        });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to disconnect wallet.',
          variant: 'destructive',
        });
      }
      return;
    }

    try {
      await openConnectModal?.();
      toast({
        title: 'Connected',
        description: 'Wallet connected successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to connect wallet.',
        variant: 'destructive',
      });
    }
  };

  if (!isConnected) {
    return (
      <ConnectButton
        onClick={handleConnectClick}
        disabled={isConnecting}
        variant="outline"
        size="lg"
        className={cn(
          "relative overflow-hidden",
          "hover:bg-zaanet-purple-dark hover:border-zaanet-purple-dark hover:text-zaanet-purple-light",
          "transition-all duration-300 ease-out transform hover:scale-[1.02]",
          "focus:outline-none focus:ring-2 focus:ring-zaanet-purple focus:ring-offset-2",
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

  if (isConnected && chain?.id !== Number(process.env.NEXT_PUBLIC_CHAIN_ID)) {
    return (
      <Button
        onClick={openChainModal}
        className={cn(
          "bg-red-500 hover:bg-red-600 text-white",
          "transition-all duration-300 ease-out transform hover:scale-[1.02]",
          "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        )}
      >
        Wrong Network
      </Button>
    );
  }

  return (
    <div className="relative">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label="User menu"
        className={cn(
          "h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden",
          "cursor-pointer transition-transform duration-300",
          "focus:outline-none focus:ring-2 focus:ring-zaanet-purple focus:ring-offset-2"
        )}
        style={{
          backgroundColor,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        onKeyDown={(e) => e.key === 'Enter' && setDropdownOpen(!dropdownOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xl">{emoji}</span>
      </motion.div>

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