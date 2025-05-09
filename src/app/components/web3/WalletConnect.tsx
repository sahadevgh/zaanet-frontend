'use client'

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ConnectButton } from './ConnectButton';
import { LoadingSpinner } from '@/lib/LoadingSpinner';
import DropdownMenu from '../layout/DropdownMenu';
import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';
import { useSmartAccount } from './SmartAccountProvider';
import { emojiAvatarForAddress } from './emojiAvatarForAddress';

interface ConnectBtnProps {
  backgroundColor?: string;
  emoji?: string;
}

export const ConnectBtn = ({
}: ConnectBtnProps) => {
  const { isConnected, userType, address, connect, disconnect } = useSmartAccount();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const isMounted = useRef(false);
  const { color: backgroundColor, emoji } = emojiAvatarForAddress(address ?? '');

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connect();
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isConnected) {
    return (
      <ConnectButton
        onClick={handleConnect}
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
              <span>Login with Web3Auth</span>
            </>
          )}
        </div>
      </ConnectButton>
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
        userType={userType}
        onDisconnect={disconnect}
      />
    </div>
  );
};
