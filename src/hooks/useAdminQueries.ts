import { adminApi } from '@/app/services/adminApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useAdminQueries = () => {
  const queryClient = useQueryClient();

  // Dashboard query using your existing adminApi.getDashboard
  const useDashboard = () => 
    useQuery({
      queryKey: ['admin', 'dashboard'],
      queryFn: adminApi.getDashboard, // ← Your existing function
      refetchInterval: 30000, // Auto-refresh every 30 seconds
      staleTime: 10000, // Consider data fresh for 10 seconds
    });

  // Networks query using your existing adminApi.getNetworks
  const useNetworks = () =>
    useQuery({
      queryKey: ['admin', 'networks'],
      queryFn: adminApi.getNetworks, // ← Your existing function
      refetchInterval: 60000,
    });

  // Stats query using your existing adminApi.getStats
  const useStats = (timeRange: string = '24h') =>
    useQuery({
      queryKey: ['admin', 'stats', timeRange],
      queryFn: () => adminApi.getStats(timeRange), // ← Your existing function
      refetchInterval: 60000,
      enabled: !!timeRange, // Only run if timeRange is provided
    });

  // Alerts query using your existing adminApi.getAlerts
  const useAlerts = () =>
    useQuery({
      queryKey: ['admin', 'alerts'],
      queryFn: adminApi.getAlerts, // ← Your existing function
      refetchInterval: 10000, // Frequent updates for alerts
    });

  // Export mutation using your existing adminApi.exportData
  const useExportData = () =>
    useMutation({
      mutationFn: adminApi.exportData, // ← Your existing function
      onSuccess: (data, variables) => {
        // Handle successful export
        if (variables.format === 'csv') {
          // Create download for CSV
          const blob = new Blob([String(data)], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `zaanet-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      },
      onError: (error) => {
        console.error('Export failed:', error);
        // You could show a toast notification here
      }
    });

  return {
    useDashboard,
    useNetworks,
    useStats,
    useAlerts,
    useExportData,
  };
};