import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import { hasPermissions } from '../utils/permissions';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const { user } = useAuth();

  const canCreate = hasPermissions(user?.role, ['create']);
  const canUpdate = hasPermissions(user?.role, ['update']);
  const canDelete = hasPermissions(user?.role, ['delete']);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, search, limit: 10, showExpired: 'false' };
      console.log('ItemList - Fetching with params:', params);
      const response = await apiService.getItems(params);
      console.log('ItemList - Items received:', response.data.items);
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch items');
      console.error('Fetch items error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading items...</p>
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
            <h1 className="page-title" style={{ fontSize: 'clamp(1.5em, 5vw, 2em)', marginBottom: '8px' }}>📋 Items</h1>
            <p className="page-subtitle" style={{ color: '#6b7280', fontSize: 'clamp(0.9em, 2.5vw, 1em)' }}>Manage your items</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/items/expired" className="btn" style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              fontWeight: '600',
              textDecoration: 'none',
              color: 'white',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🚫 Currently No Offer
            </Link>
            {canCreate && (
              <Link to="/items/create" className="btn btn-primary" style={{
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
                ➕ Create New Item
              </Link>
            )}
          </div>
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
              placeholder="🔍 Search items by note..."
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
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <button type="submit" className="btn btn-primary" style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '1em',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Packages List */}
      <div className="card" style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: 'none',
        overflow: 'hidden'
      }}>
        <div className="card-header" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          borderBottom: 'none'
        }}>
          <h2 className="card-title" style={{
            color: 'white',
            margin: 0,
            fontSize: '1.5em',
            fontWeight: '600'
          }}>
            📋 Items ({pagination.totalItems || 0})
          </h2>
        </div>
        <div className="card-content">
          {items.length === 0 ? (
            <div className="text-center">
              <p>No items found.</p>
              {canCreate && (
                <Link to="/items/create" className="btn btn-primary">
                  Create Your First Item
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Note</th>
                      <th>Date Range</th>
                      <th>Duration</th>
                      <th>Created By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id}>
                        <td>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt="Item"
                              className="item-thumbnail"
                              onClick={() => setSelectedImage(item.imageUrl)}
                              style={{ 
                                width: '80px', 
                                height: '80px', 
                                objectFit: 'contain',
                                borderRadius: '8px',
                                border: '2px solid #e5e7eb',
                                backgroundColor: '#f3f4f6',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                              onError={(e) => {
                                console.error('ItemList - Image load error:', item.imageUrl);
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%23f3f4f6"/><text x="50%" y="50%" font-size="30" text-anchor="middle" dy=".3em">🖼️</text></svg>';
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '80px',
                              height: '80px',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '2em'
                            }}>
                              🖼️
                            </div>
                          )}
                        </td>
                        <td>{item.note}</td>
                        <td>
                          {new Date(item.dateRange.start).toLocaleDateString()} - {' '}
                          {new Date(item.dateRange.end).toLocaleDateString()}
                        </td>
                        <td>{item.durationDays} days</td>
                        <td>{item.createdBy?.name || 'Unknown'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            {canUpdate && (
                              <Link
                                to={`/items/edit/${item._id}`}
                                className="btn btn-sm btn-secondary"
                              >
                                Edit
                              </Link>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="btn btn-sm btn-danger"
                              >
                                Delete
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
                <div className="d-flex justify-content-center mt-4">
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={!pagination.hasPrev}
                      className="btn btn-outline btn-sm"
                    >
                      Previous
                    </button>
                    <span className="btn btn-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={!pagination.hasNext}
                      className="btn btn-outline btn-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
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
              zIndex: 10000
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

export default ItemList;