import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiService from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: ''
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
        ...(filters.isActive !== '' && { isActive: filters.isActive })
      };
      
      const response = await apiService.getUsers(params);
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const response = await apiService.getUserStats();
      if (response.success) {
        // Transform the nested data structure to flat structure
        const transformedStats = {
          totalUsers: response.data.overview?.totalUsers || 0,
          activeUsers: response.data.overview?.activeUsers || 0,
          inactiveUsers: response.data.overview?.inactiveUsers || 0,
          adminCount: (response.data.roleStats?.admin?.count || 0) + (response.data.roleStats?.super_admin?.count || 0)
        };
        setStats(transformedStats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await apiService.updateUserRole(userId, newRole);
      if (response.success) {
        toast.success('User role updated successfully');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  // Toggle user activation
  const handleToggleActivation = async (userId) => {
    try {
      const response = await apiService.toggleUserActivation(userId);
      if (response.success) {
        toast.success(response.message || 'User status updated successfully');
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container" style={{ padding: 'clamp(16px, 3vw, 24px)', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <a href="/dashboard" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          color: '#667eea',
          fontWeight: '600',
          marginBottom: '20px',
          padding: '8px 16px',
          borderRadius: '8px',
          transition: 'all 0.2s',
          background: '#f0f9ff'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#e0f2fe';
          e.currentTarget.style.transform = 'translateX(-5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f0f9ff';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
        >
          ← Back to Dashboard
        </a>
        <h1 className="page-title">👥 User Management</h1>
        <p className="page-subtitle">Manage user accounts, roles, and permissions</p>
      </div>

      {/* User Statistics */}
      {stats && (
        <div className="user-stats-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '25px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '2.5em', marginBottom: '5px', fontWeight: 'bold' }}>
              {stats.totalUsers || 0}
            </div>
            <div style={{ fontSize: '0.9em', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Total Users
            </div>
          </div>
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '25px',
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '2.5em', marginBottom: '5px', fontWeight: 'bold' }}>
              {stats.activeUsers || 0}
            </div>
            <div style={{ fontSize: '0.9em', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Active Users
            </div>
          </div>
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '25px',
            background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '2.5em', marginBottom: '5px', fontWeight: 'bold' }}>
              {stats.inactiveUsers || 0}
            </div>
            <div style={{ fontSize: '0.9em', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Inactive Users
            </div>
          </div>
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '25px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '2.5em', marginBottom: '5px', fontWeight: 'bold' }}>
              {stats.adminCount || 0}
            </div>
            <div style={{ fontSize: '0.9em', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Admins
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
        <div className="card-content">
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.1em', fontWeight: '600', color: '#374151' }}>🔍 Filter Users</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: '500', marginBottom: '8px', display: 'block', color: '#374151' }}>
                🔎 Search
              </label>
              <input
                type="text"
                name="search"
                className="form-input"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={handleFilterChange}
                style={{ 
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95em',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: '500', marginBottom: '8px', display: 'block', color: '#374151' }}>
                👤 Role Filter
              </label>
              <select
                name="role"
                className="form-input"
                value={filters.role}
                onChange={handleFilterChange}
                style={{ 
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95em',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: '500', marginBottom: '8px', display: 'block', color: '#374151' }}>
                ⚡ Status Filter
              </label>
              <select
                name="isActive"
                className="form-input"
                value={filters.isActive}
                onChange={handleFilterChange}
                style={{ 
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95em',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Status</option>
                <option value="true">✓ Active</option>
                <option value="false">✗ Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
        <div className="card-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ 
                display: 'inline-block',
                width: '50px',
                height: '50px',
                border: '4px solid #f3f4f6',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '15px'
              }}></div>
              <p style={{ color: '#6b7280', fontSize: '1.1em' }}>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '4em', marginBottom: '15px' }}>📭</div>
              <h3 style={{ color: '#374151', marginBottom: '8px' }}>No users found</h3>
              <p style={{ color: '#6b7280' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ 
                      background: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
                      borderBottom: '2px solid #e5e7eb'
                    }}>
                      <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        👤 Name
                      </th>
                      <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        📧 Email
                      </th>
                      <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        🎭 Role
                      </th>
                      <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        ⚡ Status
                      </th>
                      <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        📅 Created
                      </th>
                      <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        ⚙️ Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr 
                        key={user._id} 
                        style={{ 
                          borderBottom: '1px solid #e5e7eb',
                          background: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f9fafb'}
                      >
                        <td style={{ padding: '16px 12px', fontWeight: '500', color: '#1f2937' }}>
                          {user.name}
                        </td>
                        <td style={{ padding: '16px 12px', color: '#6b7280' }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <select
                            className="form-input"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            style={{ 
                              padding: '8px 12px',
                              fontSize: '0.9em',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              cursor: 'pointer',
                              fontWeight: '500',
                              background: user.role === 'super_admin' ? '#fef2f2' : user.role === 'admin' ? '#fffbeb' : '#f0f9ff'
                            }}
                          >
                            <option value="user">👤 User</option>
                            <option value="admin">🛡️ Admin</option>
                            <option value="super_admin">⭐ Super Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <span
                            style={{ 
                              padding: '6px 14px',
                              fontSize: '0.85em',
                              borderRadius: '20px',
                              fontWeight: '600',
                              display: 'inline-block',
                              background: user.isActive ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #bbb 0%, #999 100%)',
                              color: 'white'
                            }}
                          >
                            {user.isActive ? '✓ Active' : '✗ Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', fontSize: '0.9em', color: '#6b7280' }}>
                          {formatDate(user.createdAt)}
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <button
                            className={`btn ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleToggleActivation(user._id)}
                            style={{ 
                              padding: '8px 18px',
                              fontSize: '0.85em',
                              borderRadius: '8px',
                              fontWeight: '600',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            {user.isActive ? '🚫 Deactivate' : '✓ Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginTop: '30px', 
                  padding: '20px 0',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    style={{ 
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      opacity: !pagination.hasPrev ? 0.5 : 1,
                      cursor: !pagination.hasPrev ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ← Previous
                  </button>
                  <div style={{ 
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '0.95em'
                  }}>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    style={{ 
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      opacity: !pagination.hasNext ? 0.5 : 1,
                      cursor: !pagination.hasNext ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}

              <div style={{ 
                textAlign: 'center', 
                marginTop: '15px', 
                color: '#6b7280', 
                fontSize: '0.9em',
                fontWeight: '500'
              }}>
                📊 Showing <span style={{ color: '#3b82f6', fontWeight: '600' }}>{users.length}</span> of <span style={{ color: '#3b82f6', fontWeight: '600' }}>{pagination.totalUsers}</span> total users
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;