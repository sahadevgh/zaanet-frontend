"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { toast } from "sonner";
import { useSmartAccount } from "../../web3/SmartAccountProvider";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Copy, QrCode, ArrowLeft, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Lazy load QR code component
const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

// Using @transak/transak-sdk
declare global {
  interface Window {
    Transak: any;
  }
}

const Fund = () => {
  const { address, isConnected, userType, connect } = useSmartAccount();
  const router = useRouter();
  const [isTransakLoaded, setIsTransakLoaded] = useState(false);
  const [isTransakOpen, setIsTransakOpen] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const transakInstance = useRef<any>(null);

  useEffect(() => {
    if (!isConnected) {
      connect(true);
    }
  }, [isConnected]);

  useEffect(() => {
    // Load Transak script
    const script = document.createElement("script");
    script.src = "https://global.transak.com/sdk/v1.1/widget.js";
    script.async = true;
    script.onload = () => setIsTransakLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (transakInstance.current) {
        transakInstance.current.close();
      }
      document.body.removeChild(script);
    };

    // Check connection status
  }, [isConnected, router, address]);

  const openTransak = () => {
    if (!isTransakLoaded || !address) {
      toast.error("Unable to open funding widget. Please try again.");
      return;
    }

    const config = {
      //   ...TRANSAK_CONFIG,
      walletAddress: address,
    };

    transakInstance.current = new window.Transak("STAGING");
    transakInstance.current.init(config);
    transakInstance.current.on("TRANSAK_WIDGET_OPEN", () =>
      setIsTransakOpen(true)
    );
    transakInstance.current.on("TRANSAK_WIDGET_CLOSE", () =>
      setIsTransakOpen(false)
    );
    transakInstance.current.on("TRANSAK_ORDER_CREATED", (data: any) => {
      console.log("Order created:", data);
    });
    transakInstance.current.on("TRANSAK_ORDER_SUCCESSFUL", (data: any) => {
      console.log("Order successful:", data);
      toast.success("Your wallet has been funded successfully!");
      setTimeout(() => router.push("/dashboard"), 2000);
    });
  };

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success("Wallet address copied to clipboard");
  };

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.push(`/${userType}/dashboard`)}
        className="mb-6 bg-zaanet-purple text-white hover:bg-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-zaanet-purple-dark mb-2">
            Fund Your Wallet{" "}
          </h1>
          <p className="text-gray-700">
            Add USDT to your Arbitrum wallet using any method below{" "}
          </p>
        </motion.div>
        {/* Main Funding Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-full">
          <Card className="bg-zaanet-purple-dark border-gray-700 rounded-xl shadow-lg mb-8 col-span-2 h-full">
            <CardHeader>
              <CardTitle className="text-xl text-white">Deposit USDT</CardTitle>
              <CardDescription className="text-gray-300">
                Send USDT to your wallet address on Arbitrum One
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Address Display */}
              <div className="space-y-2">
                <div className="text-sm text-gray-300">Your wallet address</div>
                <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                  <div className="font-mono text-white truncate">
                    {address || "No wallet address found"}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowQrCode(!showQrCode)}
                      className="text-gray-300 hover:text-white h-9 w-9"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyAddress}
                      className="text-gray-300 hover:text-white h-9 w-9"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              {showQrCode && address && (
                <div className="flex flex-col items-center p-4 bg-gray-700/30 rounded-lg">
                  <div className="mb-4 p-2 bg-white rounded">
                    <QRCode value={address} size={160} level="H" />
                  </div>
                  <p className="text-sm text-gray-300 text-center">
                    Scan this QR code to send USDT to your wallet
                  </p>
                </div>
              )}

              {/* Network Warning */}
              <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-100 text-sm">
                      Important
                    </h4>
                    <p className="text-xs text-yellow-300">
                      Make sure to send only USDT on the Arbitrum One network.
                      Sending other assets or using wrong network may result in
                      permanent loss.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={openTransak}
                  disabled={!isTransakLoaded || !address || isTransakOpen}
                  className="bg-zaanet-green hover:bg-zaanet-purple text-white h-12"
                >
                  {isTransakLoaded ? "Buy with Card/Bank" : "Loading..."}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/${userType}/dashboard`)}
                  className="border-gray-600 text-white hover:bg-gray-700 h-12"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Info Cards */}
          <div className="grid grid-cols-1 gap-4 h-full">
            <Card className="bg-zaanet-purple-dark border-gray-700 rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  What is USDT?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200">
                  USDT (Tether) is a stablecoin pegged to the US dollar. It's
                  the primary currency used for transactions on the Arbitrum
                  network.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zaanet-purple-dark border-gray-700 rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Funding Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-200 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Buy directly with credit/debit card</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Send from another wallet (QR or address)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Receive from exchanges like Binance or Coinbase</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fund;
