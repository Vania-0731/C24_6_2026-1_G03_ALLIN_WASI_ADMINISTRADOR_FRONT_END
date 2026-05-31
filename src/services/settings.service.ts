import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export interface Setting {
  key: string;
  value: string;
  description: string;
  type: string;
  group: string;
}

export const settingsService = {
  getAllSettings: async (): Promise<Setting[]> => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getPublicSettings: async (): Promise<Record<string, string>> => {
    const response = await axios.get(`${API_URL}/settings/public`);
    return response.data;
  },

  getSettingByKey: async (key: string): Promise<Setting> => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/settings/${key}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateSetting: async (key: string, data: Partial<Setting>): Promise<Setting> => {
    const token = authService.getToken();
    const response = await axios.patch(`${API_URL}/settings/${key}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateMultipleSettings: async (updates: { key: string; value: string }[]): Promise<Setting[]> => {
    const token = authService.getToken();
    const response = await axios.patch(`${API_URL}/settings/bulk`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};
