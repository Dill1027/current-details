import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import { hasPermissions } from '../utils/permissions';

const ExpiredItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const { user } = useAuth();

  const canUpdate = hasPermissions(user?.role, ['update']);
  const canDelete = hasPermissions(user?.role, ['delete']);

  const fetchExpiredItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, search, limit: 10, showExpired: 'true' };
      console.log('ExpiredItems - Fetching with params:', params);
      const response = await apiService.getItems(params);
      console.log('ExpiredItems - Items received:', response.data.items);
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch expired items');
      console.error('Fetch expired items error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchExpiredItems();
  }, [fetchExpiredItems]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExpiredItems();
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this expired item?')) {
      return;
    }

    try {
      await apiService.deleteItem(itemId);
      toast.success('Item deleted successfully');
      fetchExpiredItems();
    } catch (error) {
      toast.error('Failed to delete item');
      console.error('Delete item error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading expired items...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <Link to="/dashboard" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          color: '#667eea',
          fontWeight: '600',
          marginBottom: '15px',
          padding: '10px 16px',
          borderRadius: '8px',
          transition: 'all 0.2s',
          background: '#f0f9ff',
          fontSize: 'clamp(0.9em, 2.5vw, 1em)',
          touchAction: 'manipulation'
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
        </Link>
        <div className="d-flex justify-content-between align-items-center" style={{ flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: 'clamp(1.5em, 5vw, 2em)', marginBottom: '8px' }}>
              🚫 Currently No Offer
            </h1>
            <p className="page-subtitle" style={{ color: '#6b7280', fontSize: 'clamp(0.9em, 2.5vw, 1em)' }}>
              Items with expired date ranges
            </p>
          </div>
          <Link to="/items" className="btn" style={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            fontWeight: '600',
            textDecoration: 'none',
            color: 'white',
            boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            📋 View Active Items
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-4" style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: 'none'
      }}>
        <div className="card-content" style={{ padding: '20px' }}>
          <form onSubmit={handleSearch} className="d-flex gap-2">
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search expired items by note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 20px',
                fontSize: '1em',
                borderRadius: '10px',
                border: '2px solid #e5e7eb',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ef4444'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <button type="submit" className="btn btn-primary" style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '1em',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
            }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Expired Items List */}
      <div className="card" style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: 'none',
        overflow: 'hidden'
      }}>
        <div className="card-header" style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          padding: '24px',
          borderBottom: 'none'
        }}>
          <h2 className="card-title" style={{
            color: 'white',
            margin: 0,
            fontSize: '1.5em',
            fontWeight: '600'
          }}>
            🚫 Expired Items ({pagination.totalItems || 0})
          </h2>
        </div>
        <div className="card-content">
          {items.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 20px' }}>
              <div style={{ fontSize: '4em', marginBottom: '20px' }}>🎉</div>
              <h3 style={{ color: '#10b981', marginBottom: '10px' }}>No Expired Items!</h3>
              <p style={{ color: '#6b7280' }}>All your items are currently active.</p>
              <Link to="/items" className="btn btn-primary" style={{
                marginTop: '20px',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: '600',
                textDecoration: 'none',
                color: 'white',
                display: 'inline-block'
              }}>
                View Active Items
              </Link>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table" style={{ marginBottom: 0 }}>
                  <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <tr>
                      <th style={{ padding: '16px', fontWeight: '600', color: '#374151' }}>Image</th>
                      <th style={{ padding: '16px', fontWeight: '600', color: '#374151' }}>Date Range</th>
                      <th style={{ padding: '16px', fontWeight: '600', color: '#374151' }}>Note</th>
                      <th style={{ padding: '16px', fontWeight: '600', color: '#374151' }}>Status</th>
                      <th style={{ padding: '16px', fontWeight: '600', color: '#374151' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '16px' }}>
                          <img
                            src={item.imageUrl}
                            alt="Item"
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}
                            onClick={() => setSelectedImage(item.imageUrl)}
                          />
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '0.9em' }}>
                            <div><strong>Start:</strong> {formatDate(item.dateRange.start)}</div>
                            <div style={{ color: '#ef4444', fontWeight: '500' }}>
                              <strong>End:</strong> {formatDate(item.dateRange.end)}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#6b7280', marginTop: '4px' }}>
                              ({item.durationDays} days)
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', maxWidth: '300px' }}>
                          <div style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            color: '#374151'
                          }}>
                            {item.note}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.85em',
                            fontWeight: '600',
                            background: '#fee2e2',
                            color: '#dc2626'
                          }}>
                            ⏰ Expired
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div className="btn-group" style={{ display: 'flex', gap: '8px' }}>
                            {canUpdate && (
                              <Link
                                to={`/items/edit/${item._id}`}
                                className="btn btn-sm btn-primary"
                                style={{
                                  padding: '8px 16px',
                                  background: '#3b82f6',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: 'white',
                                  textDecoration: 'none',
                                  fontSize: '0.9em',
                                  fontWeight: '500',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                              >
                                ✏️ Edit
                              </Link>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="btn btn-sm btn-danger"
                                style={{
                                  padding: '8px 16px',
                                  background: '#ef4444',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: 'white',
                                  fontSize: '0.9em',
                                  fontWeight: '500',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination" style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '24px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrev}
                    style={{
                      padding: '8px 16px',
                      background: pagination.hasPrev ? '#f3f4f6' : '#e5e7eb',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: pagination.hasPrev ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ fontWeight: '500', color: '#374151' }}>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    className="btn btn-sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNext}
                    style={{
                      padding: '8px 16px',
                      background: pagination.hasNext ? '#f3f4f6' : '#e5e7eb',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: pagination.hasNext ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ExpiredItems;
