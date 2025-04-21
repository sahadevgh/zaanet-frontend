"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Wallet, Settings, TrendingUp, User } from "lucide-react";
import Layout from "@/components/layout/Layout";

// Mock data
const mockPlatformStats = {
  totalHosts: 42,
  activeHosts: 35,
  totalNetworks: 67,
  activeNetworks: 58,
  activeSessions: 23,
  totalRevenue: "2,450.75",
  platformFee: 10, // Percentage
  recentHostsGrowth: 12, // Percentage
  recentRevenueGrowth: 8, // Percentage
};

const mockHosts = [
  {
    id: "1",
    name: "Kofi Mensah",
    wallet: "0xA1FA...456C",
    networks: 2,
    totalEarnings: "74.25",
    status: "active",
  },
  {
    id: "2",
    name: "Ama Darko",
    wallet: "0xB2FB...789D",
    networks: 1,
    totalEarnings: "45.75",
    status: "active",
  },
  {
    id: "3",
    name: "Kwame Owusu",
    wallet: "0xC3FC...012E",
    networks: 3,
    totalEarnings: "120.50",
    status: "active",
  },
  {
    id: "4",
    name: "Abena Prempeh",
    wallet: "0xD4FD...345F",
    networks: 1,
    totalEarnings: "32.00",
    status: "inactive",
  },
];

const mockTransactions = [
  {
    id: "tx1",
    date: "2024-04-21",
    user: "0xE5FE...678G",
    network: "Zaa Home WiFi",
    amount: "1.00",
    platformFee: "0.10",
  },
  {
    id: "tx2",
    date: "2024-04-21",
    user: "0xF6FF...901H",
    network: "Office Hotspot",
    amount: "1.50",
    platformFee: "0.15",
  },
  {
    id: "tx3",
    date: "2024-04-20",
    user: "0xG7FG...234I",
    network: "Downtown Cafe",
    amount: "0.75",
    platformFee: "0.08",
  },
  {
    id: "tx4",
    date: "2024-04-20",
    user: "0xH8FH...567J",
    network: "Community Center",
    amount: "2.00",
    platformFee: "0.20",
  },
  {
    id: "tx5",
    date: "2024-04-19",
    user: "0xI9FI...890K",
    network: "Zaa Home WiFi",
    amount: "1.00",
    platformFee: "0.10",
  },
];

export default function AdminDashboard() {
  const [platformFee, setPlatformFee] = useState(mockPlatformStats.platformFee);
  const [hosts, setHosts] = useState(mockHosts);
  
  const handleUpdatePlatformFee = (newFee: number) => {
    if (newFee >= 0 && newFee <= 100) {
      setPlatformFee(newFee);
      toast.success(`Platform fee updated to ${newFee}%`);
    } else {
      toast.error("Platform fee must be between 0-100%");
    }
  };

  const handleToggleHostStatus = (id: string) => {
    setHosts(hosts.map(host => 
      host.id === id ? { ...host, status: host.status === "active" ? "inactive" : "active" } : host
    ));
    
    const host = hosts.find(h => h.id === id);
    if (host) {
      toast.success(`${host.name} is now ${host.status === "active" ? "inactive" : "active"}`);
    }
  };

  // Calculate total platform revenue
  const platformRevenue = mockTransactions.reduce(
    (sum, tx) => sum + parseFloat(tx.platformFee),
    0
  ).toFixed(2);

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold text-zaanet-purple mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage the ZaaNet platform and monitor activity</p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Host Network
              </CardTitle>
              <CardDescription>Host and network statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{mockPlatformStats.totalHosts}</div>
              <div className="text-sm text-muted-foreground mt-1">Total hosts</div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-xl font-semibold">{mockPlatformStats.activeHosts}</div>
                  <div className="text-xs text-muted-foreground">Active hosts</div>
                </div>
                <div>
                  <div className="text-xl font-semibold flex items-center">
                    {mockPlatformStats.recentHostsGrowth}%
                    <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                  </div>
                  <div className="text-xs text-muted-foreground">Growth (30d)</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-xl font-semibold">{mockPlatformStats.totalNetworks}</div>
                  <div className="text-xs text-muted-foreground">Total networks</div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{mockPlatformStats.activeNetworks}</div>
                  <div className="text-xs text-muted-foreground">Active networks</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Platform Revenue
              </CardTitle>
              <CardDescription>Financial statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">${mockPlatformStats.totalRevenue}</div>
              <div className="text-sm text-muted-foreground mt-1">Total transaction volume</div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-xl font-semibold">${platformRevenue}</div>
                  <div className="text-xs text-muted-foreground">Platform revenue</div>
                </div>
                <div>
                  <div className="text-xl font-semibold flex items-center">
                    {mockPlatformStats.recentRevenueGrowth}%
                    <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                  </div>
                  <div className="text-xs text-muted-foreground">Growth (30d)</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-xl font-semibold">{mockPlatformStats.activeSessions}</div>
                  <div className="text-xs text-muted-foreground">Active sessions</div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{platformFee}%</div>
                  <div className="text-xs text-muted-foreground">Platform fee</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>Adjust platform configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Platform Fee (%)</label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={platformFee} 
                      onChange={(e) => setPlatformFee(parseInt(e.target.value))}
                      min="0" 
                      max="100"
                      className="w-20"
                    />
                    <Button 
                      onClick={() => handleUpdatePlatformFee(platformFee)}
                    >
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Percentage fee on all transactions</p>
                </div>
                
                <div>
                  <Button 
                    variant="outline"
                    onClick={() => toast.info("Feature coming soon!")}
                  >
                    Manage Payment Methods
                  </Button>
                </div>
                
                <div>
                  <Button 
                    variant="outline"
                    onClick={() => toast.info("Feature coming soon!")}
                  >
                    System Maintenance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="hosts" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="hosts">Host Management</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="hosts">
            <Card>
              <CardHeader>
                <CardTitle>Registered Hosts</CardTitle>
                <CardDescription>Manage platform hosts and their networks</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Host Name</TableHead>
                      <TableHead>Wallet Address</TableHead>
                      <TableHead>Networks</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hosts.map((host) => (
                      <TableRow key={host.id}>
                        <TableCell className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {host.name}
                        </TableCell>
                        <TableCell>{host.wallet}</TableCell>
                        <TableCell>{host.networks}</TableCell>
                        <TableCell>${host.totalEarnings}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${host.status === "active" ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            {host.status === "active" ? 'Active' : 'Inactive'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant={host.status === "active" ? "destructive" : "default"}
                              size="sm"
                              onClick={() => handleToggleHostStatus(host.id)}
                            >
                              {host.status === "active" ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => toast.info("Feature coming soon!")}
                            >
                              View Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Platform payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Platform Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>{tx.user}</TableCell>
                        <TableCell>{tx.network}</TableCell>
                        <TableCell>${tx.amount}</TableCell>
                        <TableCell>${tx.platformFee}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell colSpan={3}>Total</TableCell>
                      <TableCell>
                        ${mockTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toFixed(2)}
                      </TableCell>
                      <TableCell>${platformRevenue}</TableCell>
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