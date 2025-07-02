'use client'

import { useState, useEffect } from 'react'
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

interface ReportProps {
  networkId?: string | null
  globalMode?: boolean
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

export default function ReportsPage({ networkId = null, globalMode = false }: ReportProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)
  const [reportType, setReportType] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily')
  const [timeRange, setTimeRange] = useState({ start: '', end: '' })
  const [showFilters, setShowFilters] = useState(false)

  // Enhanced demo data based on mode
  const generateDemoData = (): ReportData => {
    const isGlobal = globalMode
    const now = new Date()
    const startTime = new Date(now.getTime() - (reportType === 'hourly' ? 3600000 : 86400000))
    
    return {
      reportId: `RPT-${Date.now()}`,
      type: reportType,
      networkId: isGlobal ? undefined : (networkId || 'net-001'),
      networkName: isGlobal ? undefined : 'Campus Main Network',
      testInfo: {
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
        duration: reportType === 'hourly' ? '1 hour' : '24 hours',
        location: isGlobal ? 'All Locations' : 'Main Campus',
        piModel: isGlobal ? 'Multiple Pi Units' : 'Raspberry Pi 5 8GB',
        reportType: isGlobal ? 'Global Network Analysis' : 'Single Network Performance'
      },
      summary: {
        totalSessions: isGlobal ? 847 : 156,
        activeSessions: isGlobal ? 124 : 24,
        completedSessions: isGlobal ? 743 : 132,
        peakConcurrentUsers: isGlobal ? 89 : 28,
        totalSpeedTests: isGlobal ? 4230 : 1240,
        totalNetworks: isGlobal ? 4 : undefined,
        networksOnline: isGlobal ? 3 : undefined
      },
      performance: {
        averageSpeed: { 
          download: isGlobal ? 78.4 : 85.2, 
          upload: isGlobal ? 24.7 : 28.3 
        },
        peakSpeed: {
          download: isGlobal ? 124.7 : 98.4,
          upload: isGlobal ? 45.2 : 38.7
        },
        systemLoad: {
          averageCPU: isGlobal ? 52.3 : 45.2,
          averageMemory: isGlobal ? 68.7 : 62.8,
          maxTemperature: isGlobal ? 64.2 : 58.5,
          averageDiskUsage: isGlobal ? 42.1 : 38.9
        },
        reliability: {
          sessionSuccessRate: isGlobal ? 91.2 : 94.7,
          averageSessionDuration: isGlobal ? 2143 : 1847,
          disconnectionRate: isGlobal ? 3.7 : 2.1,
          systemStability: isGlobal ? 94.8 : 96.3,
          uptime: isGlobal ? 97.2 : 99.1
        }
      },
      scalabilityTest: {
        maxConcurrentUsers: isGlobal ? 89 : 28,
        performanceAtScale: isGlobal ? {
          "50_users": { speed: 72.1, stability: 96.2 },
          "75_users": { speed: 68.4, stability: 93.7 },
          "89_users": { speed: 65.2, stability: 91.8 }
        } : {
          "10_users": { speed: 87.2, stability: 99.1 },
          "20_users": { speed: 84.8, stability: 97.4 },
          "28_users": { speed: 82.1, stability: 95.8 }
        },
        systemStressPoints: isGlobal ? [
          "Network bandwidth allocation becomes critical at 80+ users",
          "Load balancing required for optimal distribution",
          "Individual network capacity limits reached during peak hours"
        ] : [
          "Memory usage spikes at 25+ concurrent users",
          "CPU temperature increases beyond 55°C under heavy load",
          "Network latency increases by 15% with 20+ users"
        ],
        networkCapacity: {
          current: isGlobal ? 89 : 28,
          maximum: isGlobal ? 120 : 35,
          efficiency: isGlobal ? 74.2 : 80.0
        }
      },
      commercialViability: {
        averageSpeedPerUser: {},
        reliabilityScore: isGlobal ? 91.2 : 94.7,
        hardwareUtilization: {},
        costEffectiveness: {
          hardwareCost: isGlobal ? 480 : 120,
          costPerUser: isGlobal ? 5.39 : 4.29,
          costPerGB: isGlobal ? 0.12 : 0.15,
          usersSupported: isGlobal ? 89 : 28,
          dataServed: isGlobal ? 3847.3 : 847.3,
          monthlyOperatingCost: isGlobal ? 89 : 23
        }
      },
      networkBreakdown: isGlobal ? [
        {
          networkId: 'net-001',
          networkName: 'Campus Main',
          performance: { avgDownload: 85.2, avgUpload: 28.3, reliability: 94.7, users: 28 },
          issues: ['None']
        },
        {
          networkId: 'net-002',
          networkName: 'Library WiFi',
          performance: { avgDownload: 78.4, avgUpload: 24.1, reliability: 89.3, users: 24 },
          issues: ['Occasional disconnections during peak hours']
        },
        {
          networkId: 'net-003',
          networkName: 'Student Center',
          performance: { avgDownload: 71.8, avgUpload: 21.7, reliability: 87.2, users: 19 },
          issues: ['High CPU usage', 'Temperature warnings']
        },
        {
          networkId: 'net-004',
          networkName: 'Lab Network',
          performance: { avgDownload: 0, avgUpload: 0, reliability: 0, users: 0 },
          issues: ['Offline - Maintenance required']
        }
      ] : undefined,
      recommendations: isGlobal ? [
        "Implement centralized load balancing across all networks",
        "Upgrade net-003 and net-004 hardware for improved performance",
        "Deploy monitoring alerts for early issue detection",
        "Consider adding redundancy for critical network nodes",
        "Optimize bandwidth allocation during peak usage periods"
      ] : [
        "Implement load balancing for optimal performance at scale",
        "Add cooling solutions for sustained high-load operations",
        "Consider memory upgrade for 30+ concurrent users",
        "Deploy multiple Pi units for redundancy and increased capacity",
        "Implement QoS policies to prioritize critical traffic"
      ],
      insights: {
        performance: isGlobal ? [
          "Overall network performance exceeds baseline requirements",
          "Individual network optimization opportunities identified",
          "Peak performance varies significantly across locations"
        ] : [
          "Single network performs above commercial ISP standards",
          "Consistent speed delivery across all user loads",
          "System stability maintained under stress conditions"
        ],
        efficiency: isGlobal ? [
          "Cost per user scales favorably with network expansion",
          "Hardware utilization optimized across multiple units",
          "Energy efficiency improvements possible with newer hardware"
        ] : [
          "Cost-effective solution for small to medium deployments",
          "Hardware utilization within optimal ranges",
          "Low operational overhead with high user satisfaction"
        ],
        scalability: isGlobal ? [
          "Current infrastructure supports 120+ users with upgrades",
          "Horizontal scaling proven effective across locations",
          "Network isolation prevents cascading failures"
        ] : [
          "Vertical scaling limited by single unit constraints",
          "Horizontal scaling recommended for growth beyond 30 users",
          "Current architecture suitable for pilot deployments"
        ]
      }
    }
  }

