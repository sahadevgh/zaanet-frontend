'use client'

import { INetworkConfig } from '@/app/server/models/NetworkConfig.model'
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Download,
  Bell,
  Settings,
  ChevronDown,
  Globe,
  Wifi,
  AlertCircle,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'


interface HeaderProps {
  isLive: boolean
  setIsLive: (live: boolean) => void
  globalMode?: boolean
  selectedNetworkId?: string | null
  networks?: INetworkConfig[]
  setSelectedNetworkId?: (networkId: string) => void
  loadingNetworks?: boolean
  onRefresh?: () => void
}

export default function DashboardHeader({ 
  isLive, 
  setIsLive,
  globalMode = false,
  selectedNetworkId = null,
  networks = [],
  setSelectedNetworkId,
  loadingNetworks = false,
  onRefresh
}: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [notifications] = useState([
    { id: 1, type: 'warning', message: 'High CPU usage on Network 001', time: '2 min ago' },
    { id: 2, type: 'info', message: 'New user connected', time: '5 min ago' },
    { id: 3, type: 'error', message: 'Network 003 offline', time: '10 min ago' }
  ])

  const selectedNetwork = networks.find(n => n.networkId === selectedNetworkId)

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setLastUpdate(new Date())
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isLive])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    if (onRefresh) {
      await onRefresh()
    }
    // Simulate refresh delay
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleExport = () => {
    const exportData = {
      mode: globalMode ? 'global' : 'network',
      networkId: selectedNetworkId,
      timestamp: new Date().toISOString(),
      type: 'dashboard_export'
    }
    console.log('Exporting data...', exportData)
    
    // Simulate export download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-export-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return '🔴'
      case 'warning': return '🟡'
      case 'info': return '🔵'
      default: return '⚪'
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 relative text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {globalMode ? (
              <Globe className="h-6 w-6 text-blue-600" />
            ) : (
              <Wifi className="h-6 w-6 text-green-600" />
            )}
            <div>
              <h1 className="text-sm font-bold text-gray-900">
                {globalMode ? 'Global Dashboard' : 
                 selectedNetwork ? selectedNetwork.ssid : 'Network Dashboard'}
              </h1>
              <p className="text-xs text-gray-500">
                {globalMode 
                  ? `Monitoring ${networks.length} networks`
                  : selectedNetwork 
                    ? `${selectedNetwork.location} • ${selectedNetwork.activeUsers} active users`
                    : 'Select a network to monitor'
                }
              </p>
            </div>
          </div>

          {/* Network Selector for Network Mode */}
          {!globalMode && selectedNetworkId && setSelectedNetworkId && (
            <div className="relative">
              <button
                onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={loadingNetworks}
              >
                <span className="mr-2 text-sm">Networks</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showNetworkDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 px-3 py-2 border-b">
                      Available Networks
                    </div>
                    {networks.map((network) => (
                      <button
                        key={network.networkId}
                        onClick={() => {
                          setSelectedNetworkId(network.networkId)
                          setShowNetworkDropdown(false)
                        }}
                        className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                          network.networkId === selectedNetworkId ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{network.ssid}</p>
                            <p className="text-sm text-gray-500">
                              {typeof network.location === 'string'
                                ? network.location
                                : [
                                    network.location?.city,
                                    network.location?.region,
                                    network.location?.country
                                  ].filter(Boolean).join(', ')
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(network.status)}`}>
                              {network.status}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">{network.activeUsers} users</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Status Indicator */}
          <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
            isLive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            {isLive ? 'Live' : 'Paused'}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Last Update Time */}
          {/* <div className="text-sm text-gray-500 hidden sm:block">
            Updated: {lastUpdate.toLocaleTimeString()}
          </div> */}

          {/* Live Control Button */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              isLive 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isLive ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline text-sm">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline text-sm">Start</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''} sm:mr-2`} />
            <span className="hidden sm:inline text-sm">Refresh</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            title="Export Data"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline text-sm">Export</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t bg-gray-50">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNetworkDropdown || showNotifications) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNetworkDropdown(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}