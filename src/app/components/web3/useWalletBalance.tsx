import { useEffect, useState } from "react";
import { createPublicClient, http, formatEther, type Address } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { readContract } from "viem/actions";
import { tokenContractAddress } from "@/app/components/web3/contants/projectData";
import { usdtAbi } from "@/app/components/web3/contants/projectData";

// Chain configuration
const chain = arbitrumSepolia;

// Public client for chain queries
export const publicClient = createPublicClient({
  chain,
  transport: http(),
});

// Hook to get balance
export function useWalletBalance(address: Address | null) {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUSDTBalance = async () => {
      if (!address) return;

      setIsLoading(true);
      try {
        const result = await readContract(publicClient, {
          abi: usdtAbi,
          address: tokenContractAddress,
          functionName: "balanceOf",
          args: [address],
        });
        setBalance(result as bigint);
      } catch (error) {
        console.error("Error fetching USDT balance:", error);
        setBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUSDTBalance();
  }, [address]);

  return { balance, isLoading };
}
