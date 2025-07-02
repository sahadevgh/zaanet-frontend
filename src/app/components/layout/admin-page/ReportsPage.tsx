'use client'

import { useState } from 'react'
import { 
  Download, 
  FileText, 
  Users, 
  Zap, 
  Cpu, 
  Thermometer,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  Globe,
  Network,
  RefreshCw,
  Filter,
  Settings,
  Share,
  Eye,
  Mail
} from 'lucide-react'
import { useAdminQueries } from '@/hooks/useAdminQueries'
import { useNetworkQueries } from '@/hooks/useNetworkQueries'

interface ReportProps {
  networkId: string | null
  globalMode: boolean
}

interface ReportData {
  reportId: string
  type: 'hourly' | 'daily' | 'weekly' | 'monthly'
  networkId?: string
  networkName?: string
  testInfo: {
    startTime: string
    endTime: string
    duration: string
    location: string
    piModel: string
    reportType: string
  }
  summary: {
    totalSessions: number
    activeSessions: number
    completedSessions: number
    peakConcurrentUsers: number
    totalSpeedTests: number
    totalNetworks?: number
    networksOnline?: number
  }
  performance: {
    averageSpeed: { download: number; upload: number }
    peakSpeed?: { download: number; upload: number }
    systemLoad: {
      averageCPU: number
      averageMemory: number
      maxTemperature: number
      averageDiskUsage?: number
    }
    reliability: {
      sessionSuccessRate: number
      averageSessionDuration: number
      disconnectionRate: number
      systemStability: number
      uptime?: number
    }
  }
  scalabilityTest: {
    maxConcurrentUsers: number
    performanceAtScale: Record<string, any>
    systemStressPoints: string[]
    networkCapacity?: {
      current: number
      maximum: number
      efficiency: number
    }
  }
  commercialViability: {
    averageSpeedPerUser: Record<string, any>
    reliabilityScore: number
    hardwareUtilization: any
    costEffectiveness: {
      hardwareCost: number
      costPerUser: number
      costPerGB: number
      usersSupported: number
      dataServed: number
      monthlyOperatingCost?: number
    }
  }
  networkBreakdown?: Array<{
    networkId: string
    networkName: string
    performance: {
      avgDownload: number
      avgUpload: number
      reliability: number
      users: number
    }
    issues: string[]
  }>
  recommendations: string[]
  insights: {
    performance: string[]
    efficiency: string[]
    scalability: string[]
  }
}

