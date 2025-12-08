import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div className="login-card card" style={{
        maxWidth: '450px',
        width: '100%',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: 'none',
        overflow: 'hidden'
      }}>
        <div className="card-header text-center" style={{
          background: 'white',
          padding: '40px 30px 30px'
        }}>
          <div style={{ fontSize: '3em', marginBottom: '15px' }}>🔐</div>
          <h2 className="card-title" style={{ fontSize: '2em', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>Welcome Back</h2>
          <p className="page-subtitle" style={{ color: '#6b7280', fontSize: '1em' }}>Sign in to access Continue Offers</p>
        </div>
        
        <div className="card-content" style={{ padding: '30px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                📧 Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Enter your email"
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1em',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                🔑 Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Enter your password"
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1em',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '1.1em',
                fontWeight: '600',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              {isLoading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          <div className="login-footer" style={{ marginTop: '25px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>
              Don't have an account?{' '}
              <Link to="/register" className="login-link" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;