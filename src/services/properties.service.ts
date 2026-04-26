import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const propertyService = {
  async getAllProperties() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al obtener propiedades';
    }
  },

  async updateStatus(id: string, status: string) {
    try {
      const token = authService.getToken();
      const response = await axios.patch(`${API_URL}/properties/${id}/status`, { status }, {
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
