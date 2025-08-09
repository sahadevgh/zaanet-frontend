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
import SessionAnalytics from "./SessionAnalytics";
import OverviewPage from "./OverviewPage";


type HourlyTrend = {
  hour: number;
  date: string;
  activeUsers: number;
  cpu: number;
  memory: number;
  temperature: number;
};

// Simplified DashboardData type
export type DashboardData = {
  overview: {
    totalActiveUsers: number;
    totalSessions: number;
    activeSessions?: number;
    completedSessions?: number;
    averageDuration?: number;
    totalSpeedTests?: number;
    averageSessionDuration?: number;
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
    totalUsers: number;
    deviceBreakdown: {
      mobile: number;
      desktop: number;
      tablet: number;
      unknown: number;
    };
  };
  trends: {
    hourly: HourlyTrend[];
  };
  networkBreakdown?: Array<{
    networkId: string
    sessions: number
    avgDuration: number
    completionRate: number
  }>;
  metadata: {
    lastUpdated: string;
  };
}


type NetworksDataType = { networks: INetworkConfig[] } | undefined;


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


  const typedNetworksData = networksData as NetworksDataType;
  const networks = typedNetworksData?.networks || [];


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
              {/* {currentView === "lanalytics" && <LiveMetrics networkId={selectedNetworkId} globalMode={globalMode} isLive={true} />} */}
              {currentView === "sanalytics" && <SessionAnalytics networkId={selectedNetworkId} globalMode={globalMode} isLive={true} />}
              {/* {currentView === "performance" && <PerformanceCharts networkId={selectedNetworkId} globalMode={globalMode} />} */}
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
