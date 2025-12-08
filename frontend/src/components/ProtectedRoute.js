import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermissions } from '../utils/permissions';

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0 && !hasPermissions(user?.role, requiredPermissions)) {
    return (
      <div className="access-denied">
        <div className="container">
          <div className="card">
            <div className="card-content text-center">
              <h2>Access Denied</h2>
              <p>You don't have permission to access this resource.</p>
              <p>Required permissions: {requiredPermissions.join(', ')}</p>
              <p>Your role: {user?.role}</p>
              <button 
                onClick={() => window.history.back()}
                className="btn btn-primary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;