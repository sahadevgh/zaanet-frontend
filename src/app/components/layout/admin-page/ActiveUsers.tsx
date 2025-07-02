// components/ActiveUsers.tsx
'use client'

import React, { useState } from 'react'
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Wifi, 
  Clock, 
  Download, 
  Upload,
  Activity,
  Eye,
  RefreshCw,
  Globe,
  Network,
  AlertCircle
} from 'lucide-react'
import { useAdminQueries } from '@/hooks/useAdminQueries'
import { useNetworkQueries } from '@/hooks/useNetworkQueries'

interface ActiveUsersProps {
  networkId?: string | null
  globalMode?: boolean
  detailed?: boolean
}

interface User {
  ip: string
  sessionId: string
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown'
  lastSeen: string
  dataUsage: {
    downloadMB: number
    uploadMB: number
  }
  speedTestCount: number
  lastSpeedTest: {
    downloadMbps: number
    uploadMbps: number
    latencyMs: number
    timestamp: string
  } | null
  networkId?: string // For global mode
}

interface GlobalStatsData {
  devices?: {
    mobile: number;
    desktop: number;
    tablet: number;
    unknown: number;
  };
  summary?: {
    totalSessions: number;
    totalNetworks: number;
    completedSessions: number;
    totalSpeedTests: number;
    totalDataGB: number;
  };
}

interface NetworkSessionData {
  deviceBreakdown?: {
    mobile: number;
    desktop: number;
    tablet: number;
    unknown: number;
  };
  active?: number;
  activeSessions?: number;
}

