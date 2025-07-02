'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Zap, 
  Cpu, 
  Thermometer, 
  HardDrive,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Network,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useAdminQueries } from '@/hooks/useAdminQueries'
import { useNetworkQueries } from '@/hooks/useNetworkQueries'

interface LiveMetricsProps {
  isLive: boolean
  networkId: string | null
  globalMode: boolean
}

interface MetricsData {
  activeUsers: number
  totalSessions: number
  averageSpeed: { download: number; upload: number }
  systemHealth: {
    cpu: number
    memory: number
    temperature: number
    diskUsage: number
  }
  totalDataTransfer: { downloadGB: number; uploadGB: number }
  networkCount?: number // For global mode
  onlineNetworks?: number // For global mode
  trends?: {
    usersChange: number
    speedChange: number
    temperatureChange: number
  }
  alerts?: {
    critical: number
    warning: number
  }
}

// Define interfaces for API responses
interface GlobalDashboardResponse {
  networks?: {
    total: number
    active: number
    online: number
  }
  overview?: {
    totalActiveUsers: number
    totalSessions: number
    activeSessions: number
    completedSessions: number
    systemHealth?: {
      cpu: number
      memory: number
      temperature: number
      diskUsage?: number
    }
  }
  performance?: {
    averageSpeed: {
      download: number
      upload: number
      latency?: number
    }
    totalSpeedTests?: number
  }
  traffic?: {
    totalDataTransfer?: {
      downloadGB: number
      uploadGB: number
    }
  }
  dataUsage?: {
    totalDownloadGB: number
    totalUploadGB: number
    totalUsers: number
  }
  timestamp?: string
}

interface NetworkDashboardResponse {
  overview?: {
    activeUsers: number
    totalSessions: number
    systemHealth: {
      cpu: number
      memory: number
      temperature: number
      diskUsage: number
    }
  }
  performance?: {
    averageSpeed: {
      download: number
      upload: number
    }
  }
  traffic?: {
    totalDataTransfer: {
      downloadGB: number
      uploadGB: number
    }
  }
}

interface AlertsResponse {
  summary?: {
    total: number
    critical: number
    warning: number
    offline: number
  }
}

