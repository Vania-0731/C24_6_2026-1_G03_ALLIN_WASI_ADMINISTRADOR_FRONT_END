import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const userService = {
  async getAllUsers() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al obtener usuarios';
    }
  },

  async createUser(userData: any) {
    try {
      const token = authService.getToken();
      const response = await axios.post(`${API_URL}/users`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al crear usuario';
    }
  },

  async updateUser(id: string, userData: any) {
    try {
      const token = authService.getToken();
      const response = await axios.patch(`${API_URL}/users/${id}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al actualizar usuario';
    }
  },

  async deleteUser(id: string) {
    try {
      const token = authService.getToken();
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al eliminar usuario';
    }
  },

  async updatePermissions(id: string, permissions: any) {
    try {
      const token = authService.getToken();
      const response = await axios.patch(`${API_URL}/users/${id}/permissions`, permissions, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al actualizar permisos';
    }
  }
};
