"use client"

import React from 'react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { ConnectBtn } from '../web3/Web3Provider';
import { useAccount } from 'wagmi';
import { emojiAvatarForAddress } from '../web3/emojiAvatarForAddress';

const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { color: backgroundColor, emoji } = emojiAvatarForAddress(address ?? '');
  
  return (
    <header className="bg-black/80 backdrop-blur-md border-b border-blue-300 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <Link 
          href="/" 
          className="flex items-center space-x-1 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-300 to-blue-100 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
            <span className="text-blue-600 font-bold text-xl">Z</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-100 bg-clip-text text-transparent">
            ZaaNet
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/browse" 
            className="text-blue-100 hover:text-blue-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-400 hover:after:w-full after:transition-all"
          >
            Browse Networks
          </Link>
          <Link 
            href="/host-network" 
            className="text-blue-100 hover:text-blue-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-400 hover:after:w-full after:transition-all"
          >
            Host a Network
          </Link>
          <Link 
            href="/litepaper" 
            className="text-blue-100 hover:text-blue-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-400 hover:after:w-full after:transition-all"
          >
            Litepaper
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
      <ConnectBtn
            backgroundColor={backgroundColor}
            emoji={emoji}
            isConnected={isConnected}
            address={address}
          />
          <button 
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors",
              "hover:bg-gray-100 active:bg-gray-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            )} 
            title="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;