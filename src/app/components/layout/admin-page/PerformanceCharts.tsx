'use client'

import React, { useState, useEffect } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  RefreshCw, 
  Download, 
  Upload,
  Cpu,
  Thermometer,
  HardDrive,
  Globe,
  Network,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import { useAdminQueries } from '@/hooks/useAdminQueries'
import { useNetworkQueries } from '@/hooks/useNetworkQueries'

// Define proper TypeScript interfaces for API responses
interface GlobalStatsResponse {
  timeRange?: string;
  period?: { start: Date; end: Date };
  summary?: {
    totalNetworks: number;
    totalSessions: number;
    completedSessions: number;
    totalSpeedTests: number;
    totalDataGB: number;
  };
  performance?: {
    avgCPU: number;
    maxCPU: number;
    avgMemory: number;
    maxMemory: number;
    avgTemperature: number;
    maxTemperature: number;
  };
  speed?: {
    globalAverage: {
      download: number;
      upload: number;
    };
    networkBreakdown: Array<{
      networkId: string;
      avgDownload: number;
      avgUpload: number;
      totalTests: number;
      hourlyPerformance: Array<{
        hour: number;
        avgDownload: number;
        avgUpload: number;
        avgLatency: number;
        testCount: number;
      }>;
    }>;
  };
  usage?: {
    totalDownloadGB: number;
    totalUploadGB: number;
    networkBreakdown: Array<{
      networkId: string;
      downloadGB: number;
      uploadGB: number;
      dailyUsage: Array<{
        date: string;
        downloadGB: number;
        uploadGB: number;
        avgUsers: number;
        maxUsers: number;
      }>;
    }>;
  };
  devices?: {
    mobile: number;
    desktop: number;
    tablet: number;
    unknown: number;
  };
  networkPerformance?: Array<{
    networkId: string;
    avgCPU: number;
    maxCPU: number;
    avgMemory: number;
    maxMemory: number;
    avgTemp: number;
    maxTemp: number;
    totalActiveUsers: number;
    dataPoints: number;
  }>;
}

interface NetworkPerformanceResponse {
  speedData?: Array<{
    timestamp: string;
    download: number;
    upload: number;
    latency?: number;
  }>;
  systemMetrics?: Array<{
    timestamp: string;
    cpu: number;
    memory: number;
    temperature: number;
  }>;
  averageSpeed?: {
    download: number;
    upload: number;
  };
}

interface PerformanceChartsProps {
  detailed?: boolean
  networkId: string | null
  globalMode: boolean
  isLive?: boolean
}

interface PerformanceData {
  speedData: Array<{ 
    timestamp: string
    download: number
    upload: number
    latency?: number
    networkId?: string
  }>
  systemMetrics: Array<{ 
    timestamp: string
    cpu: number
    memory: number
    temperature: number
    networkId?: string
  }>
  averageSpeed: { download: number; upload: number }
  peakSpeed?: { download: number; upload: number }
  networkBreakdown?: Array<{
    networkId: string
    avgDownload: number
    avgUpload: number
    testCount: number
  }>
  timeRange?: string
}

