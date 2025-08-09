'use client'

import { useState } from 'react'
import { 
  Clock, 
  Users, 
  Smartphone, 
  Monitor, 
  Tablet,
  Globe,
  BarChart3,
  PieChart,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Network
} from 'lucide-react'
import { 
  PieChart as RechartsPieChart, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart,
  Line,
  Area,
  AreaChart,
  Pie
} from 'recharts'
import { useAdminQueries } from '@/hooks/useAdminQueries'
import { useNetworkQueries } from '@/hooks/useNetworkQueries'
import { DashboardData } from './Dashboard'

interface SessionAnalyticsProps {
  detailed?: boolean
  networkId?: string | null
  globalMode?: boolean
  isLive?: boolean
}

type HourlyTrend = {
  hour: number;
  date: string;
  activeUsers: number;
  cpu: number;
  memory: number;
  temperature: number;
};

interface SessionData {
  total: number
  active: number
  completed: number
  averageDuration: number
  totalSpeedTests: number
  totalDataTransfer: { downloadGB: number; uploadGB: number }
  deviceBreakdown: { mobile: number; desktop: number; tablet: number; unknown: number }
  hourlyActivity: HourlyTrend[];
  networkBreakdown?: Array<{
    networkId: string
    sessions: number
    avgDuration: number
    completionRate: number
  }>
  timeRange?: string
  peakHour?: number
  sessionQuality?: {
    completionRate: number
    avgTestsPerSession: number
    avgDataPerSession: number
  }
}

