"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Clock, Wifi, Plus, Copy } from "lucide-react";
import Layout from "@/components/layout/Layout";

// Mock data
const mockSession = {
  id: "sess_123456",
  networkName: "Zaa Home WiFi",
  location: "Tamale, Ghana",
  password: "securepass123",
  startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
  price: "1.00",
  hostWallet: "0xA1FA...456C",
};

const mockHistory = [
  {
    id: "sess_123456",
    networkName: "Zaa Home WiFi",
    date: "2024-04-21",
    duration: "2 hours",
    amount: "2.00",
  },
  {
    id: "sess_123455",
    networkName: "Office Hotspot",
    date: "2024-04-20",
    duration: "1 hour",
    amount: "1.50",
  },
  {
    id: "sess_123454",
    networkName: "Zaa Home WiFi",
    date: "2024-04-18",
    duration: "30 minutes",
    amount: "0.50",
  },
];

export default function GuestSession() {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [timeDisplay, setTimeDisplay] = useState<string>("");
  
  useEffect(() => {
    // Calculate total session time in seconds
    const totalSessionTime = (mockSession.endTime.getTime() - mockSession.startTime.getTime()) / 1000;
    setTotalTime(totalSessionTime);
    
    const intervalId = setInterval(() => {
      const now = new Date();
      const remainingTimeInSec = Math.max(0, (mockSession.endTime.getTime() - now.getTime()) / 1000);
      
      setRemainingTime(remainingTimeInSec);
      setProgressPercent((remainingTimeInSec / totalSessionTime) * 100);
      
      // Format time display
      const hours = Math.floor(remainingTimeInSec / 3600);
      const minutes = Math.floor((remainingTimeInSec % 3600) / 60);
      const seconds = Math.floor(remainingTimeInSec % 60);
      
      setTimeDisplay(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      
      if (remainingTimeInSec <= 0) {
        clearInterval(intervalId);
        toast.warning("Your session has expired");
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };
  
  const handleTopUp = (amount: string) => {
    // Mock top-up functionality
    const additionalTime = parseInt(amount) * 3600; // 1 hour per dollar
    mockSession.endTime = new Date(mockSession.endTime.getTime() + additionalTime * 1000);
    toast.success(`Added ${amount === "1.00" ? "1 hour" : "2 hours"} to your session`);
  };

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold text-zaanet-purple mb-2">Active Session</h1>
        <p className="text-gray-600 mb-8">Track your current WiFi session and connection details</p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-zaanet-purple-dark text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Remaining
              </CardTitle>
              <CardDescription>Current session timer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center mb-4">{timeDisplay}</div>
              <Progress value={progressPercent} className="h-3" />
              <div className="flex justify-between text-sm mt-2">
                <span>Current</span>
                <span>End Time: {mockSession.endTime.toLocaleTimeString()}</span>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Top up time:</h3>
                <div className="flex gap-3">
                  <Button onClick={() => handleTopUp("1.00")} size="sm">
                    <Plus className="mr-1 h-4 w-4" /> 1 Hour ($1.00)
                  </Button>
                  <Button onClick={() => handleTopUp("2.00")} size="sm">
                    <Plus className="mr-1 h-4 w-4" /> 2 Hours ($2.00)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zaanet-purple-dark text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Connection Details
              </CardTitle>
              <CardDescription>Your current WiFi credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Network Name (SSID)</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-medium">{mockSession.networkName}</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(mockSession.networkName, "Network name copied")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Password</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-medium">{mockSession.password}</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(mockSession.password, "Password copied")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="text-lg font-medium">{mockSession.location}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6 bg-zaanet-purple-dark text-white">
          <CardHeader>
            <CardTitle className="text-zink">Payment History</CardTitle>
            <CardDescription className="text-zink">Your recent WiFi sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-zink">Date</TableHead>
                  <TableHead className="text-zink">Network</TableHead>
                  <TableHead className="text-zink">Duration</TableHead>
                  <TableHead className="text-zink">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHistory.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.date}</TableCell>
                    <TableCell>{session.networkName}</TableCell>
                    <TableCell>{session.duration}</TableCell>
                    <TableCell>${session.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}