"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { toast } from "sonner";
import { Copy, QrCode, Wallet, Wifi, Edit, Eye, EyeOff } from "lucide-react";
import type { WifiNetwork } from "@/types";
import Layout from "../Layout";
import { createPublicClient, formatUnits, getContract, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
// import {
//   network_Abi,
//   storage_Abi,
//   zaanetNetwork_CA,
//   zaanetStorage_CA,
//   ZERODEV_RPC,
// } from "../../web3/contants/projectData";
// import { useSmartAccount } from "../../web3/SmartAccountProvider";

export default function HostDashboard() {
  // const { address } = useSmartAccount();
  const [editingNetwork, setEditingNetwork] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableNetworks, setAvailableNetworks] = useState<WifiNetwork[]>([]);
  const [hostEarnings, setHostEarnings] = useState<number>(0);

  // Functiion to fetch networks for the host from the blockchain
  // const fetchHostNetworks = async () => {
  //   setIsLoading(true);
  //   try {
  //     const publicClient = createPublicClient({
  //       chain: arbitrumSepolia,
  //       transport: http(ZERODEV_RPC),
  //     });

  //     const networkContract = getContract({
  //       address: zaanetNetwork_CA as `0x${string}`,
  //       abi: network_Abi,
  //       client: publicClient,
  //     });

  //     const storageContract = getContract({
  //       address: zaanetStorage_CA as `0x${string}`,
  //       abi: storage_Abi,
  //       client: publicClient,
  //     });

  //     // Get the total earnings for the host
  //     const earnings = await storageContract.read.getHostEarnings([address]);

  //     setHostEarnings(
  //       Number(formatUnits(BigInt(earnings as string | number | bigint), 18))
  //     );

  //     // Get all networks IDs hosted by the user
  //     const hostedNetworkIds = (await networkContract.read.getHostNetworks([
  //       address,
  //     ])) as number[];

  //     const networkPromises = [];
  //     for (let i = 0; i < hostedNetworkIds.length; i++) {
  //       networkPromises.push(
  //         networkContract.read.getHostedNetworkById([hostedNetworkIds[i]])
  //       );
  //     }

  //     const networksRaw = (await Promise.all(networkPromises)) as {
  //       id: number;
  //       metadataCID: string;
  //       price: number | string;
  //       host: string;
  //       isActive: boolean;
  //       ratingCount: number;
  //       successfullSessions: number;
  //       totalRating: number;
  //     }[];

  //     const metadataPromises = networksRaw.map((network) =>
  //       fetch(`https://ipfs.io/ipfs/${network.metadataCID}`)
  //         .then((res) => res.json())
  //         .catch(() => ({}))
  //     );

  //     const metadataList = await Promise.all(metadataPromises);

  //     const networks: WifiNetwork[] = networksRaw
  //       .filter((n) => n.id !== 0 && n.isActive)
  //       .map((network, i) => ({
  //         id: network.id.toString(),
  //         metadataCID: network.metadataCID,
  //         price: Number(network.price),
  //         hostWallet: network.host,
  //         ratingCount: Number(network.ratingCount),
  //         successfullSessions: Number(network.successfullSessions),
  //         totalRating: Number(network.totalRating),
  //         status: network.isActive ? "active" : "inactive",
  //         ...(metadataList[i] || {}),
  //       }));

  //     setAvailableNetworks(networks);
  //   } catch (error) {
  //     console.error("Failed to load networks:", error);
  //     setAvailableNetworks([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchHostNetworks();
  // }, [address]);

  const totalSessions = availableNetworks.reduce(
    (sum, network) => sum + network.successfullSessions,
    0
  );

  const handleToggleActive = (id: string) => {
    setAvailableNetworks(
      availableNetworks.map((network) =>
        network.id === id ? { ...network, active: !network.status } : network
      )
    );
    toast.success(
      `Network ${
        availableNetworks.find((n) => n.id === id)?.status
          ? "deactivated"
          : "activated"
      }`
    );
  };

  const handleEditPrice = (id: string, price: string) => {
    setAvailableNetworks(
      availableNetworks.map((network) =>
        network.id === id ? { ...network, price: Number(price) } : network
      )
    );
    setEditingNetwork(null);
    toast.success("Price updated successfully");
  };

  const handleEditPassword = (id: string, password: string) => {
    setAvailableNetworks(
      availableNetworks.map((network) =>
        network.id === id ? { ...network, password } : network
      )
    );
    setEditingNetwork(null);
    toast.success("Password updated successfully");
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };


  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold text-blue-100 mb-2">
          Host Dashboard
        </h1>
        <p className="text-blue-200 mb-8">
          Manage your WiFi networks and track earnings
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-blue-900 text-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Total Earnings
              </CardTitle>
              <CardDescription className="text-blue-100">
                From all your networks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{hostEarnings} USDT</div>
              <div className="text-sm text-blue-100 mt-2">
                {totalSessions} total sessions
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    copyToClipboard("0xA1FA...456C", "Wallet address copied!")
                  }
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy Address
                </Button>
                <Button variant="default" size="sm">
                  <QrCode className="mr-2 h-4 w-4" /> Show QR
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900 text-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Active Networks
              </CardTitle>
              <CardDescription className="text-blue-100">
                Your registered WiFi hotspots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {availableNetworks.filter((n) => n.status).length}
              </div>
              <div className="text-sm text-blue-100 mt-2">
                of {availableNetworks.length} total networks
              </div>
              <div className="mt-4">
                <Button
                  variant="default"
                  onClick={() => toast.info("Feature coming soon!")}
                >
                  + Add New Network
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="networks" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="networks">My Networks</TabsTrigger>
            <TabsTrigger value="earnings">Earnings History</TabsTrigger>
          </TabsList>

          <TabsContent value="networks">
            <Card>
              <CardHeader>
                <CardTitle>Network Management</CardTitle>
                <CardDescription className="text-blue-100">
                  Update network settings or view session details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left text-blue-100">
                        Network Name
                      </TableHead>
                      <TableHead className="text-left text-blue-100">
                        Location
                      </TableHead>
                      <TableHead className="text-left text-blue-100">
                        Price
                      </TableHead>
                      <TableHead className="text-left text-blue-100">
                        Sessions
                      </TableHead>
                      <TableHead className="text-left text-blue-100">
                        Rating
                      </TableHead>
                      <TableHead className="text-left text-blue-100">
                        Status
                      </TableHead>
                      <TableHead className="text-left text-blue-100">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableNetworks.map((network) => (
                      <TableRow key={network.id}>
                        <TableCell className="font-medium">
                          {network.ssid}
                        </TableCell>
                        <TableCell>{`${network.location.city}, ${network.location.area}`}</TableCell>
                        <TableCell>
                          {editingNetwork === `${network.id}-price` ? (
                            <div className="flex gap-2">
                              <Input
                                defaultValue={Number(
                                  formatUnits(
                                    BigInt(
                                      network.price as string | number | bigint
                                    ),
                                    18
                                  )
                                )}
                                onBlur={(e) =>
                                  handleEditPrice(network.id, e.target.value)
                                }
                                className="w-20"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {Number(
                                formatUnits(
                                  BigInt(
                                    network.price as string | number | bigint
                                  ),
                                  18
                                )
                              )}{" "}USDT/hr
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setEditingNetwork(`${network.id}-price`)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2"></div>
                          {network.successfullSessions}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2"></div>
                          {network.totalRating} ({network.ratingCount})
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center">
                            <span
                              className={`w-3 h-3 rounded-full mr-2 ${
                                network.status ? "bg-green-500" : "bg-gray-300"
                              }`}
                            ></span>
                            {network.status ? "Active" : "Inactive"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={network.status ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleActive(network.id)}
                          >
                            {network.status ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>
                  Track your earnings from all networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Network</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Total Earned</TableHead>
                      <TableHead>On-Chain</TableHead>
                      <TableHead>Off-Chain</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableNetworks.map((network) => (
                      <TableRow key={network.id}>
                        <TableCell className="font-medium">
                          {network.name}
                        </TableCell>
                        <TableCell>{network.successfullSessions}</TableCell>
                        <TableCell>
                          ${network.price * network.successfullSessions}
                        </TableCell>
                        <TableCell>
                          $
                          {(
                            parseFloat(
                              `${network.price * network.successfullSessions}`
                            ) * 0.7
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          $
                          {(
                            parseFloat(
                              `${network.price * network.successfullSessions}`
                            ) * 0.3
                          ).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell>Total</TableCell>
                      <TableCell>{totalSessions}</TableCell>
                      {/* <TableCell>${totalEarnings}</TableCell> */}
                      <TableCell>
                        {/* ${(parseFloat(totalEarnings) * 0.7).toFixed(2)} */}
                      </TableCell>
                      <TableCell>
                        {/* ${(parseFloat(totalEarnings) * 0.3).toFixed(2)} */}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
