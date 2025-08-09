import { networkApi } from '@/app/services/networkApi';
import { useQuery } from '@tanstack/react-query';

export const useNetworkQueries = (networkId: string) => {
  const useNetworkDashboard = () =>
    useQuery({
      queryKey: ['network', networkId, 'dashboard'],
      queryFn: () => networkApi.getNetworkDashboard(networkId),
      refetchInterval: 30000,
      enabled: !!networkId,
    });

  const useSystemHealth = () =>
    useQuery({
      queryKey: ['network', networkId, 'system-health'],
      queryFn: () => networkApi.getSystemHealth(networkId),
      refetchInterval: 15000,
      enabled: !!networkId,
    });

  const useDataUsage = () =>
    useQuery({
      queryKey: ['network', networkId, 'data-usage'],
      queryFn: () => networkApi.getDataUsage(networkId),
      refetchInterval: 60000,
      enabled: !!networkId,
    });

  const usePerformanceData = () =>
    useQuery({
      queryKey: ['network', networkId, 'performance'],
      queryFn: () => networkApi.getPerformanceData(networkId),
      refetchInterval: 30000,
      enabled: !!networkId,
    });

  const useSessionAnalytics = () =>
    useQuery({
      queryKey: ['network', networkId, 'session-analytics'],
      queryFn: () => networkApi.getSessionAnalytics(networkId),
      refetchInterval: 60000,
      enabled: !!networkId,
    });

  return {
    useNetworkDashboard,
    useSystemHealth,
    useDataUsage,
    usePerformanceData,
    useSessionAnalytics,
  };
};