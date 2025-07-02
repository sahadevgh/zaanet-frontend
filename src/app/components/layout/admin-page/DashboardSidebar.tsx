'use client'

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

interface SidebarProps {
  currentView: string
  setCurrentView: (view: string) => void
  globalMode?: boolean
  setGlobalMode?: (isGlobal: boolean) => void
  selectedNetworkId?: string | null
  networkName?: string
  systemStatus?: 'online' | 'offline' | 'maintenance'
}

const navigation = [
  { name: 'Overview', id: 'overview', icon: LayoutDashboard },
  { name: 'Transactions', id: 'transactions', icon: DollarSign },
  { name: 'Active Users', id: 'users', icon: Users },
  { name: 'Performance', id: 'performance', icon: Activity },
  { name: 'Live Analytics', id: 'analytics', icon: BarChart3 },
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'maintenance': return 'bg-yellow-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-500'
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

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Wifi className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">ZaaNet</h1>
            <p className="text-sm text-gray-500">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      {setGlobalMode && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setGlobalMode(false)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                !globalMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Network className="w-4 h-4 mr-1" />
              Network
            </button>
            <button
              onClick={() => setGlobalMode(true)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                globalMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="w-4 h-4 mr-1" />
              Global
            </button>
          </div>
          
          {/* Current Context */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {globalMode ? (
                  <Globe className="w-4 h-4 text-blue-600 mr-2" />
                ) : (
                  <Server className="w-4 h-4 text-green-600 mr-2" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {globalMode ? 'All Networks' : (networkName || 'Select Network')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {globalMode ? 'Multi-network view' : selectedNetworkId || 'No network selected'}
                  </p>
                </div>
              </div>
              {!globalMode && selectedNetworkId && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
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
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <Icon className={`h-5 w-5 mr-3 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <span>{item.name}</span>
                </div>
                
                {/* Alert indicators for specific pages */}
                {item.id === 'alerts' && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
                {item.id === 'performance' && systemStatus !== 'online' && (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Quick Actions
          </p>
          <div className="space-y-1">
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
              <Settings className="h-4 w-4 mr-3 text-gray-400" />
              Settings
            </button>
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
              <Shield className="h-4 w-4 mr-3 text-gray-400" />
              Security
            </button>
          </div>
        </div>
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${getStatusColor(systemStatus)}`}>
              <div className={`w-2 h-2 rounded-full ${getStatusDot(systemStatus)} ${
                systemStatus === 'online' ? 'animate-pulse' : ''
              }`}></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">System Status</p>
              <p className={`text-xs ${
                systemStatus === 'online' ? 'text-green-600' : 
                systemStatus === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {getStatusText(systemStatus)}
              </p>
            </div>
          </div>
          
          {/* Mode indicator */}
          <div className="text-right">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              globalMode ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
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
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500">Uptime</p>
                <p className="text-sm font-medium text-gray-900">24h 15m</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Load</p>
                <p className="text-sm font-medium text-gray-900">67%</p>
              </div>
            </div>
          </div>
        )}

        {globalMode && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500">Networks</p>
                <p className="text-sm font-medium text-gray-900">4</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Online</p>
                <p className="text-sm font-medium text-green-600">3</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Issues</p>
                <p className="text-sm font-medium text-red-600">1</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}