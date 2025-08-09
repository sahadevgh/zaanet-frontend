
import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: '/api/admin/global',
  timeout: 30000, // 30 seconds for large data exports
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const adminApi = {
  // GET /api/admin/global/dashboard
  getDashboard: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },

  // GET /api/admin/global/networks
  getNetworks: async () => {
    const response = await apiClient.get('/networks');
    return response.data;
  },

  // GET /api/admin/global/stats?timeRange=24h
  getStats: async (timeRange: string = '24h') => {
    const response = await apiClient.get('/stats', {
      params: { timeRange }
    });
    return response.data;
  },

  // GET /api/admin/global/alerts
  getAlerts: async () => {
    const response = await apiClient.get('/alerts');
    return response.data;
  },

  // POST /api/admin/global/export
  exportData: async (exportConfig: {
    networks?: string[];
    timeRange?: string;
    dataTypes?: string[];
    format?: 'json' | 'csv';
  }) => {
    const response = await apiClient.post('/export', exportConfig, {
      responseType: exportConfig.format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  }
};