'use client'

import { INetworkConfig } from '@/app/server/models/NetworkConfig.model'
import { useAdminQueries } from '@/hooks/useAdminQueries'
import { useNetworkQueries } from '@/hooks/useNetworkQueries'
import { 
  Play, 
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
  globalMode: boolean
  selectedNetworkId?: string | null
  networks?: INetworkConfig[]
  setSelectedNetworkId?: (networkId: string) => void
  loadingNetworks?: boolean
  onRefresh?: () => void
}

interface Alert {
  networkId: string;
  timestamp: string;
  message: string;
}

interface AlertsSummary {
  critical: number;
  warning: number;
  offline: number;
  total: number;
}

interface AlertsData {
  alerts: {
    critical: Alert[];
    warning: Alert[];
    offline: Alert[];
  };
  summary: AlertsSummary;
  timestamp: string;
}

type DashboardData = {
  overview: {
    activeUsers: number;
    totalSessions: number;
    systemHealth: {
      cpu: number;
      memory: number;
      temperature: number;
      diskUsage: number;
    };
  };
  performance: {
    averageSpeed: {
      download: number;
      upload: number;
    };
  };
  traffic: {
    totalDataTransfer: {
      downloadGB: number;
      uploadGB: number;
    };
  };
};

export default function DashboardHeader({ 
  isLive, 
  setIsLive,
  globalMode,
  selectedNetworkId,
  networks = [],
  setSelectedNetworkId,
  loadingNetworks = false,
  onRefresh
}: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Use React Query hooks
  const adminQueries = useAdminQueries()
  const { data: alertsData = { alerts: { critical: [], warning: [], offline: [] }, summary: { critical: 0, warning: 0, offline: 0, total: 0 }, timestamp: '' } } = adminQueries.useAlerts() as { data: AlertsData }
  const exportMutation = adminQueries.useExportData()

    const { useDashboard: useGlobalDashboard } = useAdminQueries();
    const { useNetworkDashboard } = useNetworkQueries(selectedNetworkId || "");
    
    const dashboardQuery = globalMode ? useGlobalDashboard() : useNetworkDashboard();
  const { data, isLoading, error } = dashboardQuery;

 const defaultDashboardData: DashboardData = {
    overview: {
      activeUsers: 0,
      totalSessions: 0,
      systemHealth: {
        cpu: 0,
        memory: 0,
        temperature: 0,
        diskUsage: 0,
      },
    },
    performance: {
      averageSpeed: {
        download: 0,
        upload: 0,
      },
    },
    traffic: {
      totalDataTransfer: {
        downloadGB: 0,
        uploadGB: 0,
      },
    },
  };

   const dashboardData: DashboardData =
    data && typeof data === "object" &&
      "overview" in data &&
      "performance" in data &&
      "traffic" in data
      ? (data as DashboardData)
      : defaultDashboardData;
  
  // Transform alerts data to notifications format
  const allAlerts: Alert[] = [
    ...(alertsData.alerts.critical || []),
    ...(alertsData.alerts.warning || []),
    ...(alertsData.alerts.offline || [])
  ];
  const notifications = allAlerts.map((alert: any, index: number) => ({
    id: alert.id || index,
    type: alert.severity || alert.type || 'info',
    message: alert.message || alert.description,
    time: alert.timestamp ? new Date(alert.timestamp).toLocaleString() : alert.time || 'Now'
  }))

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
    try {
      if (onRefresh) {
        await onRefresh()
      }
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = () => {
    const exportParams = {
      format: 'json' as const,
      timeRange: '24h',
      dataTypes: ['dashboard'],
      ...(globalMode ? {} : { networks: selectedNetworkId ? [selectedNetworkId] : [] })
    }

    exportMutation.mutate(exportParams, {
      onSuccess: () => {
        console.log('Export completed successfully')
      },
      onError: (error) => {
        console.error('Export failed:', error)
        // Fallback: create a simple export
        const fallbackData = {
          mode: globalMode ? 'global' : 'network',
          networkId: selectedNetworkId,
          timestamp: new Date().toISOString(),
          type: 'dashboard_export'
        }
        
        const blob = new Blob([JSON.stringify(fallbackData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dashboard-export-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-900 text-white'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
      case 'critical': return '🔴'
      case 'warning': return '🟡'
      case 'info': return '🔵'
      default: return '⚪'
    }
  }

    const activeUsers = dashboardData.overview.activeUsers;

  return (
    <header className="bg-black shadow-sm border-b border-gray-200 px-6 py-4 relative text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {globalMode ? (
              <Globe className="h-6 w-6 text-blue-600" />
            ) : (
              <Wifi className="h-6 w-6 text-green-600" />
            )}
            <div>
              <h1 className="text-sm font-bold text-white">
                {globalMode ? 'Global Dashboard' : 
                 selectedNetwork ? selectedNetwork.ssid : 'Network Dashboard'}
              </h1>
              {/* <p className="text-xs text-gray-300">
                {globalMode 
                  ? `Monitoring ${networks.length} networks`
                  : selectedNetwork 
                    ? `${selectedNetwork.location} • ${activeUsers} active users`
                    : 'Select a network to monitor'
                }
              </p> */}
            </div>
          </div>

          {/* Network Selector for Network Mode */}
          {!globalMode && selectedNetworkId && setSelectedNetworkId && (
            <div className="relative">
              <button
                onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                className="flex items-center px-3 py-2 text-sm text-gray-300 bg-blue-900 hover:bg-gray-800 rounded-lg transition-colors"
                disabled={loadingNetworks}
              >
                <span className="mr-2 text-sm">Networks</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showNetworkDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-black rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-300 px-3 py-2 border-b">
                      Available Networks
                    </div>
                    {networks.map((network) => (
                      <button
                        key={network.networkId}
                        onClick={() => {
                          setSelectedNetworkId(network.networkId)
                          setShowNetworkDropdown(false)
                        }}
                        className={`w-full text-left p-3 rounded-lg hover:bg-blue-900 transition-colors ${
                          network.networkId === selectedNetworkId ? 'bg-black border border-blue-200/25' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{network.ssid}</p>
                            <p className="text-sm text-gray-300">
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
                            <p className="text-sm text-gray-300 mt-1">{activeUsers} users</p>
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
            isLive ? 'bg-green-100 text-green-800' : 'bg-blue-900 text-white'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            {isLive ? 'Live' : 'Paused'}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Live Control Button */}
          {/* <button
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
          </button> */}

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
            disabled={exportMutation.isPending}
            className="flex items-center px-4 py-2 rounded-lg bg-blue-900 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Export Data"
          >
            <Download className={`h-4 w-4 sm:mr-2 ${exportMutation.isPending ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline text-sm">
              {exportMutation.isPending ? 'Exporting...' : 'Export'}
            </span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-blue-900 transition-colors relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-300" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length > 99 ? '99+' : notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-black rounded-lg shadow-lg border z-50">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-blue-900">
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1">
                            <p className="text-sm text-white">{notification.message}</p>
                            <p className="text-xs text-gray-300 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-300">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t bg-blue-900">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button 
            className="p-2 rounded-lg hover:bg-blue-900 transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-gray-300" />
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