export default function SessionAnalytics({ 
  detailed = false,
  networkId = null,
  globalMode = false,
  isLive = true
}: SessionAnalyticsProps) {
  const [activeView, setActiveView] = useState<'overview' | 'devices' | 'activity'>('overview')

  // Use appropriate hooks based on mode
  const adminQueries = useAdminQueries()
  const networkQueries = networkId ? useNetworkQueries(networkId) : null

  // Select the appropriate query based on mode
  const sessionQuery = globalMode 
    ? adminQueries.useDashboard() // Global mode uses admin dashboard
    : networkId 
      ? networkQueries?.useSessionAnalytics() // Network mode uses network session analytics
      : null

  const { data: rawData, isLoading: loading, error, refetch } = sessionQuery || { 
    data: null, 
    isLoading: false, 
    error: null, 
    refetch: () => {} 
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4" />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-400'
  }

  if (!globalMode && !networkId) {
    return (
      <div className="bg-black rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Select a network to view session analytics</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-black rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'Failed to fetch session analytics'}
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

  // Map the raw data to SessionData format
  let sessionData: SessionData;

  if (globalMode) {
    // Global mode - use dashboard data structure
    const dashboardData = rawData as DashboardData;
    
    sessionData = {
      total: dashboardData?.overview?.totalSessions || 0,
      active: dashboardData?.overview?.totalActiveUsers || 0,
      completed: dashboardData?.overview?.completedSessions || 0,
      averageDuration: dashboardData?.overview?.averageSessionDuration || 0,
      totalSpeedTests: dashboardData?.overview?.totalSpeedTests || 0,
      totalDataTransfer: {
        downloadGB: dashboardData?.traffic?.totalDataTransfer?.downloadGB || 0,
        uploadGB: dashboardData?.traffic?.totalDataTransfer?.uploadGB || 0
      },
      deviceBreakdown: {
        mobile: dashboardData?.traffic?.deviceBreakdown?.mobile || 0,
        desktop: dashboardData?.traffic?.deviceBreakdown?.desktop || 0,
        tablet: dashboardData?.traffic?.deviceBreakdown?.tablet || 0,
        unknown: dashboardData?.traffic?.deviceBreakdown?.unknown || 0
      },
      hourlyActivity: dashboardData?.trends?.hourly || [],
      networkBreakdown: dashboardData?.networkBreakdown,
      timeRange: dashboardData?.metadata?.lastUpdated ? 
        `Last updated: ${new Date(dashboardData.metadata.lastUpdated).toLocaleString()}` : 
        'Last 24 hours',
      peakHour: dashboardData?.trends?.hourly?.length > 0 ? 
        dashboardData.trends.hourly.reduce((max, curr) => 
          curr.activeUsers > max.activeUsers ? curr : max
        ).hour : undefined,
      sessionQuality: {
        completionRate: dashboardData?.overview?.totalSessions > 0 ? 
          ((dashboardData?.overview?.completedSessions || 0) / dashboardData.overview.totalSessions) * 100 : 0,
        avgTestsPerSession: dashboardData?.overview?.totalSessions > 0 ? 
          (dashboardData?.overview?.totalSpeedTests || 0) / dashboardData.overview.totalSessions : 0,
        avgDataPerSession: dashboardData?.overview?.totalSessions > 0 ? 
          ((dashboardData?.traffic?.totalDataTransfer?.downloadGB || 0) + 
           (dashboardData?.traffic?.totalDataTransfer?.uploadGB || 0)) / dashboardData.overview.totalSessions : 0
      }
    }
  } else {
    // Network mode - use network-specific data structure
    const typedRawData = (rawData ?? {}) as Partial<SessionData>;
    sessionData = {
      total: typedRawData.total || 0,
      active: typedRawData.active || 0,
      completed: typedRawData.completed || 0,
      averageDuration: typedRawData.averageDuration || 0,
      totalSpeedTests: typedRawData.totalSpeedTests || 0,
      totalDataTransfer: typedRawData.totalDataTransfer || { downloadGB: 0, uploadGB: 0 },
      deviceBreakdown: typedRawData.deviceBreakdown || { mobile: 0, desktop: 0, tablet: 0, unknown: 0 },
      hourlyActivity: typedRawData.hourlyActivity || [],
      timeRange: typedRawData.timeRange || 'Last 24 hours',
      peakHour: typedRawData.peakHour,
      sessionQuality: {
        completionRate: typedRawData.sessionQuality?.completionRate || 0,
        avgTestsPerSession: typedRawData.sessionQuality?.avgTestsPerSession || 0,
        avgDataPerSession: typedRawData.sessionQuality?.avgDataPerSession || 0
      }
    }
  }

  const deviceData = [
    { name: 'Desktop', value: sessionData.deviceBreakdown.desktop, color: '#3B82F6', icon: Monitor },
    { name: 'Mobile', value: sessionData.deviceBreakdown.mobile, color: '#10B981', icon: Smartphone },
    { name: 'Tablet', value: sessionData.deviceBreakdown.tablet, color: '#F59E0B', icon: Tablet },
    { name: 'Unknown', value: sessionData.deviceBreakdown.unknown, color: '#6B7280', icon: Globe }
  ]

  const pieChartData = deviceData.filter(item => item.value > 0)

  return (
    <div className="bg-black rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-white">Session Analytics</h3>
            {globalMode ? (
              <Globe className="h-5 w-5 text-blue-500" />
            ) : (
              <Network className="h-5 w-5 text-green-500" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex bg-blue-800 rounded-lg p-1">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'overview' ? 'bg-black text-white shadow-sm' : 'text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('devices')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'devices' ? 'bg-black text-white shadow-sm' : 'text-gray-300'
                }`}
              >
                Devices
              </button>
              <button
                onClick={() => setActiveView('activity')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'activity' ? 'bg-black text-white shadow-sm' : 'text-gray-300'
                }`}
              >
                Activity
              </button>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-blue-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {sessionData.timeRange}
        </p>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total Sessions</p>
                  <p className="text-xl font-bold text-blue-900">{sessionData.total}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Active Users</p>
                <p className="text-xl font-bold text-green-900">{sessionData.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Avg Duration</p>
                  <p className="text-lg font-bold text-purple-900">
                    {formatDuration(sessionData.averageDuration)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Speed Tests</p>
                <p className="text-xl font-bold text-orange-900">{sessionData.totalSpeedTests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Based on Active View */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Quality Metrics */}
            <div className="bg-blue-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-200 mb-4">Session Quality</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Completion Rate</span>
                    <span className="font-medium text-white">{sessionData.sessionQuality?.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(sessionData.sessionQuality?.completionRate || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-300">Avg Tests/Session</p>
                    <p className="font-bold text-white">{sessionData.sessionQuality?.avgTestsPerSession.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Avg Data/Session</p>
                    <p className="font-bold text-white">{sessionData.sessionQuality?.avgDataPerSession.toFixed(2)} GB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Peak Activity */}
            <div className="bg-blue-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-200 mb-4">Activity Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Peak Hour:</span>
                  <span className="font-medium text-gray-300">
                    {sessionData.peakHour !== undefined ? `${sessionData.peakHour}:00 - ${sessionData.peakHour + 1}:00` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Most Used Device:</span>
                  <span className="font-medium text-gray-300">
                    {deviceData.length > 0 ? deviceData.reduce((max, curr) => curr.value > max.value ? curr : max).name : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Data Transfer:</span>
                  <span className="font-medium text-gray-300">
                    {(sessionData.totalDataTransfer.downloadGB + sessionData.totalDataTransfer.uploadGB).toFixed(1)} GB
                  </span>
                </div>
                {globalMode && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Networks Active:</span>
                    <span className="font-medium text-gray-300">{sessionData.networkBreakdown?.length || 0}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'devices' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Breakdown Chart */}
            <div className="bg-blue-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-200 mb-4">Device Distribution</h4>
              <div className="h-48">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip formatter={(value: number) => [value, 'Sessions']} />
                      <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>No device data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Device Details */}
            <div className="bg-blue-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-200 mb-4">Device Breakdown</h4>
              <div className="space-y-3">
                {deviceData.map((device) => {
                  const Icon = device.icon
                  const totalDevices = deviceData.reduce((sum, d) => sum + d.value, 0)
                  const percentage = totalDevices > 0 ? (device.value / totalDevices * 100).toFixed(1) : '0'
                  return (
                    <div key={device.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" style={{ color: device.color }} />
                        <span className="text-sm font-medium text-gray-200">{device.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-300">{device.value}</span>
                        <span className="text-xs text-gray-400">({percentage}%)</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: device.color
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeView === 'activity' && (
          <div className="space-y-6">
            {/* Hourly Activity Chart */}
            <div className="bg-blue-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-200 mb-4">24-Hour Activity Pattern</h4>
              <div className="h-64">
                {sessionData.hourlyActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sessionData.hourlyActivity}>
                      <defs>
                        <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                        tickFormatter={(value) => `${value}:00`}
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                      <Tooltip 
                        formatter={(value: number) => [value, 'Active Users']}
                        labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '6px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="activeUsers" 
                        stroke="#3B82F6" 
                        fillOpacity={1} 
                        fill="url(#activityGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>No hourly activity data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Network Breakdown (Global Mode Only) */}
            {globalMode && sessionData.networkBreakdown && sessionData.networkBreakdown.length > 0 && (
              <div className="bg-blue-900 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-200 mb-4">Network Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sessionData.networkBreakdown.map((network) => (
                    <div key={network.networkId} className="bg-black rounded-lg p-3 shadow-sm">
                      <h5 className="font-medium text-white mb-2">{network.networkId}</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Sessions:</span>
                          <span className="font-medium text-white">{network.sessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Avg Duration:</span>
                          <span className="font-medium text-white">{formatDuration(network.avgDuration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Completion:</span>
                          <span className="font-medium text-white">{network.completionRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {detailed && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-200 mb-3">Quality Metrics</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex justify-between">
                    <span>Completion Rate:</span>
                    <span className="font-medium">{sessionData.sessionQuality?.completionRate.toFixed(1)}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Avg Tests/Session:</span>
                    <span className="font-medium">{sessionData.sessionQuality?.avgTestsPerSession.toFixed(1)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Data Efficiency:</span>
                    <span className="font-medium">
                      {(sessionData.sessionQuality?.avgDataPerSession ?? 0) > 10 ? 'High' : 
                       (sessionData.sessionQuality?.avgDataPerSession ?? 0) > 5 ? 'Good' : 'Low'}
                    </span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-200 mb-3">Usage Patterns</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex justify-between">
                    <span>Peak Activity:</span>
                    <span className="font-medium">
                      {sessionData.peakHour !== undefined ? `${sessionData.peakHour}:00` : 'N/A'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Primary Device:</span>
                    <span className="font-medium">
                      {deviceData.length > 0 ? deviceData.reduce((max, curr) => curr.value > max.value ? curr : max).name : 'N/A'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Total Data:</span>
                    <span className="font-medium">
                      {(sessionData.totalDataTransfer.downloadGB + sessionData.totalDataTransfer.uploadGB).toFixed(1)} GB
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-200 mb-3">Performance</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex justify-between">
                    <span>System Load:</span>
                    <span className="font-medium">
                      {sessionData.active > 50 ? 'High' : sessionData.active > 20 ? 'Normal' : 'Low'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Avg Response:</span>
                    <span className="font-medium">
                      {sessionData.averageDuration < 1800 ? 'Fast' : sessionData.averageDuration < 3600 ? 'Normal' : 'Slow'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Reliability:</span>
                    <span className="font-medium">
                      {(sessionData.sessionQuality?.completionRate ?? 0) > 90 ? 'Excellent' : 
                       (sessionData.sessionQuality?.completionRate ?? 0) > 75 ? 'Good' : 'Poor'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}