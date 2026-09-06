import apiClient from './api';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch {
      // Handled gracefully in Context via localStorage fallback
      return null;
    }
  },

  register: async (userData: { name: string; email: string; password: string; phone?: string }) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch {
      return null;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch {
      return null;
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/profile');
      return response.data;
    } catch {
      return null;
    }
  },

  updateProfile: async (data: Record<string, unknown>) => {
    try {
      const response = await apiClient.put('/profile', data);
      return response.data;
    } catch {
      return null;
    }
  },
};
