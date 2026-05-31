import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export interface LandlordProfile {
  id: string;
  userId: string;
  phone: string;
  dni: string;
  address: string;
  propertyCount: string;
  dniFrontUrl?: string;
  dniBackUrl?: string;
  utilityBillUrl?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationMessage?: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    profilePicture?: string;
    isVerified: boolean;
  };
}

export interface TenantProfile {
  id: string;
  userId: string;
  phone: string;
  code: string;
  career: string;
  cicle: string;
  monthly_budget: number;
  origin_department: string;
  bio?: string;
  studentIDCardUrl?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationMessage?: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    profilePicture?: string;
    isVerified: boolean;
  };
}

class VerificationRequestsService {
  async getLandlordRequests(): Promise<LandlordProfile[]> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/verification-requests/landlords`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async updateLandlordStatus(id: string, status: 'verified' | 'rejected', message?: string): Promise<LandlordProfile> {
    const token = authService.getToken();
    const response = await axios.patch(`${API_URL}/verification-requests/landlords/${id}/status`, {
      status,
      message,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getTenantRequests(): Promise<TenantProfile[]> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/verification-requests/tenants`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async updateTenantStatus(id: string, status: 'verified' | 'rejected', message?: string): Promise<TenantProfile> {
    const token = authService.getToken();
    const response = await axios.patch(`${API_URL}/verification-requests/tenants/${id}/status`, {
      status,
      message,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  getProxyUrl(url?: string): string {
    if (!url) return '';
    return `${API_URL}/verification-requests/proxy?url=${encodeURIComponent(url)}`;
  }
}

export const verificationRequestsService = new VerificationRequestsService();
