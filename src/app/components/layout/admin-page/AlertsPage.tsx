import { useAdminQueries } from "@/hooks/useAdminQueries";
import { LoadingSpinner } from "@/lib/LoadingSpinner";

// Define the alert data structure
interface Alert {
  networkId: string;
  timestamp: string;
  message: string;
}

interface AlertsSummary {
  critical: number;
  warning: number;
  offline: number;
  total: number;
}

interface AlertsData {
  alerts: {
    critical: Alert[];
    warning: Alert[];
    offline: Alert[];
  };
  summary: AlertsSummary;
  timestamp: string;
}

interface AlertsPageProps {
  globalMode: boolean;
  networkId: string | null;
}
/**
 * AlertsPage component displays system alerts for the admin dashboard.
 * It fetches alerts data from the global API and displays them in a structured format.
 * 
 * @param {boolean} globalMode - Indicates if the page is in global mode (true) or network-specific mode (false).
 * @param {string | null} networkId - The ID of the network if in network-specific mode, otherwise null.
 */
function AlertsPage({ globalMode, networkId }: AlertsPageProps) {
  const { useAlerts: useGlobalAlerts } = useAdminQueries();
  const { data: alertsData, isLoading, error } = useGlobalAlerts() as {
    data: AlertsData | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-100">System Alerts</h1>
        <div className="bg-black rounded-xl shadow-sm p-6">
          <p className="text-red-500">Failed to load alerts: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">System Alerts</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            {globalMode ? "Global Alerts" : `Network ${networkId || "unknown"} Alerts`}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {alertsData?.summary?.total || 0} Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Critical</span>
            <span className="text-2xl font-bold text-red-600">
              {alertsData?.summary?.critical || 0}
            </span>
          </div>
        </div>
        <div className="bg-black rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Warning</span>
            <span className="text-2xl font-bold text-yellow-600">
              {alertsData?.summary?.warning || 0}
            </span>
          </div>
        </div>
        <div className="bg-black rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Offline</span>
            <span className="text-2xl font-bold text-gray-300">
              {alertsData?.summary?.offline || 0}
            </span>
          </div>
        </div>
        <div className="bg-black rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Total</span>
            <span className="text-2xl font-bold text-blue-600">
              {alertsData?.summary?.total || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-black rounded-xl shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Recent Alerts</h2>
          <div className="space-y-4">
            {alertsData?.alerts?.critical?.map((alert, index) => (
              <div key={`critical-${index}`} className="flex items-start p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-900">{alert.networkId || "Unknown"}</span>
                    <span className="text-sm text-red-600">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-red-800 mt-1">{alert.message}</p>
                </div>
              </div>
            ))}
            {alertsData?.alerts?.warning?.map((alert, index) => (
              <div key={`warning-${index}`} className="flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-yellow-900">{alert.networkId || "Unknown"}</span>
                    <span className="text-sm text-yellow-600">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-yellow-800 mt-1">{alert.message}</p>
                </div>
              </div>
            ))}
            {alertsData?.alerts?.offline?.map((alert, index) => (
              <div key={`offline-${index}`} className="flex items-start p-4 bg-blue-900 rounded-lg border border-gray-200">
                <div className="w-2 h-2 bg-blue-9000 rounded-full mt-2 mr-3"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-100">{alert.networkId || "Unknown"}</span>
                    <span className="text-sm text-gray-300">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{alert.message}</p>
                </div>
              </div>
            ))}
            {(!alertsData?.alerts || Object.values(alertsData.alerts).every((arr) => arr.length === 0)) && (
              <div className="text-center py-8">
                <p className="text-gray-400">No alerts at this time</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertsPage;