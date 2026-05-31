import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const securityService = {
  async getAllReports() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/security-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching security reports:', error);
      throw error.response?.data?.message || 'Error al obtener reportes';
    }
  },

  async createReport(data: any) {
    try {
      const token = authService.getToken();
      const response = await axios.post(`${API_URL}/security-reports`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating security report:', error);
      throw error.response?.data?.message || 'Error al crear reporte';
    }
  },

  async updateReportStatus(id: string, status: string) {
    try {
      const token = authService.getToken();
      const response = await axios.patch(`${API_URL}/security-reports/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating security report status:', error);
      throw error.response?.data?.message || 'Error al actualizar reporte';
    }
  }
};
