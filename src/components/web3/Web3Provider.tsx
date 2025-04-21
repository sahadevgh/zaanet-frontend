
import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig, createConfig, http } from 'wagmi';
import { arbitrum, optimism } from 'wagmi/chains';

// Configure chains & providers with minimal setup
const config = createConfig({
  chains: [arbitrum, optimism],
  transports: {
    [arbitrum.id]: http(),
    [optimism.id]: http()
  },
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default Web3Provider;
