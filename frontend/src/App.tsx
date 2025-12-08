import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ItemList from './components/Items/ItemList';
import CreateItem from './components/Items/CreateItem';
import EditItem from './components/Items/EditItem';
import ItemDetail from './components/Items/ItemDetail';
import UserManagement from './components/Users/UserManagement';
import Profile from './components/Auth/Profile';
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <main className="container" style={{ marginTop: '2rem' }}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/items" element={<ItemList />} />
                        <Route 
                          path="/items/create" 
                          element={
                            <ProtectedRoute requireRoles={['admin', 'super_admin']}>
                              <CreateItem />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/items/:id/edit" 
                          element={
                            <ProtectedRoute requireRoles={['admin', 'super_admin']}>
                              <EditItem />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="/items/:id" element={<ItemDetail />} />
                        <Route 
                          path="/users" 
                          element={
                            <ProtectedRoute requireRoles={['super_admin']}>
                              <UserManagement />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;