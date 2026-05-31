import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  userId?: string;
  createdAt: string;
}

export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const token = authService.getToken();
    const response = await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async markAllAsRead(): Promise<{ message: string }> {
    const token = authService.getToken();
    const response = await axios.patch(`${API_URL}/notifications/read-all`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