export default function PerformanceCharts({ 
  detailed = false,
  networkId = null,
  globalMode = true,
  isLive = true
}: PerformanceChartsProps) {
  const [activeChart, setActiveChart] = useState<'speed' | 'system' | 'network'>('speed')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Use existing hooks
  const { useStats: useGlobalStats } = useAdminQueries()
  const networkQueries = useNetworkQueries(networkId || '')
  
  // Get data based on mode
  const globalStatsQuery = useGlobalStats('1h') // Get recent performance data
  const networkPerformanceQuery = networkQueries.usePerformanceData()
  
  // Select appropriate query
  const dataQuery = globalMode ? globalStatsQuery : networkPerformanceQuery
  const { data, isLoading: loading, error, refetch } = dataQuery

  // Extract data for global and network modes
  const globalData: GlobalStatsResponse | undefined = globalMode ? (data as GlobalStatsResponse) : undefined
  const networkData: NetworkPerformanceResponse | undefined = !globalMode ? (data as NetworkPerformanceResponse) : undefined

  // Transform data into performance data structure with proper type safety
  const performanceData: PerformanceData = React.useMemo(() => {
    const defaultData: PerformanceData = {
      speedData: [],
      systemMetrics: [],
      averageSpeed: { download: 0, upload: 0 },
      peakSpeed: { download: 0, upload: 0 },
      networkBreakdown: [],
      timeRange: '1h'
    }

    if (globalMode && globalData) {
      // Global mode - extract from global stats with type safety
      const speedBreakdown = globalData.speed?.networkBreakdown || []
      const networkPerformance = globalData.networkPerformance || []
      
      // Create time series data from hourly performance data
      const now = new Date()
      const speedData: Array<{ timestamp: string; download: number; upload: number; latency?: number; networkId?: string }> = []
      
      speedBreakdown.forEach((network) => {
        if (network.hourlyPerformance && network.hourlyPerformance.length > 0) {
          network.hourlyPerformance.forEach((hourData, index) => {
            speedData.push({
              timestamp: new Date(now.getTime() - (network.hourlyPerformance.length - index) * 60 * 60 * 1000).toISOString(),
              download: hourData.avgDownload,
              upload: hourData.avgUpload,
              latency: hourData.avgLatency,
              networkId: network.networkId
            })
          })
        }
      })

      const systemMetrics: Array<{ timestamp: string; cpu: number; memory: number; temperature: number; networkId?: string }> = []
      
      networkPerformance.forEach((network) => {
        // Generate time series from network performance data
        Array.from({ length: 6 }, (_, i) => {
          systemMetrics.push({
            timestamp: new Date(now.getTime() - (5 - i) * 10 * 60 * 1000).toISOString(),
            cpu: network.avgCPU,
            memory: network.avgMemory,
            temperature: network.avgTemp,
            networkId: network.networkId
          })
        })
      })

      return {
        speedData,
        systemMetrics,
        averageSpeed: globalData.speed?.globalAverage || { download: 0, upload: 0 },
        peakSpeed: {
          download: Math.max(...speedBreakdown.map(n => n.avgDownload), 0),
          upload: Math.max(...speedBreakdown.map(n => n.avgUpload), 0)
        },
        networkBreakdown: speedBreakdown.map((network) => ({
          networkId: network.networkId,
          avgDownload: network.avgDownload,
          avgUpload: network.avgUpload,
          testCount: network.totalTests
        })),
        timeRange: globalData.timeRange || '1h'
      }
    } else if (!globalMode && networkData) {
      // Network mode - extract from network performance data with type safety
      const speedData = networkData.speedData || []
      const systemMetrics = networkData.systemMetrics || []
      const averageSpeed = networkData.averageSpeed || { download: 0, upload: 0 }

      return {
        speedData: speedData.map((item) => ({
          timestamp: item.timestamp,
          download: item.download,
          upload: item.upload,
          latency: item.latency
        })),
        systemMetrics: systemMetrics.map((item) => ({
          timestamp: item.timestamp,
          cpu: item.cpu,
          memory: item.memory,
          temperature: item.temperature
        })),
        averageSpeed,
        peakSpeed: {
          download: Math.max(...speedData.map((d) => d.download), 0),
          upload: Math.max(...speedData.map((d) => d.upload), 0)
        },
        timeRange: '1h'
      }
    }

    return defaultData
  }, [globalData, networkData, globalMode])

  // Update last update time when data changes
  useEffect(() => {
    if (data) {
      setLastUpdate(new Date())
    }
  }, [data])

  // Auto-refresh for live mode
  useEffect(() => {
    if (isLive && (globalMode || networkId)) {
      const interval = setInterval(() => {
        refetch()
      }, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isLive, networkId, globalMode, refetch])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getInsights = () => {
    if (!performanceData.speedData.length) return { performance: [], system: [] }
    
    const avgLatency = performanceData.speedData.reduce((sum, d) => sum + (d.latency || 0), 0) / performanceData.speedData.length
    const maxTemp = Math.max(...performanceData.systemMetrics.map(m => m.temperature), 0)
    const avgCpu = performanceData.systemMetrics.length > 0 
      ? performanceData.systemMetrics.reduce((sum, m) => sum + m.cpu, 0) / performanceData.systemMetrics.length 
      : 0
    
    return {
      performance: [
        `Peak download: ${performanceData.peakSpeed?.download.toFixed(1)} Mbps`,
        `Average latency: ${avgLatency.toFixed(0)}ms`,
        `Test count: ${performanceData.speedData.length}`,
        globalMode ? `Networks monitored: ${performanceData.networkBreakdown?.length || 0}` : 'Connection: Stable'
      ],
      system: [
        `Max temperature: ${maxTemp.toFixed(1)}°C`,
        `Average CPU: ${avgCpu.toFixed(1)}%`,
        `System status: ${maxTemp > 70 ? 'Warning' : 'Normal'}`,
        globalMode ? 'Multi-network monitoring' : 'Single network monitoring'
      ]
    }
  }

  // Show network selection message
  if (!globalMode && !networkId) {
    return (
      <div className="bg-black rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-300">Select a network to view performance charts</p>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="bg-black rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-black rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Failed to load performance data</p>
          <p className="text-sm text-gray-300 mb-4">{error.message}</p>
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

  const insights = getInsights()

  return (
    <div className="bg-black rounded-xl shadow-sm border border-gray-500/25">
      <div className="p-6 border-b border-gray-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-white">Performance Charts</h3>
            {globalMode ? (
              <Globe className="h-5 w-5 text-blue-500" />
            ) : (
              <Network className="h-5 w-5 text-green-500" />
            )}
            <span className="text-sm text-gray-300">
              {globalMode ? 'Global View' : `Network ${networkId}`}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveChart('speed')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeChart === 'speed' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-300 hover:bg-blue-900'
              }`}
            >
              Speed Tests
            </button>
            <button
              onClick={() => setActiveChart('system')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeChart === 'system' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-300 hover:bg-blue-900'
              }`}
            >
              System Metrics
            </button>
            {globalMode && (
              <button
                onClick={() => setActiveChart('network')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  activeChart === 'network' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-300 hover:bg-blue-900'
                }`}
              >
                Networks
              </button>
            )}
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-300 hover:text-gray-300 hover:bg-blue-900 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        {lastUpdate && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-300">
              Last updated: {lastUpdate.toLocaleTimeString()} • Timeframe: {performanceData.timeRange}
            </p>
            {isLive && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-300">Live</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className={`grid gap-4 mb-6 ${globalMode ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'}`}>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Download className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Avg Download</p>
                <p className="text-xl font-bold text-green-900">
                  {performanceData.averageSpeed.download.toFixed(1)} Mbps
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Upload className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Avg Upload</p>
                <p className="text-xl font-bold text-blue-900">
                  {performanceData.averageSpeed.upload.toFixed(1)} Mbps
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Data Points</p>
                <p className="text-xl font-bold text-purple-900">
                  {performanceData.speedData.length}
                </p>
              </div>
            </div>
          </div>

          {globalMode && (
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <Globe className="h-6 w-6 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600">Networks</p>
                  <p className="text-xl font-bold text-orange-900">
                    {performanceData.networkBreakdown?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* No Data Message */}
        {performanceData.speedData.length === 0 && performanceData.systemMetrics.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-300 mb-2">No performance data available</p>
            <p className="text-sm text-gray-300">
              {globalMode 
                ? 'Performance data will appear when networks start reporting metrics'
                : 'Performance data will appear when this network starts reporting metrics'
              }
            </p>
          </div>
        )}

        {/* Charts */}
        {(performanceData.speedData.length > 0 || performanceData.systemMetrics.length > 0) && (
          <div className="h-64 mb-6">
            {activeChart === 'speed' && performanceData.speedData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData.speedData}>
                  <defs>
                    <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatTime}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)} Mbps`,
                      name === 'download' ? 'Download' : 'Upload'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="download"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#downloadGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="upload"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#uploadGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeChart === 'system' && performanceData.systemMetrics.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.systemMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatTime}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)}${name === 'temperature' ? '°C' : '%'}`,
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeChart === 'network' && globalMode && performanceData.networkBreakdown && performanceData.networkBreakdown.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData.networkBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="networkId" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)} Mbps`,
                      name === 'avgDownload' ? 'Avg Download' : 'Avg Upload'
                    ]}
                  />
                  <Bar dataKey="avgDownload" fill="#10B981" name="avgDownload" />
                  <Bar dataKey="avgUpload" fill="#3B82F6" name="avgUpload" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Legend */}
        {(performanceData.speedData.length > 0 || performanceData.systemMetrics.length > 0) && (
          <div className="flex items-center justify-center space-x-6 mb-6 text-sm">
            {activeChart === 'speed' && (
              <>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span className="text-gray-300">Download Speed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span className="text-gray-300">Upload Speed</span>
                </div>
              </>
            )}
            {activeChart === 'system' && (
              <>
                <div className="flex items-center">
                  <Cpu className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-gray-300">CPU Usage</span>
                </div>
                <div className="flex items-center">
                  <HardDrive className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-gray-300">Memory</span>
                </div>
                <div className="flex items-center">
                  <Thermometer className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-gray-300">Temperature</span>
                </div>
              </>
            )}
            {activeChart === 'network' && (
              <>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span className="text-gray-300">Download</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span className="text-gray-300">Upload</span>
                </div>
              </>
            )}
          </div>
        )}

        {detailed && performanceData.speedData.length > 0 && (
          <div className="pt-4 border-t border-gray-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-200 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                  Performance Insights
                </h4>
                <ul className="space-y-2 text-gray-300">
                  {insights.performance.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-200 mb-3 flex items-center">
                  <Cpu className="w-4 h-4 mr-2 text-blue-600" />
                  System Status
                </h4>
                <ul className="space-y-2 text-gray-300">
                  {insights.system.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {globalMode && performanceData.networkBreakdown && performanceData.networkBreakdown.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-500">
                <h4 className="font-medium text-gray-200 mb-3">Network Performance Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {performanceData.networkBreakdown.map((network) => (
                    <div key={network.networkId} className="bg-blue-950 rounded-lg p-3">
                      <h5 className="font-medium text-white mb-2">{network.networkId}</h5>
                      <div className="space-y-1 text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>Download:</span>
                          <span className="font-medium">{network.avgDownload.toFixed(1)} Mbps</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Upload:</span>
                          <span className="font-medium">{network.avgUpload.toFixed(1)} Mbps</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tests:</span>
                          <span className="font-medium">{network.testCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}