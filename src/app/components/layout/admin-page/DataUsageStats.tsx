'use client'

import { useState, useEffect } from 'react'
import { 
  Download, 
  Upload, 
  Users, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Globe,
  Network,
  Eye,
  EyeOff
} from 'lucide-react'

interface DataUsageStatsProps {
  detailed?: boolean
  networkId?: string | null
  globalMode?: boolean
  isLive?: boolean
}

interface DataUsageData {
  totalUsers: number
  totalDownloadBytes: number
  totalUploadBytes: number
  totalBytes: number
  averageUsagePerUser: { downloadBytes: number; uploadBytes: number }
  heaviestUsers: Array<{ 
    ip: string
    totalBytes: number
    downloadBytes: number
    uploadBytes: number
    networkId?: string
    sessionDuration?: number
  }>
  trends?: {
    downloadTrend: number // percentage change
    uploadTrend: number
    usersTrend: number
  }
  timeframe?: string
}

export default function DataUsageStats({ 
  detailed = false,
  networkId = null,
  globalMode = false,
  isLive = true
}: DataUsageStatsProps) {
  const [usageData, setUsageData] = useState<DataUsageData>({
    totalUsers: 0,
    totalDownloadBytes: 0,
    totalUploadBytes: 0,
    totalBytes: 0,
    averageUsagePerUser: { downloadBytes: 0, uploadBytes: 0 },
    heaviestUsers: [],
    trends: { downloadTrend: 0, uploadTrend: 0, usersTrend: 0 },
    timeframe: '1h'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [showMaskedIPs, setShowMaskedIPs] = useState(true)

  const fetchUsageData = async () => {
    try {
      setError(null)
      let endpoint = '/api/admin/data-usage'
      
      if (globalMode) {
        endpoint = '/api/admin/global/data-usage'
      } else if (networkId) {
        endpoint = `/api/admin/${networkId}/data-usage`
      }

      // Simulated API call with enhanced mock data
      const mockData: DataUsageData = {
        totalUsers: globalMode ? 47 : 12,
        totalDownloadBytes: globalMode ? 2847592847 : 847592847, // ~2.85GB global, ~847MB network
        totalUploadBytes: globalMode ? 892847593 : 234847593,    // ~892MB global, ~234MB network
        totalBytes: globalMode ? 3740440440 : 1082440440,
        averageUsagePerUser: {
          downloadBytes: globalMode ? 60586018 : 70632737,  // ~60MB global avg, ~70MB network avg
          uploadBytes: globalMode ? 18996331 : 19570633     // ~19MB global avg, ~19MB network avg
        },
        heaviestUsers: [
          {
            ip: '192.168.1.101',
            totalBytes: 456789123,
            downloadBytes: 387654321,
            uploadBytes: 69134802,
            networkId: globalMode ? 'net-001' : undefined,
            sessionDuration: 7200 // 2 hours in seconds
          },
          {
            ip: '192.168.1.102', 
            totalBytes: 234567890,
            downloadBytes: 198765432,
            uploadBytes: 35802458,
            networkId: globalMode ? 'net-002' : undefined,
            sessionDuration: 5400 // 1.5 hours
          },
          {
            ip: '192.168.1.103',
            totalBytes: 123456789,
            downloadBytes: 105432198,
            uploadBytes: 18024591,
            networkId: globalMode ? 'net-001' : undefined,
            sessionDuration: 3600 // 1 hour
          },
          {
            ip: '192.168.1.104',
            totalBytes: 98765432,
            downloadBytes: 84321987,
            uploadBytes: 14443445,
            networkId: globalMode ? 'net-003' : undefined,
            sessionDuration: 2700 // 45 minutes
          },
          {
            ip: '192.168.1.105',
            totalBytes: 76543210,
            downloadBytes: 65432109,
            uploadBytes: 11111101,
            networkId: globalMode ? 'net-002' : undefined,
            sessionDuration: 1800 // 30 minutes
          }
        ],
        trends: {
          downloadTrend: Math.random() > 0.5 ? 12.5 : -8.3,
          uploadTrend: Math.random() > 0.5 ? 7.2 : -4.1,
          usersTrend: Math.random() > 0.5 ? 15.7 : -2.8
        },
        timeframe: '1h'
      }

      // Calculate total bytes
      mockData.totalBytes = mockData.totalDownloadBytes + mockData.totalUploadBytes

      setUsageData(mockData)
      setLoading(false)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch data usage:', error)
      setError('Failed to fetch data usage statistics')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (globalMode || networkId) {
      fetchUsageData()
    }
  }, [networkId, globalMode])

  useEffect(() => {
    if (isLive && (globalMode || networkId)) {
      const interval = setInterval(fetchUsageData, 60000) // Update every minute
      return () => clearInterval(interval)
    }
  }, [isLive, networkId, globalMode])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const maskIP = (ip: string): string => {
    if (!showMaskedIPs) return ip
    const parts = ip.split('.')
    return `${parts[0]}.${parts[1]}.***.**`
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  if (!globalMode && !networkId) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select a network to view data usage statistics</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUsageData}
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
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Data Usage Statistics</h3>
            {globalMode && <Globe className="h-5 w-5 text-blue-500" />}
            {!globalMode && <Network className="h-5 w-5 text-green-500" />}
          </div>
          <div className="flex items-center space-x-2">
            {isLive && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live</span>
              </div>
            )}
            <button
              onClick={fetchUsageData}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        {lastUpdate && (
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()} • Timeframe: {usageData.timeframe}
          </p>
        )}
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-xl font-bold text-blue-900">{usageData.totalUsers}</p>
                </div>
              </div>
              {usageData.trends && (
                <div className="flex items-center">
                  {getTrendIcon(usageData.trends.usersTrend)}
                  <span className={`text-sm font-medium ml-1 ${getTrendColor(usageData.trends.usersTrend)}`}>
                    {Math.abs(usageData.trends.usersTrend).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Download className="h-6 w-6 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Downloaded</p>
                  <p className="text-lg font-bold text-green-900">
                    {formatBytes(usageData.totalDownloadBytes)}
                  </p>
                </div>
              </div>
              {usageData.trends && (
                <div className="flex items-center">
                  {getTrendIcon(usageData.trends.downloadTrend)}
                  <span className={`text-sm font-medium ml-1 ${getTrendColor(usageData.trends.downloadTrend)}`}>
                    {Math.abs(usageData.trends.downloadTrend).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Upload className="h-6 w-6 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Uploaded</p>
                  <p className="text-lg font-bold text-purple-900">
                    {formatBytes(usageData.totalUploadBytes)}
                  </p>
                </div>
              </div>
              {usageData.trends && (
                <div className="flex items-center">
                  {getTrendIcon(usageData.trends.uploadTrend)}
                  <span className={`text-sm font-medium ml-1 ${getTrendColor(usageData.trends.uploadTrend)}`}>
                    {Math.abs(usageData.trends.uploadTrend).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Total Transfer</p>
                <p className="text-lg font-bold text-orange-900">
                  {formatBytes(usageData.totalBytes)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Average Usage */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Average Usage Per User</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Download</span>
              </div>
              <span className="text-sm font-medium">
                {formatBytes(usageData.averageUsagePerUser.downloadBytes)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Upload</span>
              </div>
              <span className="text-sm font-medium">
                {formatBytes(usageData.averageUsagePerUser.uploadBytes)}
              </span>
            </div>
          </div>
        </div>

        {/* Top Users */}
        {detailed && usageData.heaviestUsers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Top Data Users</h4>
              <button
                onClick={() => setShowMaskedIPs(!showMaskedIPs)}
                className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showMaskedIPs ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Show IPs
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Mask IPs
                  </>
                )}
              </button>
            </div>
            <div className="space-y-2">
              {usageData.heaviestUsers.slice(0, 5).map((user, index) => (
                <div key={user.ip} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {maskIP(user.ip)}
                        </span>
                        {globalMode && user.networkId && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {user.networkId}
                          </span>
                        )}
                      </div>
                      {user.sessionDuration && (
                        <span className="text-xs text-gray-500">
                          Session: {formatDuration(user.sessionDuration)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatBytes(user.totalBytes)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ↓{formatBytes(user.downloadBytes)} ↑{formatBytes(user.uploadBytes)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}