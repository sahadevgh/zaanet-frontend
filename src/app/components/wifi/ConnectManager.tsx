import React, { useEffect, useState } from 'react';
import { WifiNetwork } from '@/types';
import { ethers } from 'ethers';
import { X, Wifi, Clock, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { QRCodeCanvas } from 'qrcode.react';

type ConnectManagerProps = {
  isSetNetwork: WifiNetwork;
  setOpenConManagerModal: (value: boolean) => void;
  onConnect: (
    network: WifiNetwork,
    totalPrice: string,
    duration: string,
    onComplete: (result: { success: boolean; token?: string }) => void
  ) => void;
};


function ConnectManager({ isSetNetwork, setOpenConManagerModal, onConnect }: ConnectManagerProps) {
  const [duration, setDuration] = useState('1');
  const [calculatedPrice, setCalculatedPrice] = useState<string>('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { name, price } = isSetNetwork;

  useEffect(() => {
    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum <= 0) {
      setCalculatedPrice('0');
      return;
    }
    try {
      const priceWei = ethers.parseUnits(price.toString(), 18);
      const sessionPriceWei = priceWei * BigInt(durationNum);
      const sessionPrice = ethers.formatUnits(sessionPriceWei, 18);
      setCalculatedPrice(sessionPrice);
    } catch (error) {
      console.error('Price calculation error:', error);
      setCalculatedPrice('0');
    }
  }, [duration, price]);

  const handleConnectClick = async () => {
    if (onConnect) {
      setIsProcessing(true);
      onConnect(isSetNetwork, calculatedPrice, duration, (result) => {
        setIsProcessing(false);
        if (result.success && result.token) {
          setToken(result.token);
        }
      });
      
    }
  };

  const formattedAmount = Number(calculatedPrice).toFixed(6);

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
            {name || 'WiFi Network'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 bg-zaanet-purple-light">
          {!token ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-zaanet-purple mr-2" />
                  <Label htmlFor="duration-select" className="font-medium text-gray-700">
                    Select Connection Duration
                  </Label>
                </div>
                <Select value={duration} onValueChange={(value) => setDuration(value)}>
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
                  {formattedAmount}{' '}
                  <span className="text-sm font-normal text-gray-600">
                    USDT for {duration} hour{duration === '1' ? '' : 's'}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Base price: {price} USDT × {duration} hour{parseInt(duration) !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-red-500 mt-2">
                  Note: This contract only accepts USDT. Do not send ETH.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Access Token</h3>
              <p className="text-sm text-gray-600">
                Connect to &quot;{name}&quot; WiFi and scan this QR code or enter the token to authenticate.
              </p>
              <div className="flex justify-center">
                <QRCodeCanvas value={token} size={128} />
              </div>
              <p className="text-sm font-mono text-center break-all">{token}</p>
              <p className="text-xs text-gray-500 text-center">
                Expires at: {new Date(Date.now() + parseInt(duration) * 3600 * 1000).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 bg-gradient-to-l from-zaanet-purple to-zaanet-purple-light">
          {!token && (
            <Button
              className="w-full bg-purple-700 hover:bg-zaanet-dark-purple text-zaanet-purple-light transition-colors"
              disabled={isProcessing}
              onClick={handleConnectClick}
            >
              {isProcessing ? 'Processing...' : 'Connect Now'}
            </Button>
          )}
          <p className="text-xs text-center text-gray-500 mt-1">
            {token
              ? 'Close this modal and connect to WiFi to authenticate.'
              : "You'll be prompted to confirm this transaction in your wallet"}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ConnectManager;