import axios from 'axios';

const apiClient = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const networkApi = {
  // GET /api/admin/networks/[networkId]
  getNetworkDashboard: async (networkId: string) => {
    const response = await apiClient.get(`/api/admin/networks/${networkId}`);
    return response.data;
  },

  // GET /api/admin/networks/[networkId]/system-health
  getSystemHealth: async (networkId: string) => {
    const response = await apiClient.get(`/api/admin/networks/${networkId}/system-health`);
    return response.data;
  },

  // GET /api/admin/networks/[networkId]/data-usage
  getDataUsage: async (networkId: string) => {
    const response = await apiClient.get(`/api/admin/networks/${networkId}/data-usage`);
    return response.data;
  },

  // GET /api/admin/networks/[networkId]/data-usage-snapshot
  getDataUsageSnapshot: async (networkId: string) => {
    const response = await apiClient.get(`/api/admin/networks/${networkId}/data-usage-snapshot`);
    return response.data;
  },

  // GET /api/admin/networks/[networkId]/performance
  getPerformanceData: async (networkId: string) => {
    const response = await apiClient.get(`/api/admin/networks/${networkId}/performance`);
    return response.data;
  },

  // GET /api/admin/networks/[networkId]/session-analytics
  getSessionAnalytics: async (networkId: string) => {
    const response = await apiClient.get(`/api/admin/networks/${networkId}/session-analytics`);
    return response.data;
  },

  // GET /api/admin/networks/[networkId]/reports?type=hourly&startDate=...&endDate=...
  generateReport: async (networkId: string, params?: {
    type?: 'hourly' | 'daily';
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get(`/api/admin/networks/${networkId}/reports`, {
      params
    });
    return response.data;
  }
};