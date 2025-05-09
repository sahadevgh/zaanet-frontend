"use client"

import React from 'react';
import Link from 'next/link';
import { ConnectBtn } from '../web3/WalletConnect';
import { cn } from "@/lib/utils";

const Header: React.FC = () => {

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <Link 
          href="/" 
          className="flex items-center space-x-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zaanet-purple to-zaanet-purple-dark flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-zaanet-purple to-zaanet-purple-dark bg-clip-text text-transparent">
            ZaaNet
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/browse" 
            className="text-gray-600 hover:text-zaanet-purple transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-zaanet-purple hover:after:w-full after:transition-all"
          >
            Browse Networks
          </Link>
          <Link 
            href="/host-network" 
            className="text-gray-600 hover:text-zaanet-purple transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-zaanet-purple hover:after:w-full after:transition-all"
          >
            Host a Network
          </Link>
          <Link 
            href="/litepaper" 
            className="text-gray-600 hover:text-zaanet-purple transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-zaanet-purple hover:after:w-full after:transition-all"
          >
            Litepaper
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <ConnectBtn />
          
          <button 
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors",
              "hover:bg-gray-100 active:bg-gray-200",
              "focus:outline-none focus:ring-2 focus:ring-zaanet-purple focus:ring-offset-2"
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