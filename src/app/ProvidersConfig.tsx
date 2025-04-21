'use client';

import { WagmiProvider, cookieToInitialState } from "wagmi";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { config } from "@/components/web3/Config";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css';



const queryClient = new QueryClient();

interface ProvidersConfigProps {
  children: React.ReactNode;
  cookie?: string | null;
}

function ProvidersConfig({ children, cookie }: ProvidersConfigProps) {
  const initialState = cookieToInitialState(config, cookie);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#0E76FD",
              accentColorForeground: "white",
              borderRadius: "large",
              fontStack: "system",
              overlayBlur: "small",
            })}>
            {children}
          </RainbowKitProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default ProvidersConfig;
