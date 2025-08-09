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


interface LiveMetricsProps {
  isLive: boolean;
  networkId: string | null;
  globalMode: boolean;
  dashboardData?: any; 
  refetch?: () => void;
  error?: Error | null;
  loading: boolean;
}

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

export default function LiveMetrics({ 
  isLive, 
  networkId = null, 
  globalMode = false,
  dashboardData,
  refetch,
  error,
  loading
}: LiveMetricsProps) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

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
            onClick={refetch}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const tempStatus = getTemperatureStatus(dashboardData?.overview?.systemHealth.temperature)
  const StatusIcon = tempStatus.icon

  return (
    <div className="bg-black rounded-xl shadow-sm border border-gray-500/25">
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
                ? `(${dashboardData.networks.online}/${dashboardData.networks.total} networks online)`
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
              onClick={refetch}
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
                  <p className="text-lg font-bold text-blue-900">{dashboardData?.overview?.totalActiveUsers}</p>
                </div>
              </div>
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
                <p className="text-lg font-bold text-purple-900">{dashboardData?.overview?.totalSessions}</p>
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
                    {dashboardData?.performance?.averageSpeed.download.toFixed(1)} Mbps
                  </p>
                  <p className="text-xs text-green-700">
                    ↑ {dashboardData?.performance?.averageSpeed.upload.toFixed(1)} Mbps
                  </p>
                </div>
              </div>
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
                    {dashboardData?.overview?.systemHealth.temperature.toFixed(1)}°C
                  </p>
                  <div className="flex items-center">
                    <StatusIcon className={`h-3 w-3 ${tempStatus.color} mr-1`} />
                    <p className={`text-xs ${tempStatus.color}`}>{tempStatus.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              <span className={`text-sm font-bold ${getStatusColor(dashboardData?.overview?.systemHealth.cpu, { warning: 70, danger: 85 })}`}>
                {dashboardData?.overview?.systemHealth.cpu.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  dashboardData?.overview?.systemHealth.cpu >= 85 ? 'bg-red-500' :
                  dashboardData?.overview?.systemHealth.cpu >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(dashboardData?.overview?.systemHealth.cpu, 100)}%` }}
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
              <span className={`text-sm font-bold ${getStatusColor(dashboardData?.overview?.systemHealth.memory, { warning: 80, danger: 90 })}`}>
                {dashboardData?.overview?.systemHealth.memory.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  dashboardData?.overview?.systemHealth.memory >= 90 ? 'bg-red-500' :
                  dashboardData?.overview?.systemHealth.memory >= 80 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(dashboardData?.overview?.systemHealth.memory, 100)}%` }}
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
                  {dashboardData.traffic.totalDataTransfer.downloadGB.toFixed(2)} GB
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-gray-300">Upload</span>
                </div>
                <span className="font-medium text-white">
                  {dashboardData.traffic.totalDataTransfer.uploadGB.toFixed(2)} GB
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
                  (dashboardData?.overview?.onlineNetworks === dashboardData?.overview?.networkCount ? 'bg-green-500' : 'bg-yellow-500') :
                  'bg-blue-500'
              }`}></div>
              <span className="text-gray-300">
                {globalMode ? 
                  `${dashboardData?.overview?.onlineNetworks}/${dashboardData?.overview?.networkCount} Networks Online` :
                  'Network Online'
                }
              </span>
            </div>
          </div>

          {dashboardData?.overview?.totalActiveUsers > 0 && (
            <div className="text-gray-500">
              Avg per user: {(dashboardData?.traffic?.totalDataTransfer.downloadGB / Math.max(dashboardData?.overview?.totalActiveUsers, 1)).toFixed(2)} GB
            </div>
          )}
        </div>
      </div>
    </div>
  )
}