  // Load demo data on component mount
  useEffect(() => {
    if (globalMode || networkId) {
      setReportData(generateDemoData())
      setLastGenerated(new Date())
    }
  }, [globalMode, networkId, reportType])

  const generateReport = async () => {
    setGenerating(true)
    try {
      let endpoint = '/api/admin/generate-report'
      
      if (globalMode) {
        endpoint = '/api/admin/global/generate-report'
      } else if (networkId) {
        endpoint = `/api/admin/${networkId}/generate-report`
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      setReportData(generateDemoData())
      setLastGenerated(new Date())
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setGenerating(false)
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
        // Simulate PDF generation
        alert('PDF export functionality would be implemented with a PDF library like jsPDF or server-side generation')
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
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Select a network to generate performance reports</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900">Performance Report</h2>
                {globalMode ? (
                  <Globe className="h-6 w-6 text-blue-500" />
                ) : (
                  <Network className="h-6 w-6 text-green-500" />
                )}
              </div>
              <p className="text-gray-600">
                {globalMode 
                  ? 'Comprehensive analysis across all network locations'
                  : `Detailed performance analysis for ${reportData?.networkName || 'selected network'}`
                }
              </p>
              {lastGenerated && (
                <p className="text-sm text-gray-500 mt-2">
                  Last generated: {lastGenerated.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['hourly', 'daily', 'weekly', 'monthly'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    reportType === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            
            <button
              onClick={generateReport}
              disabled={generating}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {generating ? (
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={timeRange.start}
                  onChange={(e) => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
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
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Export Options:</span>
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
                >
                  <FileText className="h-3 w-3 mr-1" />
                  PDF
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
                <button className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </button>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h3>
            
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
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Report Overview</h4>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium capitalize">{reportData.type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2 font-medium">{reportData.testInfo.duration}</span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-2 font-medium">{reportData.testInfo.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">Sessions:</span>
                  <span className="ml-2 font-medium">{reportData.summary.totalSessions}</span>
                </div>
                <div>
                  <span className="text-gray-500">Success Rate:</span>
                  <span className="ml-2 font-medium">{reportData.performance.reliability.sessionSuccessRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Analysis</h3>
            
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Network Performance Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportData.networkBreakdown.map((network) => (
                  <div key={network.networkId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{network.networkName}</h4>
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
                        <span className="text-gray-600">Download:</span>
                        <span className="font-medium">{network.performance.avgDownload.toFixed(1)} Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Upload:</span>
                        <span className="font-medium">{network.performance.avgUpload.toFixed(1)} Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Users:</span>
                        <span className="font-medium">{network.performance.users}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reliability:</span>
                        <span className="font-medium">{network.performance.reliability.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    {network.issues && network.issues.length > 0 && network.issues[0] !== 'None' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Issues:</p>
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Commercial Viability</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Cost Analysis</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Hardware Cost:</span>
                      <p className="font-bold text-gray-900">
                        ${reportData.commercialViability.costEffectiveness.hardwareCost}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Cost per User:</span>
                      <p className="font-bold text-gray-900">
                        ${reportData.commercialViability.costEffectiveness.costPerUser.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Users Supported:</span>
                      <p className="font-bold text-gray-900">
                        {reportData.commercialViability.costEffectiveness.usersSupported}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Data Served:</span>
                      <p className="font-bold text-gray-900">
                        {reportData.commercialViability.costEffectiveness.dataServed.toFixed(1)} GB
                      </p>
                    </div>
                    {reportData.commercialViability.costEffectiveness.monthlyOperatingCost && (
                      <>
                        <div>
                          <span className="text-gray-500">Monthly Cost:</span>
                          <p className="font-bold text-gray-900">
                            ${reportData.commercialViability.costEffectiveness.monthlyOperatingCost}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Cost per GB:</span>
                          <p className="font-bold text-gray-900">
                            ${reportData.commercialViability.costEffectiveness.costPerGB.toFixed(3)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Scalability Assessment</h4>
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Insights</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">Performance</h4>
                <div className="space-y-2">
                  {reportData.insights.performance.map((insight, index) => (
                    <div key={index} className="flex items-start p-2 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-900">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-900 mb-3">Efficiency</h4>
                <div className="space-y-2">
                  {reportData.insights.efficiency.map((insight, index) => (
                    <div key={index} className="flex items-start p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-green-900">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-purple-900 mb-3">Scalability</h4>
                <div className="space-y-2">
                  {reportData.insights.scalability.map((insight, index) => (
                    <div key={index} className="flex items-start p-2 bg-purple-50 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-purple-900">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h3>
            
            <div className="space-y-3">
              {reportData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-blue-900">{recommendation}</span>
                  </div>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    Priority {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Stress Points */}
          {reportData.scalabilityTest.systemStressPoints.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">System Stress Points</h3>
              
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Report ID: <span className="font-mono">{reportData.reportId}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Generated: {new Date(reportData.testInfo.endTime).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Castle Labs Network Analytics</p>
                <p className="text-xs text-gray-500">Powered by Raspberry Pi Infrastructure</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No report data available. Generate a new report to get started.</p>
        </div>
      )}
    </div>
  )
}