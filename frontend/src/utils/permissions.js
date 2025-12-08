// Role-based permissions utility functions

// Define role hierarchies and permissions
const PERMISSIONS = {
  user: {
    read: true,
    create: false,
    update: false,
    delete: false,
    manageUsers: false,
  },
  admin: {
    read: true,
    create: true,
    update: true,
    delete: false,
    manageUsers: false,
  },
  super_admin: {
    read: true,
    create: true,
    update: true,
    delete: true,
    manageUsers: true,
  },
};

/**
 * Check if a user role has specific permissions
 * @param {string} role - User role (user, admin, super_admin)
 * @param {string[]} requiredPermissions - Array of required permissions
 * @returns {boolean} - True if user has all required permissions
 */
export const hasPermissions = (role, requiredPermissions) => {
  if (!role || !requiredPermissions) {
    return false;
  }

  const rolePermissions = PERMISSIONS[role];
  
  if (!rolePermissions) {
    return false;
  }

  return requiredPermissions.every(permission => rolePermissions[permission]);
};

/**
 * Check if user can perform CRUD operations
 * @param {string} role - User role
 * @returns {boolean} - True if user can create, update, or delete
 */
export const canPerformCRUD = (role) => {
  return hasPermissions(role, ['create', 'update', 'delete']);
};

/**
 * Check if user can manage other users
 * @param {string} role - User role
 * @returns {boolean} - True if user can manage users
 */
export const canManageUsers = (role) => {
  return hasPermissions(role, ['manageUsers']);
};

/**
 * Check if user is read-only
 * @param {string} role - User role
 * @returns {boolean} - True if user can only read
 */
export const isReadOnly = (role) => {
  return role === 'user';
};

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {object} - Object with permission flags
 */
export const getRolePermissions = (role) => {
  return PERMISSIONS[role] || PERMISSIONS.user;
};

/**
 * Check if user can access a specific route
 * @param {string} role - User role
 * @param {string} route - Route path
 * @returns {boolean} - True if user can access route
 */
export const canAccessRoute = (role, route) => {
  const protectedRoutes = {
    '/items/create': ['create'],
    '/items/edit': ['update'],
    '/users': ['manageUsers'],
  };

  // Check if route requires specific permissions
  for (const [routePattern, permissions] of Object.entries(protectedRoutes)) {
    if (route.includes(routePattern)) {
      return hasPermissions(role, permissions);
    }
  }

  // Default routes accessible to all authenticated users
  return true;
};

/**
 * Format role name for display
 * @param {string} role - User role
 * @returns {string} - Formatted role name
 */
export const formatRole = (role) => {
  if (!role) return 'User';
  
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get role badge class for styling
 * @param {string} role - User role
 * @returns {string} - CSS class name
 */
export const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'super_admin':
      return 'badge-danger';
    case 'admin':
      return 'badge-warning';
    case 'user':
      return 'badge-primary';
    default:
      return 'badge-secondary';
  }
};

/**
 * Get available roles for role assignment
 * @param {string} currentUserRole - Current user's role
 * @returns {string[]} - Array of roles current user can assign
 */
export const getAssignableRoles = (currentUserRole) => {
  switch (currentUserRole) {
    case 'super_admin':
      return ['user', 'admin', 'super_admin'];
    case 'admin':
      return ['user']; // Admins can only demote to user
    default:
      return []; // Regular users cannot assign roles
  }
};