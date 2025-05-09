'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { LayoutDashboard, LogOut, UserPlus } from 'lucide-react'

type DropdownMenuProps = {
  dropdownOpen: boolean
  setDropdownOpen: (value: boolean) => void
  userType: string
  onDisconnect: () => void
}

export default function DropdownMenu({
  dropdownOpen,
  setDropdownOpen,
  userType,
  onDisconnect,
}: DropdownMenuProps) {
  const router = useRouter()

  const handleNavigation = (href: string) => {
    setDropdownOpen(false)
    router.push(href)
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.2 },
    }),
  }

  return (
    <AnimatePresence>
      {dropdownOpen && (
        <motion.div
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl z-50 top-12 
            border border-gray-200 dark:border-gray-800 overflow-hidden 
            bg-gradient-to-r from-zaanet-purple-dark to-zaanet-purple"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="w-full py-2 relative flex flex-col gap-1 items-start">
            <motion.div custom={0} variants={itemVariants} role="menuitem">
              <Button
                variant="ghost"
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-200 
                  hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => handleNavigation(`/${userType}/dashboard`)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </motion.div>

            {userType === 'guest' && (
              <motion.div custom={1} variants={itemVariants} role="menuitem">
                <Button
                  variant="ghost"
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-200 
                    hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => handleNavigation('/anopro-apply')}
                >
                  <UserPlus className="w-4 h-4" />
                  Become a Host
                </Button>
              </motion.div>
            )}

            <motion.div custom={2} variants={itemVariants} role="menuitem">
              <Button
                variant="ghost"
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-200 
                  hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                onClick={() => {
                  setDropdownOpen(false);
                  onDisconnect();
                }}
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
