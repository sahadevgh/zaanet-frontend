'use client'

import { useEffect, useRef, useState } from 'react'
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from '@rainbow-me/rainbowkit'
import { useDisconnect, useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ConnectButton } from './ConnectButton'
import { LoadingSpinner } from '@/lib/LoadingSpinner'
import DropdownMenu from '../layout/DropdownMenu'

type UserType = 'user' | 'premium' | 'anopro' | 'admin'

interface ConnectBtnProps {
  backgroundColor?: string
  emoji?: string
  isConnected: boolean
  address: string | undefined
}

export const ConnectBtn = ({
  backgroundColor,
  emoji = '👤',
  isConnected,
  address,
}: ConnectBtnProps) => {
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { openChainModal } = useChainModal()
  const { disconnect } = useDisconnect()
  const { isConnecting, chain } = useAccount()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const isMounted = useRef(false)
  const [userType, setUserType] = useState<UserType>('user')

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const handleConnectClick = async () => {
    if (isConnected) {
      try {
        disconnect()
        toast({
          title: 'Disconnected',
          description: 'Wallet disconnected successfully.',
        })
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to disconnect wallet.',
          variant: 'destructive',
        })
      }
      return
    }

    try {
      await openConnectModal?.()
      toast({
        title: 'Connected',
        description: 'Wallet connected successfully.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to connect wallet.',
        variant: 'destructive',
      })
    }
  }

  if (!isConnected) {
    return (
      <ConnectButton
      onClick={handleConnectClick}
      disabled={isConnecting}
      variant="outline"
      className="bg-transparent border-zaanet-purple text-zaanet-purple hover:bg-zaanet-purple hover:text-white"
    >
      {isConnecting ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner />
          Connecting...
        </div>
      ) : (
        'Connect Wallet'
      )}
    </ConnectButton>
    
    )
  }

  if (isConnected && !chain) {
    return (
      <Button
        onClick={openChainModal}
        className="bg-red-500 hover:bg-red-600 text-white"
      >
        Wrong Network
      </Button>
    )
  }

  return (
    <div className="relative">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label="User menu"
        className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-zaanet-purple"
        style={{
          backgroundColor,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        onKeyDown={(e) => e.key === 'Enter' && setDropdownOpen(!dropdownOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xl">{emoji}</span>
      </motion.div>

      <DropdownMenu
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        openAccountModal={openAccountModal}
        openChainModal={openChainModal}
        userType={userType}
      />
    </div>
  )
}
