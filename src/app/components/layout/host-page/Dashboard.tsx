"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { toast } from "sonner";
import { Copy, QrCode, Wallet, Wifi, Edit, Eye, EyeOff } from "lucide-react";
import type { WifiNetwork } from "@/types";
import Layout from "../Layout";

// Mock data for demonstration
const mockNetworks: (WifiNetwork & { active: boolean; earnings: string; sessions: number })[] = [
  {
    id: "1",
    name: "Zaa Home WiFi",
    location: { country: "Ghana", city: "Tamale", area: "Ghana", lat: 9.4071, lng: -0.8539 },
    speed: 25,
    price: 1.00,
    hostWallet: "0xA1FA...456C",
    password: "securepass123",
    description: "Reliable home WiFi network",
    imageCID: "QmExampleCID1",
    type: "Home",
    active: true,
    earnings: "28.50",
    sessions: 12,
  },
  {
    id: "2",
    name: "Office Hotspot",
    location: { country: "Ghana", city: "Accra", area: "Ghana", lat: 5.6037, lng: -0.1870 },
    speed: 50,
    price: 1.50,
    hostWallet: "0xA1FA...456C",
    password: "office2024",
    description: "High-speed office hotspot",
    imageCID: "QmExampleCID2",
    type: "Office",
    active: true,
    earnings: "45.75",
    sessions: 22,
  },
];

export default function HostDashboard() {
  const [networks, setNetworks] = useState(mockNetworks);
  const [editingNetwork, setEditingNetwork] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  
  // Total earnings calculation
  const totalEarnings = networks.reduce(
    (sum, network) => sum + parseFloat(network.earnings),
    0
  ).toFixed(2);
  
  const totalSessions = networks.reduce(
    (sum, network) => sum + network.sessions,
    0
  );

  const handleToggleActive = (id: string) => {
    setNetworks(networks.map(network => 
      network.id === id ? { ...network, active: !network.active } : network
    ));
    toast.success(`Network ${networks.find(n => n.id === id)?.active ? "deactivated" : "activated"}`);
  };

  const handleEditPrice = (id: string, price: string) => {
    setNetworks(networks.map(network => 
      network.id === id ? { ...network, price: Number(price) } : network
    ));
    setEditingNetwork(null);
    toast.success("Price updated successfully");
  };

  const handleEditPassword = (id: string, password: string) => {
    setNetworks(networks.map(network => 
      network.id === id ? { ...network, password } : network
    ));
    setEditingNetwork(null);
    toast.success("Password updated successfully");
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold text-zaanet-purple mb-2">Host Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage your WiFi networks and track earnings</p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-zaanet-purple text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Total Earnings
              </CardTitle>
              <CardDescription className="text-zink">From all your networks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">${totalEarnings}</div>
              <div className="text-sm text-zink mt-2">{totalSessions} total sessions</div>
              <div className="mt-4 flex gap-2">
                <Button variant="default" size="sm" onClick={() => copyToClipboard("0xA1FA...456C", "Wallet address copied!")}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Address
                </Button>
                <Button variant="default" size="sm">
                  <QrCode className="mr-2 h-4 w-4" /> Show QR
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zaanet-purple text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Active Networks
              </CardTitle>
              <CardDescription className="text-zink">Your registered WiFi hotspots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{networks.filter(n => n.active).length}</div>
              <div className="text-sm text-zink mt-2">of {networks.length} total networks</div>
              <div className="mt-4">
                <Button variant="default" onClick={() => toast.info("Feature coming soon!")}>+ Add New Network</Button>
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
                <CardDescription className="text-zink">Update network settings or view session details</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left text-zink">Network Name</TableHead>
                      <TableHead className="text-left text-zink">Location</TableHead>
                      <TableHead className="text-left text-zink">Price</TableHead>
                      <TableHead className="text-left text-zink">Password</TableHead>
                      <TableHead className="text-left text-zink">Status</TableHead>
                      <TableHead className="text-left text-zink">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {networks.map((network) => (
                      <TableRow key={network.id}>
                        <TableCell className="font-medium">{network.name}</TableCell>
                        <TableCell>{`${network.location.city}, ${network.location.area}`}</TableCell>
                        <TableCell>
                          {editingNetwork === `${network.id}-price` ? (
                            <div className="flex gap-2">
                              <Input 
                                defaultValue={network.price}
                                onBlur={(e) => handleEditPrice(network.id, e.target.value)}
                                className="w-20"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              ${network.price}
                              <Button 
                                size="icon"
                                variant="ghost" 
                                onClick={() => setEditingNetwork(`${network.id}-price`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingNetwork === `${network.id}-password` ? (
                            <div className="flex gap-2">
                              <Input 
                                defaultValue={network.password}
                                onBlur={(e) => handleEditPassword(network.id, e.target.value)}
                                className="w-28"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>
                                {showPassword[network.id] ? network.password : "••••••••"}
                              </span>
                              <Button 
                                size="icon"
                                variant="ghost" 
                                onClick={() => togglePasswordVisibility(network.id)}
                              >
                                {showPassword[network.id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                size="icon"
                                variant="ghost" 
                                onClick={() => setEditingNetwork(`${network.id}-password`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${network.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            {network.active ? 'Active' : 'Inactive'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant={network.active ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleActive(network.id)}
                          >
                            {network.active ? 'Deactivate' : 'Activate'}
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
                <CardDescription>Track your earnings from all networks</CardDescription>
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
                    {networks.map((network) => (
                      <TableRow key={network.id}>
                        <TableCell className="font-medium">{network.name}</TableCell>
                        <TableCell>{network.sessions}</TableCell>
                        <TableCell>${network.earnings}</TableCell>
                        <TableCell>${(parseFloat(network.earnings) * 0.7).toFixed(2)}</TableCell>
                        <TableCell>${(parseFloat(network.earnings) * 0.3).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell>Total</TableCell>
                      <TableCell>{totalSessions}</TableCell>
                      <TableCell>${totalEarnings}</TableCell>
                      <TableCell>${(parseFloat(totalEarnings) * 0.7).toFixed(2)}</TableCell>
                      <TableCell>${(parseFloat(totalEarnings) * 0.3).toFixed(2)}</TableCell>
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
