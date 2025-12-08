import { UserRole, RolePermissions } from '../types';

// Get role permissions based on user role
export const getRolePermissions = (role: UserRole): RolePermissions => {
  switch (role) {
    case 'super_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canManageUsers: true,
      };
    case 'admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canManageUsers: false,
      };
    case 'user':
    default:
      return {
        canCreate: false,
        canRead: true,
        canUpdate: false,
        canDelete: false,
        canManageUsers: false,
      };
  }
};

// Check if user has specific permission
export const hasPermission = (role: UserRole, permission: keyof RolePermissions): boolean => {
  const permissions = getRolePermissions(role);
  return permissions[permission];
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date and time for display
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate duration between two dates in days
export const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isValidPassword = (password: string): boolean => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

// Get password strength description
export const getPasswordStrength = (password: string): string => {
  if (password.length < 6) return 'Too short';
  if (!/[a-z]/.test(password)) return 'Add lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Add uppercase letter';
  if (!/\d/.test(password)) return 'Add number';
  return 'Strong';
};

// Capitalize first letter of string
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'user':
      return 'User';
    default:
      return role;
  }
};

// Get role badge color
export const getRoleBadgeColor = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return 'bg-red-100 text-red-800';
    case 'admin':
      return 'bg-blue-100 text-blue-800';
    case 'user':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Handle API error messages
export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Debounce function
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};