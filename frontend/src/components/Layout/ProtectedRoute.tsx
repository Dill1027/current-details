import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if roles are specified
  if (requireRoles && user) {
    const hasRequiredRole = requireRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return (
        <div className="container">
          <div className="card" style={{ marginTop: '2rem' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Access Denied</h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                You don't have permission to access this page.
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Required role(s): {requireRoles.join(', ')}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Your role: {user.role}
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;