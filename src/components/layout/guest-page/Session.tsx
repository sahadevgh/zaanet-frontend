'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Clock, Wifi, Plus, Copy, Wallet } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '@/components/layout/Layout'

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

export default function GuestSession() {
  // const [remainingTime, setRemainingTime] = useState<number>(0)
  const [totalTime, setTotalTime] = useState<number>(0)
  const [progressPercent, setProgressPercent] = useState<number>(0)
  const [timeDisplay, setTimeDisplay] = useState<string>('')
  const [isLowTime, setIsLowTime] = useState<boolean>(false)

  useEffect(() => {
    // Calculate total session time in seconds
    const totalSessionTime = (mockSession.endTime.getTime() - mockSession.startTime.getTime()) / 1000
    setTotalTime(totalSessionTime)

    const intervalId = setInterval(() => {
      const now = new Date()
      const remainingTimeInSec = Math.max(0, (mockSession.endTime.getTime() - now.getTime()) / 1000)

      // setRemainingTime(remainingTimeInSec)
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
      <div className="container py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-zaanet-purple dark:text-purple-300 mb-3">
            Active WiFi Session
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Monitor your ZaaNet WiFi connection and top up seamlessly
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <Card className="bg-gradient-to-br from-zaanet-purple-dark to-purple-900 text-white border-none shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 animate-pulse" />
                  Session Timer
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Track your remaining WiFi time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-center mb-4 tracking-tight">
                  {timeDisplay}
                </div>
                <Progress
                  value={progressPercent}
                  className={`h-3 ${isLowTime ? 'bg-red-500' : 'bg-green-400'} bg-gray-700`}
                />
                <div className="flex justify-between text-sm mt-3 text-gray-300">
                  <span>Session: {(totalTime / 3600).toFixed(1)} hours</span>
                  <span>Ends: {mockSession.endTime.toLocaleTimeString()}</span>
                </div>
                <AnimatePresence>
                  {isLowTime && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-red-300 text-sm mt-3 text-center"
                    >
                      Low time! Top up to stay connected.
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3 text-gray-200">Extend Session:</h3>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleTopUp('1.00')}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> 1 Hour ($1.00)
                    </Button>
                    <Button
                      onClick={() => handleTopUp('2.00')}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> 2 Hours ($2.00)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <Card className="bg-gradient-to-br from-zaanet-purple-dark to-purple-900 text-white border-none shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wifi className="h-5 w-5 animate-pulse" />
                  Connection Details
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Your WiFi credentials and session info
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="text-sm text-gray-300">Network Name (SSID)</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-medium">{mockSession.networkName}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(mockSession.networkName, 'Network name copied')}
                      className="text-gray-300 hover:text-white"
                    >
                      <Copy className="h-4 w-4 transition-transform hover:scale-110" />
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Password</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-medium">{mockSession.password}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(mockSession.password, 'Password copied')}
                      className="text-gray-300 hover:text-white"
                    >
                      <Copy className="h-4 w-4 transition-transform hover:scale-110" />
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Location</div>
                  <div className="text-lg font-medium">{mockSession.location}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Host Wallet</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-mono">{mockSession.hostWallet}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(mockSession.hostWallet, 'Wallet address copied')
                      }
                      className="text-gray-300 hover:text-white"
                    >
                      <Copy className="h-4 w-4 transition-transform hover:scale-110" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-gradient-to-br from-zaanet-purple-dark to-purple-900 text-white border-none shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-100">
                <Wallet className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription className="text-gray-200">
                Your recent WiFi session transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-gray-200">Date</TableHead>
                    <TableHead className="text-gray-200">Network</TableHead>
                    <TableHead className="text-gray-200">Duration</TableHead>
                    <TableHead className="text-gray-200">Amount (USDT)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHistory.map((session) => (
                    <TableRow
                      key={session.id}
                      className="border-gray-700 hover:bg-purple-800/50 transition-colors"
                    >
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
        </motion.div>
      </div>
    </Layout>
  )
}
