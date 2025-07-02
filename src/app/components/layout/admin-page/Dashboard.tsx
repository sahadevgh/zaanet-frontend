"use client";

import { useState, useEffect } from "react";
import { Wifi, Users, Activity, Download, TrendingUp, RefreshCw } from "lucide-react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import { useAdminQueries } from "@/hooks/useAdminQueries";
import { useNetworkQueries } from "@/hooks/useNetworkQueries";
import { INetworkConfig } from "@/app/server/models/NetworkConfig.model";
import ReportsPage from "./ReportsPage";
import AlertsPage from "./AlertsPage";
import PerformanceCharts from "./PerformanceCharts";
import LiveMetrics from "./LiveMetrics";
import SessionAnalytics from "./SessionAnalytics";

// Simplified DashboardData type
type DashboardData = {
  overview: {
    activeUsers: number;
    totalSessions: number;
    systemHealth: {
      cpu: number;
      memory: number;
      temperature: number;
      diskUsage: number;
    };
  };
  performance: {
    averageSpeed: {
      download: number;
      upload: number;
    };
  };
  traffic: {
    totalDataTransfer: {
      downloadGB: number;
      uploadGB: number;
    };
  };
};

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<string>("overview");
  const [isLive, setIsLive] = useState(true);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(null);
  const [globalMode, setGlobalMode] = useState(true);

  const { useNetworks } = useAdminQueries();
  const {
    data: networksData,
    isLoading: loadingNetworks,
    refetch: refetchNetworks,
    error: networksError
  } = useNetworks();


  const networks: INetworkConfig[] = Array.isArray(networksData) ? networksData : [];


  const handleModeSwitch = (isGlobal: boolean) => {
    setGlobalMode(isGlobal);
    if (isGlobal) {
      setSelectedNetworkId(null);
    }
  };

  return (
    <div className="flex h-screen min-h-screen bg-gradient-to-br from-blue-900 to-black overflow-hidden">
      <DashboardSidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        globalMode={globalMode}
        setGlobalMode={handleModeSwitch}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          isLive={isLive}
          setIsLive={setIsLive}
          globalMode={globalMode}
          selectedNetworkId={selectedNetworkId}
          networks={networks}
          setSelectedNetworkId={setSelectedNetworkId}
          loadingNetworks={loadingNetworks}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {networksError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Failed to load networks: {networksError.message}</p>
              <button
                onClick={() => refetchNetworks()}
                className="mt-2 text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {!globalMode && !selectedNetworkId && (
            <NetworkSelector
              networks={networks}
              onSelectNetwork={setSelectedNetworkId}
              loading={loadingNetworks}
              onRefresh={() => refetchNetworks()}
            />
          )}

          {(globalMode || selectedNetworkId) && (
            <>
              {currentView === "overview" && (
                <OverviewPage
                  isLive={isLive}
                  networkId={selectedNetworkId}
                  globalMode={globalMode}
                />
              )}
              {currentView === "lanalytics" && <LiveMetrics networkId={selectedNetworkId} globalMode={globalMode} isLive={true} />}
              {currentView === "sanalytics" && <SessionAnalytics networkId={selectedNetworkId} globalMode={globalMode} isLive={true} />}
              {currentView === "performance" && <PerformanceCharts networkId={selectedNetworkId} globalMode={globalMode} />}
              {currentView === "reports" && <ReportsPage networkId={selectedNetworkId} globalMode={globalMode} />}
              {currentView === "alerts" && <AlertsPage globalMode={globalMode} networkId={selectedNetworkId} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function NetworkSelector({
  networks,
  onSelectNetwork,
  loading,
  onRefresh,
}: {
  networks: INetworkConfig[];
  onSelectNetwork: (networkId: string) => void;
  loading: boolean;
  onRefresh: () => void;
}) {

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading networks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Select a Network</h1>
        <p className="text-gray-300">Choose a network to monitor and manage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {networks.map((network, index) => (
          <div key={index}>
            <NetworkCard
              network={network}
              onSelect={() => onSelectNetwork(network.networkId)}
            />
          </div>
        ))}
      </div>

      {networks.length === 0 && (
        <div className="text-center py-12">
          <Wifi className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No networks found</h3>
          <p className="text-gray-300 mb-6">No networks are currently available.</p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

function NetworkCard({ network, onSelect }: { network: INetworkConfig; onSelect: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-900 text-gray-200";
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "active":
        return "🟢";
      case "maintenance":
        return "🟡";
      case "offline":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div
      className="bg-blue-900 rounded-xl shadow-sm border hover:shadow-md hover:border-blue-200 transition-all cursor-pointer p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Wifi className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{network.ssid}</h3>
            <p className="text-sm text-gray-300">
              {network?.location?.city || "Unknown"}, {network?.location?.area || "Unknown"}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(network.status)}`}>
          <span className="mr-1">{getStatusIcon(network?.status)}</span>
          {network?.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Network ID</span>
          <span className="font-mono text-sm text-gray-300">{network.networkId.slice(0, 8)}...</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Price</span>
          <span className="font-medium text-white">{network.price} USDT/day</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={onSelect}
          className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Select Network
        </button>
      </div>
    </div>
  );
}

interface OverviewPageProps {
  isLive: boolean;
  networkId: string | null;
  globalMode: boolean;
}

function OverviewPage({ isLive, networkId, globalMode }: OverviewPageProps) {
  const { useDashboard: useGlobalDashboard } = useAdminQueries();
  const { useNetworkDashboard } = useNetworkQueries(networkId || "");

  const dashboardQuery = globalMode ? useGlobalDashboard() : useNetworkDashboard();
  const { data, isLoading, error } = dashboardQuery;
  const defaultDashboardData: DashboardData = {
    overview: {
      activeUsers: 0,
      totalSessions: 0,
      systemHealth: {
        cpu: 0,
        memory: 0,
        temperature: 0,
        diskUsage: 0,
      },
    },
    performance: {
      averageSpeed: {
        download: 0,
        upload: 0,
      },
    },
    traffic: {
      totalDataTransfer: {
        downloadGB: 0,
        uploadGB: 0,
      },
    },
  };

  const dashboardData: DashboardData =
    data && typeof data === "object" &&
      "overview" in data &&
      "performance" in data &&
      "traffic" in data
      ? (data as DashboardData)
      : defaultDashboardData;

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        dashboardQuery.refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isLive, dashboardQuery]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load dashboard data: {error.message}</p>
        <button
          onClick={() => dashboardQuery.refetch()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeUsers = dashboardData?.overview?.activeUsers || 0;
  const totalDataGB =
    (dashboardData?.traffic?.totalDataTransfer?.downloadGB || 0) +
    (dashboardData?.traffic?.totalDataTransfer?.uploadGB || 0);

  return (
    <div className="space-y-6">
      {/* {process.env.NODE_ENV === "development" && (
        <div className="bg-blue-900 p-4 rounded text-xs text-white">
          <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
        </div>
      )} */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Users"
          value={activeUsers}
          icon={Users}
          color="blue"
          trend="+12%"
        />
        <MetricCard
          title="Total Sessions"
          value={dashboardData?.overview?.totalSessions || 0}
          icon={Activity}
          color="green"
          trend="+5%"
        />
        <MetricCard
          title="Avg Download"
          value={`${(dashboardData?.performance?.averageSpeed?.download || 0).toFixed(1)} Mbps`}
          icon={Download}
          color="purple"
          trend="+8%"
        />
        <MetricCard
          title="Data Transfer"
          value={`${totalDataGB.toFixed(1)} GB`}
          icon={TrendingUp}
          color="orange"
          trend="+15%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SystemHealthCard data={dashboardData?.overview?.systemHealth} />
        </div>
        {/* <div>
          <RecentActivityCard />
        </div> */}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: "blue" | "green" | "purple" | "orange";
  trend?: string;
}

function MetricCard({ title, value, icon: Icon, color, trend }: MetricCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
  };

  return (
    <div className="bg-blue-900 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-300 mb-1">{title}</p>
          <p className="text-lg font-bold text-white">{value}</p>
          {/* {trend && (
            <p className="text-sm text-green-600 mt-1">
              {trend} from last hour
            </p>
          )} */}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

interface SystemHealthData {
  cpu?: number;
  memory?: number;
  temperature?: number;
  diskUsage?: number;
}

function SystemHealthCard({ data }: { data?: SystemHealthData }) {
  const healthMetrics = [
    { label: "CPU Usage", value: data?.cpu || 0, max: 100, color: "bg-blue-500" },
    { label: "Memory", value: data?.memory || 0, max: 100, color: "bg-green-500" },
    { label: "Temperature", value: data?.temperature || 0, max: 80, color: "bg-orange-500" },
    { label: "Disk Usage", value: data?.diskUsage || 0, max: 100, color: "bg-purple-500" },
  ];

  return (
    <div className="bg-blue-900 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
      <div className="space-y-4">
        {healthMetrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">{metric.label}</span>
              <span className="font-medium text-gray-300">{metric.value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${metric.color} transition-all duration-300`}
                style={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}