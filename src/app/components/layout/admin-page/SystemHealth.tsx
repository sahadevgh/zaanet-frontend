'use client'

import { useState, useEffect } from 'react'
import { 
  Cpu, 
  HardDrive, 
  Thermometer, 
  Wifi,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react'

interface SystemHealthProps {
  detailed?: boolean
}

interface SystemHealthData {
  cpu: number
  memory: number
  temperature: number
  diskUsage: number
  networkStatus: 'online' | 'offline'
  uptime: string
}

export default function SystemHealth({ detailed = false }: SystemHealthProps) {
  const [healthData, setHealthData] = useState<SystemHealthData>({
    cpu: 0,
    memory: 0,
    temperature: 0,
    diskUsage: 0,
    networkStatus: 'online',
    uptime: '0h 0m'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await fetch('/api/admin/system-health')
        if (response.ok) {
          const data = await response.json()
          setHealthData({
            cpu: data.systemHealth.cpu || 0,
            memory: data.systemHealth.memory || 0,
            temperature: data.systemHealth.temperature || 0,
            diskUsage: data.systemHealth.diskUsage || 0,
            networkStatus: data.networkStatus || 'online',
            uptime: data.uptime || '0h 0m'
          })
        }
      } catch (error) {
        console.error('Failed to fetch system health:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHealthData()
    const interval = setInterval(fetchHealthData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return 'text-red-600 bg-red-50'
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getProgressBarColor = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return 'bg-red-500'
    if (value >= thresholds.warning) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const healthMetrics = [
    {
      name: 'CPU Usage',
      value: healthData.cpu,
      icon: Cpu,
      unit: '%',
      thresholds: { warning: 70, danger: 85 }
    },
    {
      name: 'Memory',
      value: healthData.memory,
      icon: HardDrive,
      unit: '%',
      thresholds: { warning: 80, danger: 90 }
    },
    {
      name: 'Temperature',
      value: healthData.temperature,
      icon: Thermometer,
      unit: '°C',
      thresholds: { warning: 60, danger: 70 }
    },
    {
      name: 'Disk Usage',
      value: healthData.diskUsage,
      icon: HardDrive,
      unit: '%',
      thresholds: { warning: 80, danger: 90 }
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <div className="flex items-center space-x-2">
            {healthData.networkStatus === 'online' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              healthData.networkStatus === 'online' ? 'text-green-600' : 'text-red-600'
            }`}>
              {healthData.networkStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon
          const statusColor = getStatusColor(metric.value, metric.thresholds)
          const progressColor = getProgressBarColor(metric.value, metric.thresholds)

          return (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                </div>
                <span className={`text-sm font-bold px-2 py-1 rounded ${statusColor}`}>
                  {metric.value.toFixed(1)}{metric.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                  style={{ width: `${Math.min(metric.value, 100)}%` }}
                ></div>
              </div>
            </div>
          )
        })}

        {detailed && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Uptime:</span>
                <span className="ml-2 font-medium">{healthData.uptime}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium text-green-600">Healthy</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}