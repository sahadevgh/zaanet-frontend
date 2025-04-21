
// Common types for the ZaaNet application

export type WifiNetwork = {
  id: string;
  name: string;
  location: {
    city: string;
    area: string;
    lat: number;
    lng: number;
  };
  speed: number;
  price: string;
  hostWallet: string;
  password: string;
};

export interface Session {
  id: string;
  userId: string;
  networkId: string;
  startTime: Date;
  endTime: Date;
  paid: boolean;
  amount: string;
}

export interface User {
  walletAddress: string;
  sessions?: Session[];
  hostedNetworks?: WifiNetwork[];
}