export default function ActiveUsers({ networkId, globalMode = true, detailed = false }: ActiveUsersProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Use existing hooks
  const { useStats: useGlobalStats } = useAdminQueries()
  const networkQueries = useNetworkQueries(networkId || '')
  
  // Get data based on mode
  const globalStatsQuery = useGlobalStats('1h')
  const networkSessionQuery = networkQueries.useSessionAnalytics()
  
  // Select appropriate query
  const dataQuery = globalMode ? globalStatsQuery : networkSessionQuery
  const { data = {}, isLoading: loading, error, refetch } = dataQuery as { 
    data?: GlobalStatsData | NetworkSessionData, 
    isLoading: boolean, 
    error: any, 
    refetch: () => void 
  }

  // Transform the session analytics data into user data
  // This is a simplified transformation - you may need to adjust based on your actual data structure
  const users: User[] = React.useMemo(() => {
    if (!data) return []
    
    // Extract active users from session analytics or stats data
    // Since the actual user data might not be in session analytics,
    // this would typically come from a dedicated active users endpoint
    // For now, we'll return an empty array and show appropriate messages
    
    // In a real implementation, you might:
    // 1. Add active users data to your existing endpoints
    // 2. Create dedicated active users endpoints
    // 3. Extract user info from existing session/metrics data
    
    return [] // Return empty for now since we need real active user endpoints
  }, [data])

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-5 w-5" />
      case 'desktop': return <Monitor className="h-5 w-5" />
      case 'tablet': return <Tablet className="h-5 w-5" />
      default: return <Monitor className="h-5 w-5" />
    }
  }

  const getDeviceColor = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return 'text-green-600 bg-green-50'
      case 'desktop': return 'text-blue-600 bg-blue-50'
      case 'tablet': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h ${diffMins % 60}m ago`
  }

  const formatDataUsage = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`
    }
    return `${mb.toFixed(1)} MB`
  }

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-500 mb-4">Failed to load data</div>
          <p className="text-sm text-gray-500 mb-4">
            {error.message || 'Unable to fetch data'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show message when no network is selected
  if (!globalMode && !networkId) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Please select a network to view active users</p>
        </div>
      </div>
    )
  }

  // Show current session statistics while active user tracking is being implemented
  const sessionStats = globalMode ? (data as GlobalStatsData)?.devices : (data as NetworkSessionData)?.deviceBreakdown
  const totalActiveSessions = globalMode
    ? (('summary' in (data ?? {})) ? (data as GlobalStatsData).summary?.totalSessions : undefined)
    : (('active' in (data ?? {})) ? (data as NetworkSessionData).active : undefined)

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Users ({users.length})
            </h3>
            <div className="flex items-center space-x-2">
              {globalMode ? (
                <Globe className="h-4 w-4 text-blue-500" />
              ) : (
                <Network className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm text-gray-500">
                {globalMode ? 'Global View' : `Network ${networkId}`}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live</span>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Show implementation notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-800">
                <strong>Active User Tracking:</strong> Currently showing session statistics.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                To show real-time active users, implement dedicated active user tracking endpoints.
              </p>
            </div>
          </div>
        </div>

        {/* Current Session Statistics */}
        {sessionStats && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Current Session Statistics</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(sessionStats).map(([deviceType, count]) => (
                <div key={deviceType} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`inline-flex p-2 rounded-lg mb-2 ${getDeviceColor(deviceType)}`}>
                    {getDeviceIcon(deviceType)}
                  </div>
                  <p className="text-xl font-bold text-gray-900">{count as number}</p>
                  <p className="text-sm text-gray-500 capitalize">{deviceType}</p>
                </div>
              ))}
            </div>
            
            {totalActiveSessions && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Total Active Sessions: <span className="font-semibold">{totalActiveSessions}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {users.length === 0 ? (
          <div className="text-center py-8">
            <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No individual user tracking implemented yet
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Add active user endpoints to track individual users in real-time
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div 
                key={`${user.ip}-${user.sessionId}`} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Device Icon */}
                    <div className={`p-2 rounded-lg ${getDeviceColor(user.deviceType)}`}>
                      {getDeviceIcon(user.deviceType)}
                    </div>
                    
                    {/* User Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{user.ip}</p>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {user.deviceType}
                        </span>
                        {globalMode && user.networkId && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {user.networkId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(user.lastSeen)}
                        </div>
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-1" />
                          {user.speedTestCount} tests
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Data Usage */}
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <div className="flex items-center text-green-600">
                          <Download className="h-4 w-4 mr-1" />
                          {formatDataUsage(user.dataUsage.downloadMB)}
                        </div>
                        <div className="flex items-center text-blue-600 mt-1">
                          <Upload className="h-4 w-4 mr-1" />
                          {formatDataUsage(user.dataUsage.uploadMB)}
                        </div>
                      </div>
                      
                      {detailed && (
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Speed Test Info */}
                {user.lastSpeedTest && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Latest Speed Test:</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-green-600 font-medium">
                          ↓ {user.lastSpeedTest.downloadMbps.toFixed(1)} Mbps
                        </span>
                        <span className="text-blue-600 font-medium">
                          ↑ {user.lastSpeedTest.uploadMbps.toFixed(1)} Mbps
                        </span>
                        <span className="text-purple-600 font-medium">
                          {user.lastSpeedTest.latencyMs}ms
                        </span>
                        <span className="text-gray-400">
                          {formatTime(user.lastSpeedTest.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        
      </div>
      
      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  User Details: {selectedUser.ip}
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Session Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Session ID:</span>
                      <span className="font-mono">{selectedUser.sessionId.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Device Type:</span>
                      <span className="capitalize">{selectedUser.deviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Seen:</span>
                      <span>{formatTime(selectedUser.lastSeen)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Speed Tests:</span>
                      <span>{selectedUser.speedTestCount}</span>
                    </div>
                    {globalMode && selectedUser.networkId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Network:</span>
                        <span className="font-mono">{selectedUser.networkId}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Data Usage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Downloaded:</span>
                      <span className="text-green-600 font-medium">
                        {formatDataUsage(selectedUser.dataUsage.downloadMB)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Uploaded:</span>
                      <span className="text-blue-600 font-medium">
                        {formatDataUsage(selectedUser.dataUsage.uploadMB)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-medium">
                        {formatDataUsage(selectedUser.dataUsage.downloadMB + selectedUser.dataUsage.uploadMB)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedUser.lastSpeedTest && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Latest Speed Test</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-lg font-bold text-green-600">
                        {selectedUser.lastSpeedTest.downloadMbps.toFixed(1)}
                      </p>
                      <p className="text-sm text-green-700">Mbps Down</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">
                        {selectedUser.lastSpeedTest.uploadMbps.toFixed(1)}
                      </p>
                      <p className="text-sm text-blue-700">Mbps Up</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-lg font-bold text-purple-600">
                        {selectedUser.lastSpeedTest.latencyMs}
                      </p>
                      <p className="text-sm text-purple-700">ms Latency</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Tested {formatTime(selectedUser.lastSpeedTest.timestamp)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}