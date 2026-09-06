import apiClient from './api';
import { AppNotification } from '../types';

export const notificationService = {
  getNotifications: async (): Promise<AppNotification[] | null> => {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch {
      return null;
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await apiClient.put(`/notifications/${id}/read`);
      return response.data;
    } catch {
      return null;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await apiClient.put('/notifications/mark-all-read');
      return response.data;
    } catch {
      return null;
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
