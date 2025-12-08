import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../services/api';
import { toast } from 'react-toastify';

const ItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    note: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getItem(id);
      const item = response.data.item;
      
      setFormData({
        startDate: new Date(item.dateRange.start).toISOString().split('T')[0],
        endDate: new Date(item.dateRange.end).toISOString().split('T')[0],
        note: item.note,
        image: null
      });
      setCurrentImage(item.imageUrl);
    } catch (error) {
      toast.error('Failed to fetch item');
      navigate('/items');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEditing) {
      fetchItem();
    }
  }, [isEditing, fetchItem]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      const file = files[0];
      if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
          e.target.value = '';
          return;
        }
        
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          toast.error('Image size must be less than 5MB');
          e.target.value = '';
          return;
        }
        
        setFormData({ ...formData, image: file });
        toast.success('Image selected successfully');
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    if (!formData.startDate) {
      toast.error('Start date is required');
      return false;
    }

    if (!formData.endDate) {
      toast.error('End date is required');
      return false;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return false;
    }

    if (!formData.note.trim()) {
      toast.error('Note/description is required');
      return false;
    }

    if (formData.note.trim().length < 3) {
      toast.error('Note must be at least 3 characters long');
      return false;
    }

    if (!isEditing && !formData.image) {
      toast.error('Image is required when creating a new item');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('startDate', formData.startDate);
      submitData.append('endDate', formData.endDate);
      submitData.append('note', formData.note);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (isEditing) {
        await apiService.updateItem(id, submitData);
        toast.success('✅ Item updated successfully');
      } else {
        await apiService.createItem(submitData);
        toast.success('✅ Item created successfully');
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Handle specific error messages
      if (error.response) {
        const errorMsg = error.response.data?.message || error.response.data?.error;
        if (errorMsg) {
          toast.error(`❌ ${errorMsg}`);
        } else if (error.response.status === 413) {
          toast.error('❌ Image file is too large. Please upload a smaller image.');
        } else if (error.response.status === 400) {
          toast.error('❌ Invalid form data. Please check all fields.');
        } else {
          toast.error(`❌ Failed to ${isEditing ? 'update' : 'create'} item`);
        }
      } else if (error.request) {
        toast.error('❌ Network error. Please check your connection.');
      } else {
        toast.error(error.message || `❌ Failed to ${isEditing ? 'update' : 'create'} item`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading item...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <Link to="/items" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          color: '#11998e',
          fontWeight: '600',
          marginBottom: '20px',
          padding: '8px 16px',
          borderRadius: '8px',
          transition: 'all 0.2s',
          background: '#f0fdf4'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#dcfce7';
          e.currentTarget.style.transform = 'translateX(-5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f0fdf4';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
        >
          ← Back to Items
        </Link>
        <h1 className="page-title" style={{ fontSize: '2em', marginBottom: '8px' }}>
          {isEditing ? '✏️ Edit Item' : '➕ Create New Item'}
        </h1>
        <p className="page-subtitle" style={{ color: '#6b7280' }}>
          {isEditing ? 'Update item details' : 'Add a new item to the system'}
        </p>
      </div>

      <div className="card" style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: 'none'
      }}>
        <div className="card-content" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="startDate" className="form-label" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95em'
              }}>
                📅 Start Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-input"
                value={formData.startDate}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1em',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="endDate" className="form-label" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95em'
              }}>
                📅 End Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-input"
                value={formData.endDate}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1em',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="note" className="form-label" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95em'
              }}>
                📝 Note <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="note"
                name="note"
                className="form-textarea"
                value={formData.note}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter item description or note..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1em',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="image" className="form-label">
                Image {!isEditing && <span style={{ color: '#ef4444' }}>*</span>}
                {isEditing && <span style={{ color: '#6b7280', fontSize: '0.9em' }}> (leave empty to keep current image)</span>}
              </label>
              <input
                type="file"
                id="image"
                name="image"
                className="form-input"
                onChange={handleChange}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                disabled={loading}
                {...(!isEditing && { required: true })}
              />
              <p style={{ fontSize: '0.85em', color: '#6b7280', marginTop: '8px' }}>
                📸 Supported formats: JPEG, PNG, GIF, WebP | Max size: 5MB
              </p>
              {formData.image && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '10px', 
                  background: '#f0fdf4', 
                  borderRadius: '8px',
                  color: '#22c55e',
                  fontSize: '0.9em'
                }}>
                  ✅ Selected: {formData.image.name} ({(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
              {currentImage && (
                <div className="mt-2">
                  <p className="form-help" style={{ fontWeight: '600', marginBottom: '8px' }}>Current image:</p>
                  <img
                    src={currentImage}
                    alt="Current item"
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '200px', 
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading 
                  ? `${isEditing ? 'Updating' : 'Creating'}...` 
                  : `${isEditing ? 'Update' : 'Create'} Item`
                }
              </button>
              <Link to="/items" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;