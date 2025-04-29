import React, { useEffect, useState } from "react";
import { WifiNetwork } from "@/types";
import { ethers } from "ethers";
import { X, Wifi, Clock, DollarSign } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "../ui/select";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

type ConnectManagerProps = {
  isSetNetwork: WifiNetwork;
  setOpenConManagerModal: (value: boolean) => void;
  onConnect?: (
    network: WifiNetwork,
    totalPrice: number,
    onComplete: (success: boolean) => void
  ) => void;
};

function ConnectManager({
  isSetNetwork,
  setOpenConManagerModal,
  onConnect,
}: ConnectManagerProps) {
  const [duration, setDuration] = useState("1");
  const [calculatedPrice, setCalculatedPrice] = useState<string>("0");
  const [isProcessing, setIsProcessing] = useState(false);
  const { name, price } = isSetNetwork;

  // Calculate price based on duration
  useEffect(() => {
    // const priceInETH = ethers.parseEther(price.toString());
    const sessionPrice = parseInt(duration, 10) * Number(price);

    // Format the price for display with 6 decimal places max
    const formattedPrice = sessionPrice;
    // const trimmedPrice = parseFloat(formattedPrice).toFixed(6);
    setCalculatedPrice(formattedPrice.toString());
  }, [duration, price]);

  // Handle connection
  const handleConnectClick = (totalPrice: number) => {
    if (onConnect) {
      setIsProcessing(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onConnect(isSetNetwork, totalPrice, (success: boolean) => {
        setIsProcessing(false); // Reset on completion (success or failure)
      });
    }
  };

  const calculatedPriceInWei = ethers.parseUnits(
    Number(calculatedPrice).toFixed(18), 
    18
  );
  
  const formattedAmount = ethers.formatUnits(calculatedPriceInWei, 18);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-0">
      <Card className="border-2 border-zaanet-purple/20 shadow-lg md:w-3xl">
        <CardHeader className="relative bg-gradient-to-r from-zaanet-purple to-zaanet-purple-light rounded-t-lg pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenConManagerModal(false)}
            className="absolute right-4 top-4 text-gray-600 hover:text-gray-900 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center mb-2">
            <div className="bg-zaanet-purple/10 p-2 rounded-full mr-3">
              <Wifi className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-white">
              Connect to Network
            </CardTitle>
          </div>
          <CardDescription className="text-white text-xl">
            {name || "WiFi Network"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 bg-zaanet-purple-light">
          <div className="space-y-3">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-zaanet-purple mr-2" />
              <Label
                htmlFor="duration-select"
                className="font-medium text-gray-700"
              >
                Select Connection Duration
              </Label>
            </div>
            <Select
              value={duration}
              onValueChange={(value) => setDuration(value)}
            >
              <SelectTrigger
                id="duration-select"
                className="w-full border-zaanet-purple/20 focus:ring-zaanet-purple bg-zaanet-purple"
              >
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-zaanet-purple-dark text-zaanet-purple-light">
                <SelectItem value="1">1 Hour</SelectItem>
                <SelectItem value="2">2 Hours</SelectItem>
                <SelectItem value="3">3 Hours</SelectItem>
                <SelectItem value="6">6 Hours</SelectItem>
                <SelectItem value="12">12 Hours</SelectItem>
                <SelectItem value="24">24 Hours (1 Day)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <DollarSign className="h-5 w-5 text-zaanet-purple mr-2" />
              <h3 className="font-medium text-gray-700">Total Price</h3>
            </div>
            <p className="text-2xl font-bold text-zaanet-purple">
              {ethers.parseUnits(formattedAmount)}{" "}
              <span className="text-sm font-normal text-gray-600">USDT</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Base price: {price} USDT × {duration} hour
              {parseInt(duration) !== 1 ? "s" : ""}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 bg-gradient-to-l from-zaanet-purple to-zaanet-purple-light">
          <Button
            className="w-full bg-purple-700 hover:bg-zaanet-dark-purple text-zaanet-purple-light transition-colors"
            disabled={isProcessing}
            onClick={() => {
              setOpenConManagerModal(false);
              handleConnectClick(parseFloat(calculatedPrice));
            }}
          >
            {isProcessing ? "Processing..." : "Connect Now"}
          </Button>
          <p className="text-xs text-center text-gray-500 mt-1">
            You&apos;ll be prompted to confirm this transaction in your wallet
          </p>
        </CardFooter>
      </Card>
      {/* </AnimatedContainer> */}
    </div>
  );
}

export default ConnectManager;
