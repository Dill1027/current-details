import axios from 'axios';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
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
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Set auth token
  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // Clear auth token
  clearAuthToken() {
    delete this.api.defaults.headers.common['Authorization'];
  }

  // Handle API response
  handleResponse(response) {
    return response.data;
  }

  // Handle API error
  handleError(error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred');
    }
  }

  // Authentication endpoints
  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async register(name, email, password) {
    try {
      const response = await this.api.post('/auth/register', { name, email, password });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyToken() {
    try {
      const response = await this.api.get('/auth/verify');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async logout() {
    try {
      const response = await this.api.post('/auth/logout');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Profile endpoints
  async getProfile() {
    try {
      const response = await this.api.get('/auth/profile');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProfile(data) {
    try {
      const response = await this.api.put('/auth/profile', data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Item endpoints
  async getItems(params = {}) {
    try {
      const response = await this.api.get('/items', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getItem(id) {
    try {
      const response = await this.api.get(`/items/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createItem(formData) {
    try {
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

  async updateItem(id, formData) {
    try {
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

  async deleteItem(id) {
    try {
      const response = await this.api.delete(`/items/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMyItems(params = {}) {
    try {
      const response = await this.api.get('/items/my/items', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // User management endpoints (super admin only)
  async getUsers(params = {}) {
    try {
      const response = await this.api.get('/users', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUserRole(userId, role) {
    try {
      const response = await this.api.put(`/users/${userId}/role`, { role });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async toggleUserActivation(userId) {
    try {
      const response = await this.api.put(`/users/${userId}/toggle-activation`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserStats() {
    try {
      const response = await this.api.get('/users/stats/overview');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async bulkUpdateUserRoles(updates) {
    try {
      const response = await this.api.put('/users/bulk-role-update', { updates });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;