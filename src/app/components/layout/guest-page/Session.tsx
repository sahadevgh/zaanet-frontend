'use client'

  import React, { useState, useEffect } from 'react'
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
  import { Button } from '@/app/components/ui/button'
  import { Progress } from '@/app/components/ui/progress'
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
  import { toast } from 'sonner'
  import { Clock, Wifi, Plus, Copy, Wallet, ArrowUpRight, AlertTriangle } from 'lucide-react'
  import { motion, AnimatePresence } from 'framer-motion'
  import Layout from '@/app/components/layout/Layout'
  import WalletCard from '../../web3/WalletCard'
  
  // Mock data
  const mockSession = {
    id: 'sess_123456',
    networkName: 'Zaa Home WiFi',
    location: 'Tamale, Ghana',
    password: 'securepass123',
    startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    price: '1.00',
    hostWallet: '0xA1FA...456C',
  }
  
  const mockHistory = [
    {
      id: 'sess_123456',
      networkName: 'Zaa Home WiFi',
      date: '2024-04-21',
      duration: '2 hours',
      amount: '2.00',
    },
    {
      id: 'sess_123455',
      networkName: 'Office Hotspot',
      date: '2024-04-20',
      duration: '1 hour',
      amount: '1.50',
    },
    {
      id: 'sess_123454',
      networkName: 'Zaa Home WiFi',
      date: '2024-04-18',
      duration: '30 minutes',
      amount: '0.50',
    },
  ]
  
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
    isConnected: boolean
    userType: string
    address: string
    connect: () => void
    disconnect: () => void
    balance: bigint | null
    isLoadingBalance: boolean
    isLoading: boolean
  }) {
    const [totalTime, setTotalTime] = useState<number>(0)
    const [progressPercent, setProgressPercent] = useState<number>(0)
    const [timeDisplay, setTimeDisplay] = useState<string>('')
    const [isLowTime, setIsLowTime] = useState<boolean>(false)
  
    useEffect(() => {
      const checkConnection = async () => {
        if (isConnected) {
          // Fetch balance or any other data when connected
        } else {
          await connect()
        }
      }
  
      checkConnection()
    }, [isConnected])
  
    useEffect(() => {
      const totalSessionTime = (mockSession.endTime.getTime() - mockSession.startTime.getTime()) / 1000
      setTotalTime(totalSessionTime)
  
      const intervalId = setInterval(() => {
        const now = new Date()
        const remainingTimeInSec = Math.max(0, (mockSession.endTime.getTime() - now.getTime()) / 1000)
  
        setProgressPercent((remainingTimeInSec / totalSessionTime) * 100)
        setIsLowTime(remainingTimeInSec <= 300) // Warn when < 5 minutes
  
        // Format time display
        const hours = Math.floor(remainingTimeInSec / 3600)
        const minutes = Math.floor((remainingTimeInSec % 3600) / 60)
        const seconds = Math.floor(remainingTimeInSec % 60)
  
        setTimeDisplay(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
        )
  
        if (remainingTimeInSec <= 0) {
          clearInterval(intervalId)
          toast.warning('Your session has expired')
        }
      }, 1000)
  
      return () => clearInterval(intervalId)
    }, [])
  
    const copyToClipboard = (text: string, message: string) => {
      navigator.clipboard.writeText(text)
      toast.success(message)
    }
  
    const handleTopUp = (amount: string) => {
      const additionalTime = parseInt(amount) * 3600 // 1 hour per dollar
      mockSession.endTime = new Date(mockSession.endTime.getTime() + additionalTime * 1000)
      toast.success(`Added ${amount === '1.00' ? '1 hour' : '2 hours'} to your session`)
    }
  
    // Animation variants
    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    }
  
    return (
      <Layout>
        <div className="container py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-zaanet-purple-dark mb-2">
              WiFi Session Dashboard
            </h1>
            <p className="text-gray-700">
              Monitor and manage your active WiFi connection
            </p>
          </motion.div>
  
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Session Timer Card */}
            <motion.div 
              variants={cardVariants} 
              initial="hidden" 
              animate="visible"
              className="lg:col-span-2"
            >
              <Card className="bg-zaanet-purple-dark border-gray-700 rounded-xl shadow-lg h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl text-white">
                      <Clock className="h-5 w-5 text-purple-400" />
                      Session Timer
                    </CardTitle>
                    <span className="text-sm text-gray-200">
                      Ends: {mockSession.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <CardDescription className="text-gray-200">
                    Track your remaining WiFi time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center mb-6">
                    <div className="text-5xl font-bold text-center mb-2 font-mono text-white">
                      {timeDisplay}
                    </div>
                    <div className="w-full max-w-md">
                      <Progress
                        value={progressPercent}
                        className={`h-2.5 ${isLowTime ? 'bg-red-500' : 'bg-zaanet-green'}`}
                      />
                      <div className="flex justify-between text-xs mt-1 text-gray-200">
                        <span>Started</span>
                        <span>{(totalTime / 3600).toFixed(1)} hours total</span>
                      </div>
                    </div>
                  </div>
  
                  <AnimatePresence>
                    {isLowTime && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center gap-2 bg-red-900/30 border border-red-800 rounded-lg p-3 mb-4"
                      >
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <div>
                          <h4 className="font-medium text-red-100">Low session time!</h4>
                          <p className="text-xs text-red-300">Top up to avoid disconnection</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">Extend Session</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleTopUp('1.00')}
                        className="bg-gray-700/50 hover:bg-zaanet-purple text-white h-12"
                      >
                        <Plus className="h-4 w-4 mr-2" /> 
                        <div className="text-left">
                          <div className="font-medium">1 Hour</div>
                          <div className="text-xs">$1.00</div>
                        </div>
                      </Button>
                      <Button
                        onClick={() => handleTopUp('2.00')}
                        className="bg-gray-700/50 hover:bg-zaanet-purple text-white h-12"
                      >
                        <Plus className="h-4 w-4 mr-2" /> 
                        <div className="text-left">
                          <div className="font-medium">2 Hours</div>
                          <div className="text-xs">$2.00</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
  
            {/* Wallet Card */}
            <motion.div variants={cardVariants} initial="hidden" animate="visible">
              <WalletCard 
                balance={balance}
                isLoading={isLoadingBalance}
                address={address}
                userType={userType} 
                chainId={421614}
              />
            </motion.div>
          </div>
  
          {/* Connection Details Card */}
          <motion.div 
            variants={cardVariants} 
            initial="hidden" 
            animate="visible"
            className="mb-8"
          >
            <Card className="bg-zaanet-purple-dark border-gray-700 rounded-xl shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Wifi className="h-5 w-5 text-purple-400" />
                  Connection Details
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Your WiFi credentials and session info
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-200 mb-1">Network Name (SSID)</div>
                    <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                      <div className="font-medium text-white">{mockSession.networkName}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(mockSession.networkName, 'Network name copied')}
                        className="text-gray-200 hover:text-white h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-200 mb-1">Password</div>
                    <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                      <div className="font-mono text-white">{mockSession.password}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(mockSession.password, 'Password copied')}
                        className="text-gray-200 hover:text-white h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-200 mb-1">Location</div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="font-medium text-white">{mockSession.location}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-200 mb-1">Host Wallet</div>
                    <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                      <div className="font-mono text-white">{mockSession.hostWallet}</div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(mockSession.hostWallet, 'Wallet address copied')}
                          className="text-gray-200 hover:text-white h-8 w-8"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="text-gray-200 hover:text-white h-8 w-8"
                        >
                          <a 
                            href={`https://sepolia.arbiscan.io/address/${mockSession.hostWallet}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
  
          {/* Payment History Card */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <Card className="bg-zaanet-purple-dark border-gray-700 rounded-xl shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Wallet className="h-5 w-5 text-purple-400" />
                  Payment History
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Your recent WiFi session transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-gray-700">
                      <TableHead className="text-gray-200">Date</TableHead>
                      <TableHead className="text-gray-200">Network</TableHead>
                      <TableHead className="text-gray-200">Duration</TableHead>
                      <TableHead className="text-right text-gray-200">Amount (USDT)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockHistory.map((session) => (
                      <TableRow
                        key={session.id}
                        className="border-gray-700 hover:bg-gray-700/50 transition-colors"
                      >
                        <TableCell className="font-medium text-white">{session.date}</TableCell>
                        <TableCell className="text-gray-300">{session.networkName}</TableCell>
                        <TableCell className="text-gray-300">{session.duration}</TableCell>
                        <TableCell className="text-right font-medium text-white">${session.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    )
  }
  