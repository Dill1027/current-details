export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
}

export interface Item {
  id: string;
  image: string;
  imageUrl: string;
  dateRange: {
    start: string;
    end: string;
  };
  note: string;
  createdBy: User;
  updatedBy?: User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  durationDays: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  msg: string;
  param: string;
  location: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  totalUsers?: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ItemsResponse {
  items: Item[];
  pagination: PaginationData;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationData;
}

export interface UserStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalItems: number;
    recentRegistrations: number;
  };
  roleStats: {
    user: { count: number; active: number };
    admin: { count: number; active: number };
    super_admin: { count: number; active: number };
  };
}

export interface CreateItemData {
  startDate: string;
  endDate: string;
  note: string;
  image: File;
}

export interface UpdateItemData {
  startDate?: string;
  endDate?: string;
  note?: string;
  image?: File;
}

export interface RolePermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
}