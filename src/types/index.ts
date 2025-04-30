
// Common types for the ZaaNet application

export type WifiNetwork = {
  id: string;
  name: string;
  description: string;
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
  imageCID: string;
  hasPaid?: boolean;
  type: string;
  wifispeed?: number;
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

export interface HostForm {
  ssid: string;
  password: string;
  location: {
    country: string;
    city: string;
    area: string;
    lat: number;
    lng: number;
  };
  speed: number;
  price: number;
  description?: string;
  image?: File;
}