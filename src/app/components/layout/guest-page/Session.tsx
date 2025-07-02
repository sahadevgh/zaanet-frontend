'use client'

import { useState, useEffect } from 'react'
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
  X
} from 'lucide-react'

interface ActiveUsersProps {
  detailed?: boolean
  networkId?: string | null
  globalMode?: boolean
  isLive?: boolean
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

export default function ActiveUsers({ 
  detailed = false, 
  networkId = null, 
  globalMode = false,
  isLive = true 
}: ActiveUsersProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setError(null)
      let endpoint = '/admin/dashboard'
      
      if (globalMode) {
        endpoint = '/api/admin/global/dashboard'
      } else if (networkId) {
        endpoint = `/api/admin/${networkId}/dashboard`
      }

      // Simulated API call - replace with actual fetch
      const mockUsers: User[] = [
        {
          ip: '192.168.1.101',
          sessionId: 'sess_abc123def456',
          deviceType: 'mobile',
          lastSeen: new Date(Date.now() - 120000).toISOString(), // 2 min ago
          dataUsage: { downloadMB: 45.6, uploadMB: 12.3 },
          speedTestCount: 3,
          lastSpeedTest: {
            downloadMbps: 87.5,
            uploadMbps: 23.1,
            latencyMs: 15,
            timestamp: new Date(Date.now() - 300000).toISOString()
          },
          networkId: globalMode ? 'net-001' : undefined
        },
        {
          ip: '192.168.1.102',
          sessionId: 'sess_xyz789uvw012',
          deviceType: 'desktop',
          lastSeen: new Date(Date.now() - 60000).toISOString(), // 1 min ago
          dataUsage: { downloadMB: 156.8, uploadMB: 45.2 },
          speedTestCount: 7,
          lastSpeedTest: {
            downloadMbps: 94.2,
            uploadMbps: 28.7,
            latencyMs: 12,
            timestamp: new Date(Date.now() - 180000).toISOString()
          },
          networkId: globalMode ? 'net-002' : undefined
        },
        {
          ip: '192.168.1.103',
          sessionId: 'sess_mno345pqr678',
          deviceType: 'tablet',
          lastSeen: new Date(Date.now() - 30000).toISOString(), // 30s ago
          dataUsage: { downloadMB: 78.4, uploadMB: 19.6 },
          speedTestCount: 2,
          lastSpeedTest: null,
          networkId: globalMode ? 'net-001' : undefined
        }
      ]

      setUsers(mockUsers)
      setLoading(false)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setError('Failed to fetch active users')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (globalMode || networkId) {
      fetchUsers()
    }
  }, [networkId, globalMode])

  useEffect(() => {
    if (isLive && (globalMode || networkId)) {
      const interval = setInterval(fetchUsers, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isLive, networkId, globalMode])

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

  if (!globalMode && !networkId) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select a network to view active users</p>
        </div>
      </div>
    )
  }

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

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Active Users ({users.length})
            {globalMode && <span className="text-sm font-normal text-gray-500 ml-2">(All Networks)</span>}
          </h3>
          <div className="flex items-center space-x-4">
            {isLive && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live</span>
              </div>
            )}
            <button
              onClick={fetchUsers}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        {lastUpdate && (
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>
      
      <div className="p-6">
        {users.length === 0 ? (
          <div className="text-center py-8">
            <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {globalMode ? 'No active users across all networks' : 'No active users connected'}
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
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
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
        
        {/* Summary Stats */}
        {users.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.deviceType === 'mobile').length}
                </p>
                <p className="text-sm text-gray-500">Mobile</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.deviceType === 'desktop').length}
                </p>
                <p className="text-sm text-gray-500">Desktop</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.deviceType === 'tablet').length}
                </p>
                <p className="text-sm text-gray-500">Tablet</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {users.reduce((sum, user) => sum + (user.dataUsage.downloadMB + user.dataUsage.uploadMB), 0).toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">Total MB</p>
              </div>
            </div>
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
                  {globalMode && selectedUser.networkId && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({selectedUser.networkId})
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
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
                        <span className="font-medium">{selectedUser.networkId}</span>
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
                      <p className="text-2xl font-bold text-green-600">
                        {selectedUser.lastSpeedTest.downloadMbps.toFixed(1)}
                      </p>
                      <p className="text-sm text-green-700">Mbps Down</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedUser.lastSpeedTest.uploadMbps.toFixed(1)}
                      </p>
                      <p className="text-sm text-blue-700">Mbps Up</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
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