"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { motion } from "framer-motion";
import Layout from "@/app/components/layout/Layout";
import WalletCard from "../../web3/WalletCard";
import { Wallet } from "lucide-react";

// Mock data
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

export default function GuestSession({
  isConnected,
  userType,
  address,
  connect,
  disconnect,
  balance,
  isLoadingBalance,
  isLoading,
}: {
  isConnected: boolean;
  userType: string;
  address: string;
  connect: () => void;
  disconnect: () => void;
  balance: bigint | null;
  isLoadingBalance: boolean;
  isLoading: boolean;
}) {
  return (
    <Layout>
      <div className="container py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-blue-100 mb-2">
            Guest Dashboard
          </h1>
          <p className="text-blue-200">
            View your wallet info and WiFi transaction history
          </p>
        </motion.div>

        <div className="grid gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WalletCard
              balance={balance}
              isLoading={isLoadingBalance}
              address={address}
              userType={userType}
              chainId={421614}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-blue-900 border-blue-100/25 rounded-xl shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Wallet className="h-5 w-5 text-blue-300" />
                  Payment History
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Your recent WiFi session transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-blue-100/25">
                      <TableHead className="text-blue-200">Date</TableHead>
                      <TableHead className="text-blue-200">Network</TableHead>
                      <TableHead className="text-blue-200">Duration</TableHead>
                      <TableHead className="text-right text-blue-200">
                        Amount (USDT)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockHistory.map((session) => (
                      <TableRow
                        key={session.id}
                        className="border-blue-100/25 hover:bg-black/40 transition-colors"
                      >
                        <TableCell className="font-medium text-blue-100/70">
                          {session.date}
                        </TableCell>
                        <TableCell className="text-blue-100/70">
                          {session.networkName}
                        </TableCell>
                        <TableCell className="text-blue-100/70">
                          {session.duration}
                        </TableCell>
                        <TableCell className="text-right font-medium text-blue-100/70">
                          ${session.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
