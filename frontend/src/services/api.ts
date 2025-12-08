import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  User, 
  Item, 
  ItemsResponse, 
  UsersResponse, 
  UserStats, 
  CreateItemData, 
  UpdateItemData 
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Helper method to handle API responses
  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (response.data.success) {
      return response.data.data as T;
    }
    throw new Error(response.data.message || 'An error occurred');
  }

  // Helper method to handle API errors
  private handleError(error: any): never {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.message) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred');
  }

  // Authentication Methods
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await this.api.post('/auth/register', { name, email, password });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProfile(): Promise<{ user: User }> {
    try {
      const response = await this.api.get('/auth/me');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProfile(name: string, email: string): Promise<{ user: User }> {
    try {
      const response = await this.api.put('/auth/profile', { name, email });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.api.put('/auth/password', { currentPassword, newPassword });
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyToken(token: string): Promise<{ user: User }> {
    try {
      const response = await this.api.post('/auth/verify-token', { token });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Item Methods
  async getItems(page = 1, limit = 10, search?: string): Promise<ItemsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      const response = await this.api.get(`/items?${params}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getItem(id: string): Promise<{ item: Item }> {
    try {
      const response = await this.api.get(`/items/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createItem(data: CreateItemData): Promise<{ item: Item }> {
    try {
      const formData = new FormData();
      formData.append('startDate', data.startDate);
      formData.append('endDate', data.endDate);
      formData.append('note', data.note);
      formData.append('image', data.image);

      const response = await this.api.post('/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateItem(id: string, data: UpdateItemData): Promise<{ item: Item }> {
    try {
      const formData = new FormData();
      
      if (data.startDate) formData.append('startDate', data.startDate);
      if (data.endDate) formData.append('endDate', data.endDate);
      if (data.note) formData.append('note', data.note);
      if (data.image) formData.append('image', data.image);

      const response = await this.api.put(`/items/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      await this.api.delete(`/items/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMyItems(page = 1, limit = 10): Promise<ItemsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await this.api.get(`/items/my/items?${params}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // User Management Methods (Super Admin Only)
  async getUsers(page = 1, limit = 10, role?: string, search?: string, isActive?: boolean): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(role && { role }),
        ...(search && { search }),
        ...(isActive !== undefined && { isActive: isActive.toString() }),
      });
      const response = await this.api.get(`/users?${params}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUser(id: string): Promise<{ user: User }> {
    try {
      const response = await this.api.get(`/users/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUserRole(id: string, role: string): Promise<{ user: User }> {
    try {
      const response = await this.api.put(`/users/${id}/role`, { role });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<{ user: User }> {
    try {
      const response = await this.api.put(`/users/${id}/status`, { isActive });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUsersByRole(role: string): Promise<{ users: User[]; count: number }> {
    try {
      const response = await this.api.get(`/users/role/${role}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const response = await this.api.get('/users/stats/overview');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.api.delete(`/users/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async bulkUpdateUserRoles(userIds: string[], role: string): Promise<{ modifiedCount: number }> {
    try {
      const response = await this.api.put('/users/bulk/roles', { userIds, role });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Health Check
  async healthCheck(): Promise<any> {
    try {
      const response = await this.api.get('/health');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;