export default function LiveMetrics({ 
  isLive, 
  networkId = null, 
  globalMode = false 
}: LiveMetricsProps) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [previousMetrics, setPreviousMetrics] = useState<MetricsData | null>(null)

  // Use existing hooks
  const { useDashboard: useGlobalDashboard, useAlerts } = useAdminQueries()
  const networkQueries = useNetworkQueries(networkId || '')
  
  // Get data based on mode
  const globalDashboardQuery = useGlobalDashboard()
  const globalAlertsQuery = useAlerts()
  const networkDashboardQuery = networkQueries.useNetworkDashboard()
  
  // Type the responses properly
  const globalDashboard = globalDashboardQuery.data as GlobalDashboardResponse | undefined
  const globalAlerts = globalAlertsQuery.data as AlertsResponse | undefined
  const networkDashboard = networkDashboardQuery.data as NetworkDashboardResponse | undefined
  
  // Select appropriate query for loading/error states
  const primaryQuery = globalMode ? globalDashboardQuery : networkDashboardQuery
  const { isLoading: loading, error, refetch } = primaryQuery

  // Transform data into metrics format
  const metrics: MetricsData = React.useMemo(() => {
    const defaultMetrics: MetricsData = {
      activeUsers: 0,
      totalSessions: 0,
      averageSpeed: { download: 0, upload: 0 },
      systemHealth: { cpu: 0, memory: 0, temperature: 0, diskUsage: 0 },
      totalDataTransfer: { downloadGB: 0, uploadGB: 0 },
      networkCount: 0,
      onlineNetworks: 0,
      alerts: { critical: 0, warning: 0 }
    }

    if (globalMode && globalDashboard) {
      // Global mode - extract from global dashboard
      const overview = globalDashboard.overview
      const performance = globalDashboard.performance
      const networks = globalDashboard.networks
      const dataUsage = globalDashboard.dataUsage
      const traffic = globalDashboard.traffic

      return {
        activeUsers: overview?.totalActiveUsers || 0,
        totalSessions: overview?.totalSessions || 0,
        averageSpeed: {
          download: performance?.averageSpeed?.download || 0,
          upload: performance?.averageSpeed?.upload || 0
        },
        systemHealth: {
          cpu: overview?.systemHealth?.cpu || 0,
          memory: overview?.systemHealth?.memory || 0,
          temperature: overview?.systemHealth?.temperature || 0,
          diskUsage: overview?.systemHealth?.diskUsage || 0
        },
        totalDataTransfer: {
          downloadGB: dataUsage?.totalDownloadGB || traffic?.totalDataTransfer?.downloadGB || 0,
          uploadGB: dataUsage?.totalUploadGB || traffic?.totalDataTransfer?.uploadGB || 0
        },
        networkCount: networks?.total || 0,
        onlineNetworks: networks?.online || 0,
        alerts: {
          critical: globalAlerts?.summary?.critical || 0,
          warning: globalAlerts?.summary?.warning || 0
        }
      }
    } else if (!globalMode && networkDashboard) {
      // Network mode - extract from network dashboard
      const overview = networkDashboard.overview
      const performance = networkDashboard.performance
      const traffic = networkDashboard.traffic

      return {
        activeUsers: overview?.activeUsers || 0,
        totalSessions: overview?.totalSessions || 0,
        averageSpeed: {
          download: performance?.averageSpeed?.download || 0,
          upload: performance?.averageSpeed?.upload || 0
        },
        systemHealth: overview?.systemHealth || { cpu: 0, memory: 0, temperature: 0, diskUsage: 0 },
        totalDataTransfer: traffic?.totalDataTransfer || { downloadGB: 0, uploadGB: 0 },
        alerts: { critical: 0, warning: 0 } // Network-specific alerts would need separate endpoint
      }
    }

    return defaultMetrics
  }, [globalDashboard, networkDashboard, globalAlerts, globalMode])

  // Calculate trends when data changes
  const trendsData = React.useMemo(() => {
    if (!previousMetrics) return undefined

    return {
      usersChange: previousMetrics.activeUsers > 0 
        ? ((metrics.activeUsers - previousMetrics.activeUsers) / previousMetrics.activeUsers) * 100 
        : 0,
      speedChange: previousMetrics.averageSpeed.download > 0 
        ? ((metrics.averageSpeed.download - previousMetrics.averageSpeed.download) / previousMetrics.averageSpeed.download) * 100 
        : 0,
      temperatureChange: metrics.systemHealth.temperature - previousMetrics.systemHealth.temperature
    }
  }, [metrics, previousMetrics])

  // Update metrics with trends
  const metricsWithTrends: MetricsData = {
    ...metrics,
    trends: trendsData
  }

  // Update last updated time and previous metrics when data changes
  useEffect(() => {
    if (globalDashboard || networkDashboard) {
      setLastUpdated(new Date())
      setPreviousMetrics(metrics)
    }
  }, [globalDashboard, networkDashboard, metrics])

  // Auto-refresh for live mode
  useEffect(() => {
    if (isLive && (globalMode || networkId)) {
      const interval = setInterval(() => {
        refetch()
        if (globalMode) {
          globalAlertsQuery.refetch()
        }
      }, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isLive, networkId, globalMode, refetch, globalAlertsQuery])

  const getStatusColor = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return 'text-red-600 bg-red-50'
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getTemperatureStatus = (temp: number) => {
    if (temp >= 70) return { color: 'text-red-600', bg: 'bg-red-50', status: 'Critical', icon: XCircle }
    if (temp >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-50', status: 'Warm', icon: AlertTriangle }
    return { color: 'text-green-600', bg: 'bg-green-50', status: 'Normal', icon: CheckCircle }
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4" />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  if (!globalMode && !networkId) {
    return (
      <div className="bg-black rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select a network to view live metrics</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-black rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-black rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Failed to load live metrics</p>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
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

  const tempStatus = getTemperatureStatus(metricsWithTrends.systemHealth.temperature)
  const StatusIcon = tempStatus.icon

  return (
    <div className="bg-black rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-white">Live Metrics</h3>
            {globalMode ? (
              <Globe className="h-5 w-5 text-blue-500" />
            ) : (
              <Network className="h-5 w-5 text-green-500" />
            )}
            <span className="text-sm text-gray-500">
              {globalMode 
                ? `(${metricsWithTrends.onlineNetworks}/${metricsWithTrends.networkCount} networks online)`
                : `Network ${networkId}`
              }
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {isLive && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live</span>
              </div>
            )}
            {lastUpdated && (
              <div className="flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1" />
                {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Active Users */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">
                    {globalMode ? 'Total Users' : 'Active Users'}
                  </p>
                  <p className="text-lg font-bold text-blue-900">{metricsWithTrends.activeUsers}</p>
                </div>
              </div>
              {metricsWithTrends.trends && (
                <div className="flex flex-col items-end">
                  {getTrendIcon(metricsWithTrends.trends.usersChange)}
                  <span className={`text-xs font-medium ${getTrendColor(metricsWithTrends.trends.usersChange)}`}>
                    {Math.abs(metricsWithTrends.trends.usersChange).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Total Sessions */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">
                  {globalMode ? 'All Sessions' : 'Total Sessions'}
                </p>
                <p className="text-lg font-bold text-purple-900">{metricsWithTrends.totalSessions}</p>
              </div>
            </div>
          </div>

          {/* Average Speed */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Avg Speed</p>
                  <p className="text-lg font-bold text-green-900">
                    {metricsWithTrends.averageSpeed.download.toFixed(1)} Mbps
                  </p>
                  <p className="text-xs text-green-700">
                    ↑ {metricsWithTrends.averageSpeed.upload.toFixed(1)} Mbps
                  </p>
                </div>
              </div>
              {metricsWithTrends.trends && (
                <div className="flex flex-col items-end">
                  {getTrendIcon(metricsWithTrends.trends.speedChange)}
                  <span className={`text-xs font-medium ${getTrendColor(metricsWithTrends.trends.speedChange)}`}>
                    {Math.abs(metricsWithTrends.trends.speedChange).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* System Temperature */}
          <div className={`${tempStatus.bg} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Thermometer className={`h-8 w-8 ${tempStatus.color}`} />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${tempStatus.color}`}>Temperature</p>
                  <p className={`text-lg font-bold ${tempStatus.color.replace('text-', 'text-').replace('-600', '-900')}`}>
                    {metricsWithTrends.systemHealth.temperature.toFixed(1)}°C
                  </p>
                  <div className="flex items-center">
                    <StatusIcon className={`h-3 w-3 ${tempStatus.color} mr-1`} />
                    <p className={`text-xs ${tempStatus.color}`}>{tempStatus.status}</p>
                  </div>
                </div>
              </div>
              {metricsWithTrends.trends && (
                <div className="flex flex-col items-end">
                  {getTrendIcon(metricsWithTrends.trends.temperatureChange)}
                  <span className={`text-xs font-medium ${getTrendColor(metricsWithTrends.trends.temperatureChange)}`}>
                    {Math.abs(metricsWithTrends.trends.temperatureChange).toFixed(1)}°C
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Banner */}
        {metricsWithTrends.alerts && (metricsWithTrends.alerts.critical > 0 || metricsWithTrends.alerts.warning > 0) && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">System Alerts</p>
                <p className="text-sm text-yellow-700">
                  {metricsWithTrends.alerts.critical > 0 && `${metricsWithTrends.alerts.critical} critical alert${metricsWithTrends.alerts.critical > 1 ? 's' : ''}`}
                  {metricsWithTrends.alerts.critical > 0 && metricsWithTrends.alerts.warning > 0 && ', '}
                  {metricsWithTrends.alerts.warning > 0 && `${metricsWithTrends.alerts.warning} warning${metricsWithTrends.alerts.warning > 1 ? 's' : ''}`}
                </p>
              </div>
              <button className="text-yellow-700 hover:text-yellow-900 text-sm font-medium">
                View Details →
              </button>
            </div>
          </div>
        )}

        {/* Detailed System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* CPU Usage */}
          <div className="bg-blue-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Cpu className="h-5 w-5 text-gray-300 mr-2" />
                <span className="text-sm font-medium text-gray-200">
                  {globalMode ? 'Avg CPU Usage' : 'CPU Usage'}
                </span>
              </div>
              <span className={`text-sm font-bold ${getStatusColor(metricsWithTrends.systemHealth.cpu, { warning: 70, danger: 85 })}`}>
                {metricsWithTrends.systemHealth.cpu.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  metricsWithTrends.systemHealth.cpu >= 85 ? 'bg-red-500' :
                  metricsWithTrends.systemHealth.cpu >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(metricsWithTrends.systemHealth.cpu, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-blue-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <HardDrive className="h-5 w-5 text-gray-300 mr-2" />
                <span className="text-sm font-medium text-gray-200">
                  {globalMode ? 'Avg Memory' : 'Memory'}
                </span>
              </div>
              <span className={`text-sm font-bold ${getStatusColor(metricsWithTrends.systemHealth.memory, { warning: 80, danger: 90 })}`}>
                {metricsWithTrends.systemHealth.memory.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  metricsWithTrends.systemHealth.memory >= 90 ? 'bg-red-500' :
                  metricsWithTrends.systemHealth.memory >= 80 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(metricsWithTrends.systemHealth.memory, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Data Transfer */}
          <div className="bg-blue-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-200">
                {globalMode ? 'Total Data Transfer' : 'Data Transfer'}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-gray-300">Download</span>
                </div>
                <span className="font-medium text-white">
                  {metricsWithTrends.totalDataTransfer.downloadGB.toFixed(2)} GB
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-gray-300">Upload</span>
                </div>
                <span className="font-medium text-white">
                  {metricsWithTrends.totalDataTransfer.uploadGB.toFixed(2)} GB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-green-500 animate-pulse' : 'bg-black/80'}`}></div>
              <span className="text-gray-300">
                {isLive ? 'Live monitoring active' : 'Monitoring paused'}
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                globalMode ? 
                  (metricsWithTrends.onlineNetworks === metricsWithTrends.networkCount ? 'bg-green-500' : 'bg-yellow-500') :
                  'bg-blue-500'
              }`}></div>
              <span className="text-gray-300">
                {globalMode ? 
                  `${metricsWithTrends.onlineNetworks}/${metricsWithTrends.networkCount} Networks Online` :
                  'Network Online'
                }
              </span>
            </div>
          </div>
          
          {metricsWithTrends.activeUsers > 0 && (
            <div className="text-gray-500">
              Avg per user: {(metricsWithTrends.totalDataTransfer.downloadGB / Math.max(metricsWithTrends.activeUsers, 1)).toFixed(2)} GB
            </div>
          )}
        </div>
      </div>
    </div>
  )
}