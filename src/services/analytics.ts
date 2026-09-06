import apiClient from './api';

export const analyticsService = {
  getAnalytics: async (meterId?: string, range: string = '30d') => {
    try {
      const response = await apiClient.get('/analytics', { params: { meterId, range } });
      return response.data;
    } catch {
      return null;
    }
  },

  getReports: async (params: { range?: string; startDate?: string; endDate?: string; meterId?: string }) => {
    try {
      const response = await apiClient.get('/reports', { params });
      return response.data;
    } catch {
      return null;
    }
  },

  getAIPrediction: async (meterId: string) => {
    try {
      const response = await apiClient.get('/ai/prediction', { params: { meterId } });
      return response.data;
    } catch {
      return null;
    }
  },
};