export default function ReportsPage({ networkId, globalMode }: ReportProps) {
  const [reportType, setReportType] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily')
  const [timeRange, setTimeRange] = useState({ start: '', end: '' })
  const [showFilters, setShowFilters] = useState(false)

  // Use appropriate hooks based on mode
  const adminQueries = useAdminQueries()
  const networkQueries = networkId ? useNetworkQueries(networkId) : null

  // Generate report mutation
  const exportMutation = adminQueries.useExportData()

  // For reports, we'll use the dashboard data and transform it
  // In a real app, you'd have a specific report generation endpoint
  const reportQuery = globalMode 
    ? adminQueries.useDashboard()
    : networkId 
      ? networkQueries?.useNetworkDashboard()
      : null

  // Use 'any' type for rawData to avoid property access errors, or define a more specific type if available
  const { data: rawData, isLoading: loading, error, refetch } = (reportQuery as { data: any, isLoading: boolean, error: any, refetch: () => void }) || { 
    data: null, 
    isLoading: false, 
    error: null, 
    refetch: () => {} 
  }

  // Transform the API data to match our ReportData interface
  const reportData: ReportData | null = rawData ? {
    reportId: `RPT-${Date.now()}`,
    type: reportType,
    networkId: globalMode ? undefined : (networkId || undefined),
    networkName: globalMode ? undefined : rawData.networkInfo?.name || rawData.network?.name,
    testInfo: {
      startTime: new Date(Date.now() - (reportType === 'hourly' ? 3600000 : 86400000)).toISOString(),
      endTime: new Date().toISOString(),
      duration: reportType === 'hourly' ? '1 hour' : '24 hours',
      location: globalMode ? 'All Locations' : rawData.networkInfo?.location || 'Network Location',
      piModel: globalMode ? 'Multiple Pi Units' : rawData.systemInfo?.hardware || 'Raspberry Pi',
      reportType: globalMode ? 'Global Network Analysis' : 'Single Network Performance'
    },
    summary: {
      totalSessions: rawData.sessions?.total || rawData.sessionAnalytics?.total || 0,
      activeSessions: rawData.sessions?.active || rawData.sessionAnalytics?.active || 0,
      completedSessions: rawData.sessions?.completed || rawData.sessionAnalytics?.completed || 0,
      peakConcurrentUsers: rawData.sessions?.peak || rawData.sessionAnalytics?.peak || 0,
      totalSpeedTests: rawData.speedTests?.total || rawData.totalTests || 0,
      totalNetworks: globalMode ? rawData.networks?.total : undefined,
      networksOnline: globalMode ? rawData.networks?.online : undefined
    },
    performance: {
      averageSpeed: {
        download: rawData.performance?.averageSpeed?.download || rawData.speedTest?.download || 0,
        upload: rawData.performance?.averageSpeed?.upload || rawData.speedTest?.upload || 0
      },
      peakSpeed: rawData.performance?.peakSpeed || {
        download: (rawData.performance?.averageSpeed?.download || 0) * 1.2,
        upload: (rawData.performance?.averageSpeed?.upload || 0) * 1.2
      },
      systemLoad: {
        averageCPU: rawData.systemHealth?.cpu || rawData.system?.cpu || 0,
        averageMemory: rawData.systemHealth?.memory || rawData.system?.memory || 0,
        maxTemperature: rawData.systemHealth?.temperature || rawData.system?.temperature || 0,
        averageDiskUsage: rawData.systemHealth?.disk || rawData.system?.disk
      },
      reliability: {
        sessionSuccessRate: rawData.reliability?.successRate || (rawData.sessions?.completed / rawData.sessions?.total * 100) || 0,
        averageSessionDuration: rawData.sessions?.averageDuration || 0,
        disconnectionRate: rawData.reliability?.disconnectionRate || 0,
        systemStability: rawData.systemHealth?.stability || rawData.reliability?.stability || 0,
        uptime: rawData.systemHealth?.uptime || rawData.uptime
      }
    },
    scalabilityTest: {
      maxConcurrentUsers: rawData.sessions?.peak || rawData.sessionAnalytics?.peak || 0,
      performanceAtScale: rawData.scalability?.performanceAtScale || {},
      systemStressPoints: rawData.scalability?.stressPoints || rawData.issues || [],
      networkCapacity: rawData.scalability?.capacity || {
        current: rawData.sessions?.active || 0,
        maximum: rawData.capacity?.maximum || (rawData.sessions?.active || 0) * 1.5,
        efficiency: rawData.capacity?.efficiency || 80
      }
    },
    commercialViability: {
      averageSpeedPerUser: {},
      reliabilityScore: rawData.reliability?.score || rawData.systemHealth?.stability || 0,
      hardwareUtilization: rawData.systemHealth || {},
      costEffectiveness: {
        hardwareCost: rawData.costAnalysis?.hardware || (globalMode ? 480 : 68),
        costPerUser: rawData.costAnalysis?.perUser || 0,
        costPerGB: rawData.costAnalysis?.perGB || 0,
        usersSupported: rawData.sessions?.total || 0,
        dataServed: rawData.dataTransfer?.total || 0,
        monthlyOperatingCost: rawData.costAnalysis?.monthly
      }
    },
    networkBreakdown: globalMode ? rawData.networks?.breakdown : undefined,
    recommendations: rawData.recommendations || [],
    insights: {
      performance: rawData.insights?.performance || [],
      efficiency: rawData.insights?.efficiency || [],
      scalability: rawData.insights?.scalability || []
    }
  } : null

  const generateReport = async () => {
    try {
      await refetch()
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  const downloadReport = (format: 'json' | 'pdf' | 'csv') => {
  if (!reportData) return
  
  switch (format) {
    case 'json':
      const dataStr = JSON.stringify(reportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report-${reportData.reportId}-${reportData.type}.json`
      link.click()
      URL.revokeObjectURL(url)
      break
      
    case 'csv':
      const csvData = [
        ['Metric', 'Value', 'Status'],
        ['Report Type', reportData.type, ''],
        ['Peak Concurrent Users', reportData.scalabilityTest.maxConcurrentUsers, ''],
        ['Average Download Speed (Mbps)', reportData.performance.averageSpeed.download.toFixed(1), ''],
        ['Average Upload Speed (Mbps)', reportData.performance.averageSpeed.upload.toFixed(1), ''],
        ['System Stability (%)', reportData.performance.reliability.systemStability.toFixed(1), ''],
        ['Success Rate (%)', reportData.performance.reliability.sessionSuccessRate.toFixed(1), ''],
        ['Hardware Cost ($)', reportData.commercialViability.costEffectiveness.hardwareCost, ''],
        ['Cost per User ($)', reportData.commercialViability.costEffectiveness.costPerUser.toFixed(2), ''],
        ['Reliability Score', reportData.commercialViability.reliabilityScore.toFixed(1), '']
      ]
      
      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const csvBlob = new Blob([csvContent], { type: 'text/csv' })
      const csvUrl = URL.createObjectURL(csvBlob)
      const csvLink = document.createElement('a')
      csvLink.href = csvUrl
      csvLink.download = `report-${reportData.reportId}-metrics.csv`
      csvLink.click()
      URL.revokeObjectURL(csvUrl)
      break
      
 case 'pdf':
  exportMutation.mutate({
    format: 'json',
    timeRange: reportData.type,
    dataTypes: ['report'],
  })
  break
  }
}

  const shareReport = () => {
    if (!reportData) return
    
    const shareData = {
      title: `Castle Labs Network Report - ${reportData.type}`,
      text: `Performance report for ${globalMode ? 'all networks' : reportData.networkName}`,
      url: window.location.href
    }
    
    if (navigator.share) {
      navigator.share(shareData)
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
      alert('Report link copied to clipboard!')
    }
  }

  const getPerformanceGrade = () => {
    if (!reportData) return 'N/A'
    const { reliability } = reportData.performance
    
    if (reliability.systemStability >= 95) return 'A+'
    if (reliability.systemStability >= 90) return 'A'
    if (reliability.systemStability >= 85) return 'B+'
    if (reliability.systemStability >= 80) return 'B'
    return 'C'
  }

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600 bg-green-50'
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (!globalMode && !networkId) {
    return (
      <div className="space-y-6 p-6 bg-blue-900 min-h-screen">
        <div className="bg-black rounded-xl shadow-sm p-6 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-300">Select a network to generate performance reports</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-blue-900 min-h-screen">
        <div className="bg-black rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-blue-800 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-blue-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 bg-blue-900 min-h-screen">
        <div className="bg-black rounded-xl shadow-sm p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'Failed to generate report'}
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

  return (
    <div className="space-y-6 p-6 bg-blue-900 min-h-screen">
      {/* Header */}
      <div className="bg-black rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-lg font-bold text-gray-100">Performance Report</h2>
                {globalMode ? (
                  <Globe className="h-6 w-6 text-blue-500" />
                ) : (
                  <Network className="h-6 w-6 text-green-500" />
                )}
              </div>
              <p className="text-gray-300">
                {globalMode 
                  ? 'Comprehensive analysis across all network locations'
                  : `Detailed performance analysis for ${reportData?.networkName || 'selected network'}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 bg-blue-800 text-gray-200 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <div className="flex bg-blue-800 rounded-lg p-1">
              {(['hourly', 'daily', 'weekly', 'monthly'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    reportType === type ? 'bg-black text-gray-100 shadow-sm' : 'text-gray-300'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            
            <button
              onClick={generateReport}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Start Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={timeRange.start}
                  onChange={(e) => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">End Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={timeRange.end}
                  onChange={(e) => setTimeRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={generateReport}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Content */}
      {reportData ? (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-black rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300">Export Options:</span>
                <button
                  onClick={() => downloadReport('json')}
                  className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  <Download className="h-3 w-3 mr-1" />
                  JSON
                </button>
                <button
                  onClick={() => downloadReport('csv')}
                  className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  CSV
                </button>
                <button
                  onClick={() => downloadReport('pdf')}
                  className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  disabled={exportMutation.isPending}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  PDF {exportMutation.isPending && '...'}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={shareReport}
                  className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <Share className="h-3 w-3 mr-1" />
                  Share
                </button>
                <button className="flex items-center px-3 py-1 bg-blue-800 text-gray-200 rounded-lg hover:bg-blue-800 transition-colors text-sm">
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </button>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-black rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Executive Summary</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-blue-900">{reportData.scalabilityTest.maxConcurrentUsers}</p>
                  <p className="text-sm text-blue-700">Peak Users</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-green-50 rounded-lg p-4">
                  <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-green-900">
                    {reportData.performance.averageSpeed.download.toFixed(1)}
                  </p>
                  <p className="text-sm text-green-700">Avg Mbps</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-50 rounded-lg p-4">
                  <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-purple-900">
                    {reportData.performance.reliability.systemStability.toFixed(1)}%
                  </p>
                  <p className="text-sm text-purple-700">Stability</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-50 rounded-lg p-4">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-orange-900">{getPerformanceGrade()}</p>
                  <p className="text-sm text-orange-700">Grade</p>
                </div>
              </div>

              {globalMode && (
                <div className="text-center">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <Globe className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-indigo-900">
                      {reportData.summary.networksOnline}/{reportData.summary.totalNetworks}
                    </p>
                    <p className="text-sm text-indigo-700">Networks</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-900 rounded-lg p-4">
              <h4 className="font-semibold text-gray-100 mb-2">Report Overview</h4>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Type:</span>
                  <span className="ml-2 font-medium capitalize text-gray-100">{reportData.type}</span>
                </div>
                <div>
                  <span className="text-gray-300">Duration:</span>
                  <span className="ml-2 font-medium text-gray-100">{reportData.testInfo.duration}</span>
                </div>
                <div>
                  <span className="text-gray-300">Location:</span>
                  <span className="ml-2 font-medium text-gray-100">{reportData.testInfo.location}</span>
                </div>
                <div>
                  <span className="text-gray-300">Sessions:</span>
                  <span className="ml-2 font-medium text-gray-100">{reportData.summary.totalSessions}</span>
                </div>
                <div>
                  <span className="text-gray-300">Success Rate:</span>
                  <span className="ml-2 font-medium text-gray-100">{reportData.performance.reliability.sessionSuccessRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="bg-black rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Performance Analysis</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Speed Performance */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Network Speed</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Avg Download:</span>
                    <span className="font-bold text-green-900">
                      {reportData.performance.averageSpeed.download.toFixed(1)} Mbps
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Avg Upload:</span>
                    <span className="font-bold text-green-900">
                      {reportData.performance.averageSpeed.upload.toFixed(1)} Mbps
                    </span>
                  </div>
                  {reportData.performance.peakSpeed && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-green-700">Peak Download:</span>
                        <span className="font-bold text-green-900">
                          {reportData.performance.peakSpeed.download.toFixed(1)} Mbps
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Peak Upload:</span>
                        <span className="font-bold text-green-900">
                          {reportData.performance.peakSpeed.upload.toFixed(1)} Mbps
                        </span>
                      </div>
                    </>
                  )}
                  <div className="pt-2 border-t border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">
                        {reportData.performance.averageSpeed.download > 50 ? 'Excellent' : 'Good'} performance
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Performance */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">System Health</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Avg CPU:</span>
                    <span className="font-bold text-blue-900">
                      {reportData.performance.systemLoad.averageCPU.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Avg Memory:</span>
                    <span className="font-bold text-blue-900">
                      {reportData.performance.systemLoad.averageMemory.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Max Temp:</span>
                    <span className="font-bold text-blue-900">
                      {reportData.performance.systemLoad.maxTemperature.toFixed(1)}°C
                    </span>
                  </div>
                  {reportData.performance.systemLoad.averageDiskUsage && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Disk Usage:</span>
                      <span className="font-bold text-blue-900">
                        {reportData.performance.systemLoad.averageDiskUsage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex items-center">
                      <Thermometer className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-700">
                        {reportData.performance.systemLoad.maxTemperature < 60 ? 'Normal' : 'Elevated'} temperatures
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reliability */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">Reliability</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-700">Success Rate:</span>
                    <span className="font-bold text-purple-900">
                      {reportData.performance.reliability.sessionSuccessRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Avg Session:</span>
                    <span className="font-bold text-purple-900">
                      {Math.floor(reportData.performance.reliability.averageSessionDuration / 60)}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Stability:</span>
                    <span className="font-bold text-purple-900">
                      {reportData.performance.reliability.systemStability.toFixed(1)}%
                    </span>
                  </div>
                  {reportData.performance.reliability.uptime && (
                    <div className="flex justify-between">
                      <span className="text-purple-700">Uptime:</span>
                      <span className="font-bold text-purple-900">
                        {reportData.performance.reliability.uptime.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-purple-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-sm text-purple-700">
                        {reportData.performance.reliability.systemStability > 95 ? 'Excellent' : 'Good'} reliability
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Network Breakdown (Global Mode Only) */}
          {globalMode && reportData.networkBreakdown && (
            <div className="bg-black rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Network Performance Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportData.networkBreakdown.map((network) => (
                  <div key={network.networkId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-100">{network.networkName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        network.performance.reliability > 90 
                          ? 'bg-green-100 text-green-800' 
                          : network.performance.reliability > 80
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {network.performance.reliability > 90 ? 'Excellent' : 
                         network.performance.reliability > 80 ? 'Good' : 'Issues'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Download:</span>
                        <span className="font-medium">{network.performance.avgDownload.toFixed(1)} Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Upload:</span>
                        <span className="font-medium">{network.performance.avgUpload.toFixed(1)} Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Users:</span>
                        <span className="font-medium">{network.performance.users}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Reliability:</span>
                        <span className="font-medium">{network.performance.reliability.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    {network.issues && network.issues.length > 0 && network.issues[0] !== 'None' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-300 mb-1">Issues:</p>
                        {network.issues.map((issue, index) => (
                          <div key={index} className="flex items-start text-xs text-red-600">
                            <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                            {issue}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commercial Viability */}
          <div className="bg-black rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Commercial Viability</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-100 mb-3">Cost Analysis</h4>
                <div className="bg-blue-900 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-300">Hardware Cost:</span>
                      <p className="font-bold text-gray-100">
                        ${reportData.commercialViability.costEffectiveness.hardwareCost}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-300">Cost per User:</span>
                      <p className="font-bold text-gray-100">
                        ${reportData.commercialViability.costEffectiveness.costPerUser.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-300">Users Supported:</span>
                      <p className="font-bold text-gray-100">
                        {reportData.commercialViability.costEffectiveness.usersSupported}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-300">Data Served:</span>
                      <p className="font-bold text-gray-100">
                        {reportData.commercialViability.costEffectiveness.dataServed.toFixed(1)} GB
                      </p>
                    </div>
                    {reportData.commercialViability.costEffectiveness.monthlyOperatingCost && (
                      <>
                        <div>
                          <span className="text-gray-300">Monthly Cost:</span>
                          <p className="font-bold text-gray-100">
                            ${reportData.commercialViability.costEffectiveness.monthlyOperatingCost}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-300">Cost per GB:</span>
                          <p className="font-bold text-gray-100">
                            ${reportData.commercialViability.costEffectiveness.costPerGB.toFixed(3)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-100 mb-3">Scalability Assessment</h4>
                <div className="space-y-3">
                  {reportData.scalabilityTest.networkCapacity && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-700 font-medium">Current Capacity</span>
                        <span className="text-blue-900 font-bold">
                          {reportData.scalabilityTest.networkCapacity.current}/{reportData.scalabilityTest.networkCapacity.maximum}
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(reportData.scalabilityTest.networkCapacity.current / reportData.scalabilityTest.networkCapacity.maximum) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        {reportData.scalabilityTest.networkCapacity.efficiency.toFixed(1)}% efficiency
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(reportData.scalabilityTest.performanceAtScale).map(([users, data]: [string, any]) => {
                      const userCount = users.replace('_users', '')
                      const status = data.stability > 95 ? 'excellent' : data.stability > 90 ? 'good' : 'warning'
                      const colorClass = status === 'excellent' ? 'bg-green-50 text-green-700' : 
                                       status === 'good' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
                      
                      return (
                        <div key={users} className={`flex items-center justify-between p-2 rounded-lg ${colorClass}`}>
                          <span className="font-medium">{userCount} Users</span>
                          <div className="text-right">
                            <span className="font-bold">{data.speed.toFixed(1)} Mbps</span>
                            <span className="text-xs block">{data.stability.toFixed(1)}% stable</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-black rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Key Insights</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">Performance</h4>
                <div className="space-y-2">
                  {reportData.insights.performance.length > 0 ? reportData.insights.performance.map((insight, index) => (
                    <div key={index} className="flex items-start p-2 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-900">{insight}</span>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-300">No performance insights available</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-900 mb-3">Efficiency</h4>
                <div className="space-y-2">
                  {reportData.insights.efficiency.length > 0 ? reportData.insights.efficiency.map((insight, index) => (
                    <div key={index} className="flex items-start p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-green-900">{insight}</span>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-300">No efficiency insights available</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-purple-900 mb-3">Scalability</h4>
                <div className="space-y-2">
                  {reportData.insights.scalability.length > 0 ? reportData.insights.scalability.map((insight, index) => (
                    <div key={index} className="flex items-start p-2 bg-purple-50 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-purple-900">{insight}</span>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-300">No scalability insights available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-black rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Recommendations</h3>
            
            <div className="space-y-3">
              {reportData.recommendations.length > 0 ? reportData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-blue-900">{recommendation}</span>
                  </div>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    Priority {index + 1}
                  </span>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-300">
                  No specific recommendations available
                </div>
              )}
            </div>
          </div>

          {/* System Stress Points */}
          {reportData.scalabilityTest.systemStressPoints.length > 0 && (
            <div className="bg-black rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">System Stress Points</h3>
              
              <div className="space-y-3">
                {reportData.scalabilityTest.systemStressPoints.map((stressPoint, index) => (
                  <div key={index} className="flex items-start p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-yellow-900">{stressPoint}</span>
                    </div>
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                      Monitor
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Footer */}
          <div className="bg-black rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">
                  Report ID: <span className="font-mono">{reportData.reportId}</span>
                </p>
                <p className="text-sm text-gray-300">
                  Generated: {new Date(reportData.testInfo.endTime).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Castle Labs Network Analytics</p>
                <p className="text-xs text-gray-300">Powered by Raspberry Pi Infrastructure</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-black rounded-xl shadow-sm p-6 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-300">No report data available. Generate a new report to get started.</p>
        </div>
      )}
    </div>
  )
}