import { useAdminQueries } from '@/hooks/useAdminQueries';
import { useNetworkQueries } from '@/hooks/useNetworkQueries';
import { LoadingSpinner } from '@/lib/LoadingSpinner';
import React, { useEffect } from 'react'
import LiveMetrics from './LiveMetrics';
import { RecentActivityCard } from './RecentActivityCard';
import { DashboardData } from './Dashboard';

interface OverviewPageProps {
  isLive: boolean;
  networkId: string | null;
  globalMode: boolean;
}

function OverviewPage({ isLive, networkId, globalMode }: OverviewPageProps) {
  const { useDashboard: useGlobalDashboard } = useAdminQueries();
  const { useNetworkDashboard } = useNetworkQueries(networkId || "");

  const dashboardQuery = globalMode ? useGlobalDashboard() : useNetworkDashboard();
  const { data, isLoading, error, refetch } = dashboardQuery;

  const defaultDashboardData: DashboardData = {
    overview: {
      totalActiveUsers: 0,
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
      totalUsers: 0,
      deviceBreakdown: {
        mobile: 0,
        desktop: 0,
        tablet: 0,
        unknown: 0,
      },
    },
    trends: {
      hourly: [],
    },
    metadata: {
      lastUpdated: "",
    },
  };

  const dashboardData: DashboardData =
    data && typeof data === "object" &&
      "overview" in data &&
      "performance" in data &&
      "traffic" in data
      ? (data as DashboardData)
      : defaultDashboardData;

  // Auto-refresh logic
  // Refetch every 30 seconds if live mode is enabled
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

  return (
    <div className="space-y-6">
      {/* {process.env.NODE_ENV === "development" && (
        <div className="bg-blue-900 p-4 rounded text-xs text-white">
          <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
        </div>
      )} */}

      <LiveMetrics
        isLive={isLive}
        networkId={networkId}
        globalMode={globalMode}
        dashboardData={dashboardData}
        refetch={refetch}
        error={error}
        loading={isLoading}
      />

      <div className="">
        <div>
          <RecentActivityCard
            dashboardData={dashboardData}
          />
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;