'use client';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Web3Provider from "@/components/web3/Web3Provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const queryClient = new QueryClient();

interface ProvidersConfigProps {
  children: React.ReactNode;
}

function ProvidersConfig({ children }: ProvidersConfigProps) {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </Web3Provider>
      </QueryClientProvider>
    </div>
  );
}

export default ProvidersConfig;
