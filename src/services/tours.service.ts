import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const toursService = {
  async getAllTours() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/tours-360`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al obtener tours';
    }
  },

  async getStats() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/tours-360/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al obtener estadísticas';
    }
  },

  async updateStatus(id: string, status: string) {
    try {
      const token = authService.getToken();
      const response = await axios.patch(`${API_URL}/tours-360/${id}/status`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al actualizar estado';
    }
  }
};
