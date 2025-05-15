
// Common types for the ZaaNet application

export type WifiNetwork = {
  id: string;
  metadataCID: string;
  price: number;
  hostWallet: string;
  ratingCount: number;
  successfullSessions: number;
  totalRating: number;
  status: string;
  ssid: string;
  name: string;
  location: {
    country: string;
    city: string;
    area: string;
    lat: number;
    lng: number;
  };
  speed: number;
  description?: string;
  image?: File;
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