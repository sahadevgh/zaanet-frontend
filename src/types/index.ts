
// Common types for the ZaaNet application

export type WifiNetwork = {
  id: string;
  metaDataCID: string;
  price: string;
  hostWallet: string;
  hasPaid?: boolean;
  createdAt: Date;
  updatedAt: Date;
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