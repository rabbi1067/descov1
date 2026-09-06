import apiClient from './api';
import { Meter } from '../types';

export const meterService = {
  getMeters: async (): Promise<Meter[] | null> => {
    try {
      const response = await apiClient.get('/meters');
      return response.data;
    } catch {
      return null;
    }
  },

  addMeter: async (meterData: Partial<Meter>): Promise<Meter | null> => {
    try {
      const response = await apiClient.post('/meters', meterData);
      return response.data;
    } catch {
      return null;
    }
  },

  updateMeter: async (id: string, meterData: Partial<Meter>): Promise<Meter | null> => {
    try {
      const response = await apiClient.put(`/meters/${id}`, meterData);
      return response.data;
    } catch {
      return null;
    }
  },

  deleteMeter: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/meters/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
