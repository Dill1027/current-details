import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import { hasPermissions } from '../utils/permissions';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  
  const canCreate = hasPermissions(user?.role, ['create']);
  const canUpdate = hasPermissions(user?.role, ['update']);
  const canDelete = hasPermissions(user?.role, ['delete']);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = { page: 1, limit: 10, showExpired: 'false' };
      console.log('Dashboard - Fetching with params:', params);
      const response = await apiService.getItems(params);
      console.log('Dashboard - Items received:', response.data.items);
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch items');
      console.error('Fetch items error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await apiService.deleteItem(itemId);
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
      console.error('Delete item error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const formatRole = (role) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="dashboard-container">
      {/* Navigation Header */}
      <div className="dashboard-header" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px 0',
        marginBottom: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center" style={{ flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
            <h1 className="dashboard-title" style={{ color: 'white', fontSize: 'clamp(1.3em, 5vw, 1.8em)', margin: 0 }}>🎯 Continue Offers</h1>
            <div className="d-flex align-items-center gap-3" style={{ flexWrap: 'wrap', gap: '10px' }}>
              <span className="welcome-text" style={{ color: 'white', fontSize: 'clamp(0.9em, 2.5vw, 1.05em)' }}>
                👋 Welcome, <strong>{user?.name}</strong>
              </span>
              <span style={{ 
                padding: '6px 14px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: '600',
                fontSize: 'clamp(0.8em, 2vw, 0.9em)',
                whiteSpace: 'nowrap'
              }}>
                {formatRole(user?.role || 'user')}
              </span>
              <button 
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  fontSize: 'clamp(0.85em, 2vw, 1em)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Quick Action Buttons in Header */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '15px',
            paddingTop: '20px'
          }}>
            <Link to="/items" style={{ 
              textDecoration: 'none',
              padding: '20px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#667eea',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}>
              <div style={{ fontSize: '2em' }}>✅</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1em', fontWeight: '700' }}>Active Items</h4>
                <p style={{ margin: 0, fontSize: '0.85em', opacity: 0.7 }}>View active offers</p>
              </div>
            </Link>

            <Link to="/items/expired" style={{ 
              textDecoration: 'none',
              padding: '20px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#ef4444',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}>
              <div style={{ fontSize: '2em' }}>🚫</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1em', fontWeight: '700' }}>No Offer</h4>
                <p style={{ margin: 0, fontSize: '0.85em', opacity: 0.7 }}>View expired items</p>
              </div>
            </Link>

            {canCreate && (
              <Link to="/items/create" style={{ 
                textDecoration: 'none',
                padding: '20px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#11998e',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}>
                <div style={{ fontSize: '2em' }}>➕</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1em', fontWeight: '700' }}>Create Package</h4>
                  <p style={{ margin: 0, fontSize: '0.85em', opacity: 0.7 }}>Add promotional offer</p>
                </div>
              </Link>
            )}

            {user?.role === 'super_admin' && (
              <Link to="/users" style={{ 
                textDecoration: 'none',
                padding: '20px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#f093fb',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}>
                <div style={{ fontSize: '2em' }}>👥</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1em', fontWeight: '700' }}>Manage Users</h4>
                  <p style={{ margin: 0, fontSize: '0.85em', opacity: 0.7 }}>View user accounts</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="dashboard-content">

          {/* All Packages */}
          <div className="card animate-fade-in" style={{ 
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: 'none',
            background: 'white',
            overflow: 'hidden'
          }}>
            <div className="card-header" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '25px 30px',
              borderBottom: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <h3 className="card-title" style={{ color: 'white', margin: 0, fontSize: '1.5em', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>📋 All Packages</h3>
              {pagination.totalItems > 0 && (
                <span style={{ 
                  color: 'white', 
                  background: 'rgba(255, 255, 255, 0.25)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.9em',
                  fontWeight: '600',
                  backdropFilter: 'blur(10px)'
                }}>
                  {pagination.totalItems} packages
                </span>
              )}
            </div>
            <div className="card-content" style={{ padding: '30px' }}>
              {loading ? (
                <div className="animate-fade-in" style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderRadius: '16px'
                }}>
                  <div className="loading-spinner" style={{
                    width: '60px',
                    height: '60px',
                    margin: '0 auto 20px',
                    border: '5px solid #e2e8f0',
                    borderTop: '5px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ 
                    color: '#64748b',
                    fontSize: '1.1em',
                    fontWeight: '600'
                  }}>Loading packages...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="animate-fade-in" style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px', 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderRadius: '16px'
                }}>
                  <div style={{ 
                    fontSize: '5em', 
                    marginBottom: '20px',
                    animation: 'bounce 2s infinite'
                  }}>📦</div>
                  <h4 style={{ 
                    marginBottom: '12px',
                    fontSize: '1.5em',
                    color: '#334155',
                    fontWeight: '700'
                  }}>No packages found</h4>
                  <p style={{ 
                    color: '#64748b',
                    fontSize: '1.1em',
                    marginBottom: '30px'
                  }}>Get started by creating your first promotional offer!</p>
                  {canCreate && (
                    <Link to="/items/create" className="btn-primary" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 28px',
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '1.05em',
                      boxShadow: '0 8px 20px rgba(17, 153, 142, 0.4)',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(17, 153, 142, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(17, 153, 142, 0.4)';
                    }}>
                      ➕ Create First Package
                    </Link>
                  )}
                </div>
              ) : (
                <div className="items-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                  gap: '20px'
                }}>
                  {items.map((item, index) => (
                    <div key={item._id} className="item-card animate-scale-in" style={{
                      border: 'none',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      cursor: 'pointer',
                      touchAction: 'manipulation',
                      background: 'white',
                      animationDelay: `${index * 0.1}s`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                    }}>
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.note}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedImage(item.imageUrl);
                            }}
                            style={{
                              width: '100%',
                              height: '220px',
                              objectFit: 'contain',
                              backgroundColor: '#f9fafb',
                              transition: 'transform 0.4s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            onError={(e) => {
                              console.error('Image load error:', item.imageUrl);
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8em',
                          fontWeight: '600',
                          color: '#667eea',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}>
                          New
                        </div>
                      </div>
                      <div style={{
                        display: 'none',
                        width: '100%',
                        height: '200px',
                        backgroundColor: '#f3f4f6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                        fontSize: '3em'
                      }}>
                        🖼️
                      </div>
                      <div style={{ padding: '24px' }}>
                        <p style={{ 
                          color: '#1f2937', 
                          marginBottom: '16px',
                          fontSize: '1em',
                          lineHeight: '1.6',
                          fontWeight: '500',
                          minHeight: '48px'
                        }}>
                          {item.note}
                        </p>
                        <div style={{ 
                          fontSize: '0.875em',
                          color: '#6b7280',
                          marginBottom: '16px',
                          padding: '16px 0 0 0',
                          borderTop: '2px solid #f3f4f6'
                        }}>
                          <div style={{ 
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{ fontSize: '1.2em' }}>📅</span>
                            <span>{new Date(item.dateRange.start).toLocaleDateString()} - {new Date(item.dateRange.end).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {canUpdate && (
                            <Link
                              to={`/items/edit/${item._id}`}
                              style={{
                                flex: 1,
                                padding: '12px 20px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                textAlign: 'center',
                                fontSize: '0.95em',
                                fontWeight: '700',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                              }}
                            >
                              ✏️ Edit
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item._id)}
                              style={{
                                flex: 1,
                                padding: '12px 20px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '0.95em',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.5)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                              }}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Pagination could go here */}
            {pagination.totalPages > 1 && (
              <div style={{
                padding: '20px 30px',
                borderTop: '2px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <button
                  disabled={pagination.currentPage === 1}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: pagination.currentPage === 1 ? '#e2e8f0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  Previous
                </button>
                <span style={{
                  padding: '10px 20px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  fontWeight: '600',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: pagination.currentPage === pagination.totalPages ? '#e2e8f0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            cursor: 'pointer',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 10000,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'white';
            }}
          >
            ✕
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              cursor: 'default'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;