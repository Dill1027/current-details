import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ItemList from './components/ItemList';
import ItemForm from './components/ItemForm';
import ExpiredItems from './components/ExpiredItems';
import UserManagement from './components/UserManagement';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Loading component
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Main App component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
          <ToastContainer position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

// App content that can access auth context
function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Hide header on dashboard page
  const showHeader = isAuthenticated && location.pathname !== '/dashboard';

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {showHeader && <Header />}
      <div style={{ 
        minHeight: '100vh',
        paddingTop: showHeader ? 'clamp(70px, 10vw, 90px)' : '0'
      }}>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
          />
          
          {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/items"
        element={
          <ProtectedRoute>
            <ItemList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/items/expired"
        element={
          <ProtectedRoute>
            <ExpiredItems />
          </ProtectedRoute>
        }
      />
      <Route
        path="/items/create"
        element={
          <ProtectedRoute requiredPermissions={['create']}>
            <ItemForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/items/edit/:id"
        element={
          <ProtectedRoute requiredPermissions={['update']}>
            <ItemForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredPermissions={['manageUsers']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect */}
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;