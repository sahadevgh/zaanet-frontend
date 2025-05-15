"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { CopyIcon, ExternalLinkIcon, Wallet as WalletIcon } from "lucide-react";
import { middleEllipsis } from "./middleEllipsis";
import { formatEther } from "viem";
import { toast } from "sonner";
import Link from "next/link";

interface WalletCardProps {
  address: string;
  balance: bigint | null;
  chainId: number;
  isLoading?: boolean;
  userType: string;
}

const WalletCard = ({
  address,
  balance,
  chainId,
  isLoading = false,
  userType,
}: WalletCardProps) => {
  const explorerArbUrl =
    chainId === 421614
      ? "https://sepolia.arbiscan.io/address/"
      : "https://arbiscan.io/address/";

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  console.log(balance)

  return (
    <Card className="w-full bg-blue-900 border-blue-100/25 rounded-xl shadow-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">Wallet Balance</h3>
          <div className="flex items-center gap-1 text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            Connected
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-blue-100 truncate">Address</div>
          <div className="flex items-center justify-between bg-black/50 rounded-lg p-3">
            <div className="font-mono text-white">
              {address}
            </div>
            <div className="flex gap-1">
              <Button
                variant="default"
                size="default"
                onClick={copyAddress}
              >
                <CopyIcon size={16} />
              </Button>
              <Button
                variant="default"
                size="default"
                asChild
              >
                <a
                  href={`${explorerArbUrl}${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon size={16} />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-blue-100">Balance</div>
          <div className="bg-black/50 rounded-lg p-4">
            {isLoading || balance === null ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold text-blue-100">
                  {formatEther(balance)}
                </div>
                <div className="text-gray-400">USDT</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href={`/${userType}/dashboard/fund`}>
          <Button
            className="w-full bg-zaanet-green h-12 font-bold"
          >
            <WalletIcon className="h-4 w-4 mr-2" />
            Fund Wallet
          </Button> 
          </Link>
      
          <Button
            variant="outline"
            className="h-12"
            onClick={() => (window.location.href = "/dapps")}
          >
            Explore dApps
          </Button>
        </div>
      </CardContent>
      <CardFooter className="bg-black/30 p-3">
        <div className="text-xs text-gray-400">
          Network: {chainId === 421614 ? "Arbitrum Sepolia" : "Arbitrum One"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default WalletCard;