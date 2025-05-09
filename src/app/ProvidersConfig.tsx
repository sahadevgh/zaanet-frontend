'use client'

import { Toaster } from "@/app/components/ui/toaster";
import { Toaster as Sonner } from "@/app/components/ui/sonner";
import { TooltipProvider } from "@/app/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { SmartAccountProvider } from "./components/web3/SmartAccountProvider";

interface ProvidersConfigProps {
  children: React.ReactNode;
}

function ProvidersConfig({ children }: ProvidersConfigProps) {
  const queryClient = new QueryClient();

  return (
    <SmartAccountProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
    </SmartAccountProvider>
  );
}

export default ProvidersConfig;
