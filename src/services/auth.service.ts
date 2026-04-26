import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      if (response.data.access_token) {
        localStorage.setItem('admin_token', response.data.access_token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al iniciar sesión';
    }
  },

  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  getToken() {
    return localStorage.getItem('admin_token');
  },

  getUser() {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  }
};
