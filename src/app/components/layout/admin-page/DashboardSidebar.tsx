'use client'

import { useAdminQueries } from '@/hooks/useAdminQueries'
import { useNetworkQueries } from '@/hooks/useNetworkQueries'
import {
  LayoutDashboard,
  Users,
  Activity,
  BarChart3,
  FileText,
  Wifi,
  Settings,
  DollarSign,
  Globe,
  AlertTriangle,
  Network,
  Shield,
  ChevronRight,
  Server
} from 'lucide-react'
import Link from 'next/link'

interface SidebarProps {
  currentView: string
  setCurrentView: (view: string) => void
  globalMode?: boolean
  setGlobalMode?: (isGlobal: boolean) => void
  selectedNetworkId?: string | null
  networkName?: string
  systemStatus?: 'online' | 'offline' | 'maintenance'
}

interface Alert {
  networkId: string;
  timestamp: string;
  message: string;
  severity: string;
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

const navigation = [
  { name: 'Overview', id: 'overview', icon: LayoutDashboard },
  { name: 'Live Analytics', id: 'lanalytics', icon: BarChart3 },
  { name: 'Session Analytics', id: 'sanalytics', icon: BarChart3 },
  { name: 'Performance', id: 'performance', icon: Activity },
  { name: 'Reports', id: 'reports', icon: FileText },
  { name: 'Alerts', id: 'alerts', icon: AlertTriangle },
]

export default function DashboardSidebar({
  currentView,
  setCurrentView,
  globalMode = false,
  setGlobalMode,
  selectedNetworkId = null,
  networkName = '',
  systemStatus = 'online'
}: SidebarProps) {

  // Use React Query hooks for data
  const adminQueries = useAdminQueries()
  const networkQueries = selectedNetworkId ? useNetworkQueries(selectedNetworkId) : null

  // Get data from hooks
  const { data: dashboardDataRaw } = adminQueries.useDashboard()
  const dashboardData = globalMode ? dashboardDataRaw : null
  const { data: networksData } = adminQueries.useNetworks()
  const { data: alertsData = { alerts: { critical: [], warning: [], offline: [] }, summary: { critical: 0, warning: 0, offline: 0, total: 0 }, timestamp: '' } as AlertsData } = adminQueries.useAlerts()
  const { data: networkDashboard } = networkQueries?.useNetworkDashboard() || { data: null }
  const { data: systemHealth } = networkQueries?.useSystemHealth() || { data: null }

  // Calculate stats from real data
  const getGlobalStats = () => {
    if (!dashboardData && !networksData) {
      return { totalNetworks: 0, onlineNetworks: 0, issuesCount: 0 }
    }

    const networks = (
      networksData && typeof networksData === 'object' && 'networks' in networksData
        ? networksData.networks
        : undefined
    ) || (
        dashboardData && typeof dashboardData === 'object' && 'networks' in dashboardData
          ? dashboardData.networks
          : undefined
      )
    const networksArray = Array.isArray(networks) ? networks : []
    const totalNetworks = networksArray.length
    const onlineNetworks = networksArray.filter((n: any) => n.status === 'active' || n.status === 'online').length
    // const issuesCount = alertsData?.alerts
    //   ? [
    //       ...alertsData.alerts.critical,
    //       ...alertsData.alerts.warning,
    //       ...alertsData.alerts.offline,
    //     ].filter((alert) => alert.severity === 'critical' || alert.severity === 'error').length
    //   : 0

    return { totalNetworks, onlineNetworks }
  }

  const getNetworkStats = () => {
    if (!networkDashboard && !systemHealth) {
      return { uptime: 'N/A', load: 'N/A' }
    }

    // Access the correct properties based on API response structure
    const uptime = (systemHealth as any)?.uptime ||
      (networkDashboard as any)?.systemHealth?.uptime ||
      (systemHealth as any)?.systemHealth?.uptime ||
      0

    const load = (systemHealth as any)?.systemHealth?.cpu ||
      (networkDashboard as any)?.systemHealth?.cpu ||
      (systemHealth as any)?.cpu ||
      0

    // Convert uptime from percentage or hours to readable format
    const uptimeText = typeof uptime === 'string' ? uptime :
      typeof uptime === 'number' && uptime > 0
        ? uptime > 100
          ? `${Math.floor(uptime / 24)}d ${Math.floor(uptime % 24)}h`
          : `${uptime.toFixed(1)}%`
        : 'N/A'

    const loadText = typeof load === 'number'
      ? `${load.toFixed(0)}%`
      : 'N/A'

    return { uptime: uptimeText, load: loadText }
  }

  // const getActiveAlertsCount = () => {
  //   if (!alertsData?.alerts) return 0
  //   const allAlerts = [
  //     ...alertsData.alerts.critical,
  //     ...alertsData.alerts.warning,
  //     ...alertsData.alerts.offline,
  //   ]
  //   return allAlerts.filter((alert) => 
  //     alert.severity === 'critical' || alert.severity === 'error'
  //   ).length
  // }

  const hasPerformanceIssues = () => {
    if (globalMode) {
      return (dashboardData as any)?.systemHealth?.status !== 'healthy' ||
        systemStatus !== 'online'
    } else {
      return (systemHealth as any)?.status !== 'healthy' ||
        (systemHealth as any)?.networkStatus !== 'online' ||
        (networkDashboard as any)?.systemHealth?.status !== 'healthy' ||
        systemStatus !== 'online'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-900 text-gray-100'
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'maintenance': return 'bg-yellow-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-blue-9000'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online & Monitoring'
      case 'maintenance': return 'Under Maintenance'
      case 'offline': return 'Offline'
      default: return 'Unknown Status'
    }
  }

  const globalStats = getGlobalStats()
  const networkStats = getNetworkStats()
  // const activeAlertsCount = getActiveAlertsCount()

  return (
    <div className="w-64 bg-black shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-gray-500">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center space-x-1 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-300 to-blue-100 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
              <span className="text-blue-600 font-bold text-xl">Z</span>
            </div>
          
          </Link>
          <div className="ml-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-100 bg-clip-text text-transparent">
              ZaaNet
            </span>
            <p className="text-xs text-gray-200">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      {setGlobalMode && (
        <div className="px-6 py-4 border-b border-gray-500">
          <div className="flex bg-blue-900 rounded-lg p-1">
            <button
              onClick={() => setGlobalMode(false)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${!globalMode ? 'bg-black text-white shadow-sm' : 'text-white hover:text-white'
                }`}
            >
              <Network className="w-4 h-4 mr-1" />
              Network
            </button>
            <button
              onClick={() => setGlobalMode(true)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${globalMode ? 'bg-black text-white shadow-sm' : 'text-white hover:text-white'
                }`}
            >
              <Globe className="w-4 h-4 mr-1" />
              Global
            </button>
          </div>

          {/* Current Context */}
          <div className="mt-3 p-3 bg-blue-900 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {globalMode ? (
                  <Globe className="w-4 h-4 text-blue-600 mr-2" />
                ) : (
                  <Server className="w-4 h-4 text-green-600 mr-2" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    {globalMode ? 'All Networks' : (networkName || 'Select Network')}
                  </p>
                  <p className="text-xs text-gray-200">
                    {globalMode
                      ? `${globalStats.totalNetworks} networks monitored`
                      : selectedNetworkId || 'No network selected'
                    }
                  </p>
                </div>
              </div>
              {!globalMode && selectedNetworkId && (
                <ChevronRight className="w-4 h-4 text-gray-100" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm'
                  : 'text-white hover:bg-blue-900 hover:text-white'
                  }`}
              >
                <div className="flex items-center">
                  <Icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-100 group-hover:text-white'
                    }`} />
                  <span>{item.name}</span>
                </div>

                {/* Alert indicators for specific pages */}
                {/* {item.id === 'alerts' && activeAlertsCount > 0 && (
                  <div className="flex items-center">
                    <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full font-medium">
                      {activeAlertsCount > 9 ? '9+' : activeAlertsCount}
                    </span>
                  </div>
                )} */}
                {item.id === 'performance' && hasPerformanceIssues() && (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-500">
          <p className="text-xs font-semibold text-gray-100 uppercase tracking-wide mb-3">
            Quick Actions
          </p>
          <div className="space-y-1">
            <button className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-blue-900 hover:text-white rounded-lg transition-colors">
              <Settings className="h-4 w-4 mr-3 text-gray-100" />
              Settings
            </button>
            <button className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-blue-900 hover:text-white rounded-lg transition-colors">
              <Shield className="h-4 w-4 mr-3 text-gray-100" />
              Security
            </button>
          </div>
        </div>
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-gray-500 bg-blue-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${getStatusColor(systemStatus)}`}>
              <div className={`w-2 h-2 rounded-full ${getStatusDot(systemStatus)} ${systemStatus === 'online' ? 'animate-pulse' : ''
                }`}></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">System Status</p>
              <p className={`text-xs ${systemStatus === 'online' ? 'text-green-600' :
                systemStatus === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                {getStatusText(systemStatus)}
              </p>
            </div>
          </div>

          {/* Mode indicator */}
          <div className="text-right">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${globalMode ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
              {globalMode ? (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  Global
                </>
              ) : (
                <>
                  <Network className="w-3 h-3 mr-1" />
                  Network
                </>
              )}
            </div>
          </div>
        </div>

        {/* Connection Stats */}
        {!globalMode && selectedNetworkId && (
          <div className="mt-3 pt-3 border-t border-gray-500">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-200">Uptime</p>
                <p className="text-sm font-medium text-white">{networkStats.uptime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-200">Load</p>
                <p className="text-sm font-medium text-white">{networkStats.load}</p>
              </div>
            </div>
          </div>
        )}

        {globalMode && (
          <div className="mt-3 pt-3 border-t border-gray-500">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-200">Networks</p>
                <p className="text-sm font-medium text-white">{globalStats.totalNetworks}</p>
              </div>
              <div>
                <p className="text-xs text-gray-200">Online</p>
                <p className="text-sm font-medium text-green-600">{globalStats.onlineNetworks}</p>
              </div>
              {/* <div>
                <p className="text-xs text-gray-200">Issues</p>
                <p className={`text-sm font-medium ${globalStats.issuesCount > 0 ? 'text-red-600' : 'text-white'}`}>
                  {globalStats.issuesCount}
                </p>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}