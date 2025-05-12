'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { LayoutDashboard, LogOut, UserPlus, RefreshCw, ChevronRight } from 'lucide-react'

type DropdownMenuProps = {
  dropdownOpen: boolean
  setDropdownOpen: (value: boolean) => void
  userType: string
  onDisconnect: () => void
  onSwitchAccount: () => void
}

export default function DropdownMenu({
  dropdownOpen,
  setDropdownOpen,
  userType,
  onDisconnect,
  onSwitchAccount
}: DropdownMenuProps) {
  const router = useRouter()

  const handleNavigation = (href: string) => {
    setDropdownOpen(false)
    router.push(href)
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        duration: 0.2, 
        ease: [0.4, 0, 0.2, 1],
        when: "beforeChildren",
        staggerChildren: 0.05
      } 
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95, 
      transition: { 
        duration: 0.15,
        ease: [0.4, 0, 1, 1]
      } 
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 }
    },
  }

  return (
    <AnimatePresence>
      {dropdownOpen && (
        <motion.div
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-50 top-12 
            border border-gray-200 dark:border-gray-700 overflow-hidden 
            bg-gradient-to-br from-zaanet-purple-dark to-purple-900 backdrop-blur-sm"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="w-full py-1 relative flex flex-col items-start">
            {/* Dashboard */}
            <motion.div 
              variants={itemVariants}
              className="w-full border-b border-white/10"
              role="menuitem"
            >
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center px-4 py-3 text-sm font-medium text-white 
                  hover:bg-white/10 transition-colors"
                onClick={() => handleNavigation(`/${userType}/dashboard`)}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </Button>
            </motion.div>

            {/* Switch Account */}
            <motion.div 
              variants={itemVariants}
              className="w-full border-b border-white/10"
              role="menuitem"
            >
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center px-4 py-3 text-sm font-medium text-white 
                  hover:bg-white/10 transition-colors"
                onClick={() => {
                  setDropdownOpen(false)
                  onSwitchAccount()
                }}
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-4 h-4" />
                  Switch Account
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </Button>
            </motion.div>

            {/* Become a Host (only for guests) */}
            {userType === 'guest' && (
              <motion.div 
                variants={itemVariants}
                className="w-full border-b border-white/10"
                role="menuitem"
              >
                <Button
                  variant="ghost"
                  className="w-full flex justify-between items-center px-4 py-3 text-sm font-medium text-white 
                    hover:bg-white/10 transition-colors"
                  onClick={() => handleNavigation('/anopro-apply')}
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-4 h-4" />
                    Become a Host
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </Button>
              </motion.div>
            )}

            {/* Disconnect */}
            <motion.div 
              variants={itemVariants}
              className="w-full"
              role="menuitem"
            >
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center px-4 py-3 text-sm font-medium text-white 
                  hover:bg-red-500/20 hover:text-red-100 transition-colors"
                onClick={() => {
                  setDropdownOpen(false)
                  onDisconnect()
                }}
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}