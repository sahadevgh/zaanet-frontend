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
  Globe,
  Network,
  RefreshCw,
  Share,
  Mail,
  HardDrive,
  Activity,
  Clock
} from 'lucide-react'
import { useAdminQueries } from '@/hooks/useAdminQueries'
import { useNetworkQueries } from '@/hooks/useNetworkQueries'

interface ReportProps {
  networkId: string | null
  globalMode: boolean
}

// Define proper types for the raw data
interface DashboardData {
  overview?: {
    totalActiveUsers?: number
    totalSessions?: number
    completedSessions?: number
    systemHealth?: {
      cpu?: number
      memory?: number
      temperature?: number
      diskUsage?: number
    }
  }
  performance?: {
    averageSpeed?: {
      download?: number
      upload?: number
    }
    totalSpeedTests?: number
  }
  traffic?: {
    totalDataTransfer?: {
      downloadGB?: number
      uploadGB?: number
    }
    totalUsers?: number
    deviceBreakdown?: {
      mobile?: number
      desktop?: number
      tablet?: number
      unknown?: number
    }
  }
  networks?: {
    total?: number
    online?: number
    offline?: number
  }
}

export default function ReportsPage({ networkId, globalMode }: ReportProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  // Use appropriate hooks based on mode
  const adminQueries = useAdminQueries()
  const networkQueries = networkId ? useNetworkQueries(networkId) : null

  // Generate report mutation
  const exportMutation = adminQueries.useExportData()

  // Get current data
  const reportQuery = globalMode 
    ? adminQueries.useDashboard()
    : networkId 
      ? networkQueries?.useNetworkDashboard()
      : null

  const { data: rawData, isLoading: loading, error, refetch } = reportQuery || { 
    data: null, 
    isLoading: false, 
    error: null, 
    refetch: () => {} 
  }

  // Type-safe data access
  const dashboardData = rawData as DashboardData | null

  const generateReport = async () => {
    setIsGenerating(true)
    try {
      await refetch()
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadReport = (format: 'json' | 'csv') => {
    if (!dashboardData) return
    
    const reportData = {
      reportId: `RPT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      networkId: globalMode ? 'ALL' : networkId,
      type: globalMode ? 'Global Network Report' : 'Network Performance Report',
      data: dashboardData
    }
    
    if (format === 'json') {
      const dataStr = JSON.stringify(reportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `network-report-${reportData.reportId}.json`
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      const csvData = [
        ['Metric', 'Value'],
        ['Report ID', reportData.reportId],
        ['Generated', new Date().toLocaleString()],
        ['Network', globalMode ? 'All Networks' : networkId || 'Unknown'],
        ['Total Sessions', dashboardData.overview?.totalSessions || 0],
        ['Active Users', dashboardData.overview?.totalActiveUsers || 0],
        ['Completed Sessions', dashboardData.overview?.completedSessions || 0],
        ['Average Download Speed (Mbps)', dashboardData.performance?.averageSpeed?.download || 0],
        ['Average Upload Speed (Mbps)', dashboardData.performance?.averageSpeed?.upload || 0],
        ['CPU Usage (%)', dashboardData.overview?.systemHealth?.cpu || 0],
        ['Memory Usage (%)', dashboardData.overview?.systemHealth?.memory || 0],
        ['Temperature (°C)', dashboardData.overview?.systemHealth?.temperature || 0],
        ['Total Data Downloaded (GB)', dashboardData.traffic?.totalDataTransfer?.downloadGB || 0],
        ['Total Data Uploaded (GB)', dashboardData.traffic?.totalDataTransfer?.uploadGB || 0],
        ['Mobile Users', dashboardData.traffic?.deviceBreakdown?.mobile || 0],
        ['Desktop Users', dashboardData.traffic?.deviceBreakdown?.desktop || 0],
        ['Tablet Users', dashboardData.traffic?.deviceBreakdown?.tablet || 0],
      ]
      
      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const csvBlob = new Blob([csvContent], { type: 'text/csv' })
      const csvUrl = URL.createObjectURL(csvBlob)
      const csvLink = document.createElement('a')
      csvLink.href = csvUrl
      csvLink.download = `network-report-${reportData.reportId}.csv`
      csvLink.click()
      URL.revokeObjectURL(csvUrl)
    }
  }

  const shareReport = () => {
    if (!dashboardData) return
    
    const shareData = {
      title: `Network Performance Report - ${globalMode ? 'All Networks' : networkId}`,
      text: `Performance: ${dashboardData.performance?.averageSpeed?.download || 0} Mbps | Users: ${dashboardData.overview?.totalActiveUsers || 0} | Sessions: ${dashboardData.overview?.totalSessions || 0}`,
      url: window.location.href
    }
    
    if (navigator.share) {
      navigator.share(shareData)
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
      alert('Report summary copied to clipboard!')
    }
  }

  const getPerformanceGrade = () => {
    if (!dashboardData) return 'N/A'
    
    const downloadSpeed = dashboardData.performance?.averageSpeed?.download || 0
    const totalSessions = dashboardData.overview?.totalSessions || 0
    
    // Simple grading based on speed and sessions => Adjusted from standard test grading purposes
    if (downloadSpeed > 50 && totalSessions > 20) return 'A+'
    if (downloadSpeed > 20 && totalSessions > 10) return 'A'
    if (downloadSpeed > 10 && totalSessions > 5) return 'B+'
    if (downloadSpeed > 5 && totalSessions > 1) return 'B'
    return 'B-'
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

  if (loading || isGenerating) {
    return (
      <div className="space-y-6 p-6 bg-blue-900 min-h-screen">
        <div className="bg-black rounded-xl shadow-sm p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">
              {isGenerating ? 'Generating report...' : 'Loading data...'}
            </p>
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
                <h2 className="text-xl font-bold text-white">Network Performance Report</h2>
                {globalMode ? (
                  <Globe className="h-6 w-6 text-blue-500" />
                ) : (
                  <Network className="h-6 w-6 text-green-500" />
                )}
              </div>
              <p className="text-gray-300">
                {globalMode 
                  ? 'Comprehensive analysis across all network locations'
                  : `Current performance analysis for ${networkId}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {dashboardData ? (
        <div className="space-y-6">
          {/* Export Options */}
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
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={shareReport}
                  className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <Share className="h-3 w-3 mr-1" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-black rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Executive Summary</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-blue-900">
                    {dashboardData.overview?.totalActiveUsers || 0}
                  </p>
                  <p className="text-sm text-blue-700">Active Users</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-green-50 rounded-lg p-4">
                  <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-green-900">
                    {dashboardData.performance?.averageSpeed?.download?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-sm text-green-700">Avg Mbps</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-50 rounded-lg p-4">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-purple-900">
                    {dashboardData.overview?.totalSessions || 0}
                  </p>
                  <p className="text-sm text-purple-700">Total Sessions</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-50 rounded-lg p-4">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-orange-900">{getPerformanceGrade()}</p>
                  <p className="text-sm text-orange-700">Grade</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Report Overview</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Generated:</span>
                  <span className="ml-2 font-medium text-white">{new Date().toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-300">Network:</span>
                  <span className="ml-2 font-medium text-white">
                    {globalMode ? 'All Networks' : networkId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-300">Completed:</span>
                  <span className="ml-2 font-medium text-white">
                    {dashboardData.overview?.completedSessions || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-300">Success Rate:</span>
                  <span className="ml-2 font-medium text-white">
                    {dashboardData.overview?.totalSessions && dashboardData.overview?.totalSessions > 0
                      ? ((dashboardData.overview?.completedSessions || 0) / dashboardData.overview.totalSessions * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Performance */}
          <div className="bg-black rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Current Performance</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Network Speed */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Network Speed</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Download:</span>
                    <span className="font-bold text-green-900">
                      {dashboardData.performance?.averageSpeed?.download?.toFixed(1) || '0.0'} Mbps
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Upload:</span>
                    <span className="font-bold text-green-900">
                      {dashboardData.performance?.averageSpeed?.upload?.toFixed(1) || '0.0'} Mbps
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Total Tests:</span>
                    <span className="font-bold text-green-900">
                      {dashboardData.performance?.totalSpeedTests || 0}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">
                        {(dashboardData.performance?.averageSpeed?.download || 0) > 10 ? 'Excellent' : 
                         (dashboardData.performance?.averageSpeed?.download || 0) > 5 ? 'Good' : 
                         (dashboardData.performance?.averageSpeed?.download || 0) > 2 ? 'Fair' : 'Poor'} performance
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">System Health</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">CPU:</span>
                    <span className="font-bold text-blue-900">
                      {dashboardData.overview?.systemHealth?.cpu?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Memory:</span>
                    <span className="font-bold text-blue-900">
                      {dashboardData.overview?.systemHealth?.memory?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Temperature:</span>
                    <span className="font-bold text-blue-900">
                      {dashboardData.overview?.systemHealth?.temperature?.toFixed(1) || '0.0'}°C
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Disk:</span>
                    <span className="font-bold text-blue-900">
                      {dashboardData.overview?.systemHealth?.diskUsage?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex items-center">
                      <Thermometer className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-700">
                        {(dashboardData.overview?.systemHealth?.temperature || 0) < 60 ? 'Normal' : 
                         (dashboardData.overview?.systemHealth?.temperature || 0) < 70 ? 'Warm' : 'Hot'} temperatures
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Usage */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">Data Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-700">Downloaded:</span>
                    <span className="font-bold text-purple-900">
                      {dashboardData.traffic?.totalDataTransfer?.downloadGB?.toFixed(2) || '0.00'} GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Uploaded:</span>
                    <span className="font-bold text-purple-900">
                      {dashboardData.traffic?.totalDataTransfer?.uploadGB?.toFixed(2) || '0.00'} GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Total:</span>
                    <span className="font-bold text-purple-900">
                      {((dashboardData.traffic?.totalDataTransfer?.downloadGB || 0) + 
                        (dashboardData.traffic?.totalDataTransfer?.uploadGB || 0)).toFixed(2)} GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Users:</span>
                    <span className="font-bold text-purple-900">
                      {dashboardData.traffic?.totalUsers || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-black rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Device Usage</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-900">Mobile</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {dashboardData.traffic?.deviceBreakdown?.mobile || 0}
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-green-600 mr-2" />
                  <span className="font-semibold text-green-900">Desktop</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {dashboardData.traffic?.deviceBreakdown?.desktop || 0}
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-purple-600 mr-2" />
                  <span className="font-semibold text-purple-900">Tablet</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {dashboardData.traffic?.deviceBreakdown?.tablet || 0}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-gray-600 mr-2" />
                  <span className="font-semibold text-gray-900">Unknown</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.traffic?.deviceBreakdown?.unknown || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Network Status (Global Mode) */}
          {globalMode && dashboardData.networks && (
            <div className="bg-black rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Network Status</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">
                    {dashboardData.networks.online || 0}
                  </p>
                  <p className="text-sm text-green-700">Networks Online</p>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-900">
                    {dashboardData.networks.offline || 0}
                  </p>
                  <p className="text-sm text-red-700">Networks Offline</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Network className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">
                    {dashboardData.networks.total || 0}
                  </p>
                  <p className="text-sm text-blue-700">Total Networks</p>
                </div>
              </div>
            </div>
          )}

          {/* System Recommendations */}
          <div className="bg-black rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-white mb-4">System Recommendations</h3>
            
            <div className="space-y-3">
              {/* CPU Recommendation */}
              {(dashboardData.overview?.systemHealth?.cpu || 0) > 80 && (
                <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-yellow-900 font-medium">High CPU Usage</span>
                    <p className="text-sm text-yellow-700">
                      CPU usage is at {(dashboardData.overview?.systemHealth?.cpu ?? 0).toFixed(1)}%. Consider optimizing processes or upgrading hardware.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Memory Recommendation */}
              {(dashboardData.overview?.systemHealth?.memory || 0) > 85 && (
                <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-yellow-900 font-medium">High Memory Usage</span>
                    <p className="text-sm text-yellow-700">
                      Memory usage is at {(dashboardData.overview?.systemHealth?.memory ?? 0).toFixed(1)}%. Consider adding more RAM or optimizing memory usage.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Temperature Recommendation */}
              {(dashboardData.overview?.systemHealth?.temperature || 0) > 65 && (
                <div className="flex items-start p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-red-900 font-medium">High Temperature</span>
                    <p className="text-sm text-red-700">
                      System temperature is at {(dashboardData.overview?.systemHealth?.temperature ?? 0).toFixed(1)}°C. Ensure proper ventilation and cooling.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Performance Recommendation */}
              {(dashboardData.performance?.averageSpeed?.download || 0) < 25 && (
                <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-blue-900 font-medium">Network Performance</span>
                    <p className="text-sm text-blue-700">
                      Current download speed is {(dashboardData.performance?.averageSpeed?.download ?? 0).toFixed(1)} Mbps. Consider upgrading internet connection or optimizing network configuration.
                    </p>
                  </div>
                </div>
              )}
              
              {/* No issues */}
              {(dashboardData.overview?.systemHealth?.cpu || 0) <= 80 && 
               (dashboardData.overview?.systemHealth?.memory || 0) <= 85 && 
               (dashboardData.overview?.systemHealth?.temperature || 0) <= 65 && 
               (dashboardData.performance?.averageSpeed?.download || 0) >= 25 && (
                <div className="flex items-start p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-green-900 font-medium">System Operating Normally</span>
                    <p className="text-sm text-green-700">
                      All systems are operating within normal parameters. Continue monitoring for optimal performance.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Footer */}
          <div className="bg-black rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">
                  Report ID: <span className="font-mono">RPT-{Date.now()}</span>
                </p>
                <p className="text-sm text-gray-300">
                  Generated: {new Date().toLocaleString()}
                </p>
                <p className="text-sm text-gray-300">
                  Network: {globalMode ? 'All Networks' : networkId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">ZaaNet Network Analytics</p>
                <p className="text-xs text-gray-400">Performance Report v1.0</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-black rounded-xl shadow-sm p-6 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-300">No data available. Please refresh to generate a report.</p>
          <button
            onClick={generateReport}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Generate Report
          </button>
        </div>
      )}
    </div>
  )
}