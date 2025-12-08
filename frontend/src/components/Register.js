import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();

  // Password validation checks
  const passwordChecks = {
    minLength: formData.password.length >= 6,
    hasLowercase: /[a-z]/.test(formData.password),
    hasUppercase: /[A-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password)
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    // Validate password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      toast.error('Password must contain at least one lowercase letter, one uppercase letter, and one number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Registration successful! You can now log in.');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      padding: '20px'
    }}>
      <div className="register-card card" style={{
        maxWidth: '500px',
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
          <div style={{ fontSize: '3em', marginBottom: '15px' }}>🎉</div>
          <h2 className="card-title" style={{ fontSize: '2em', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>Create Account</h2>
          <p className="page-subtitle" style={{ color: '#6b7280', fontSize: '1em' }}>Join Continue Offers today</p>
        </div>
        
        <div className="card-content" style={{ padding: '30px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                👤 Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Enter your full name"
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1em'
                }}
              />
            </div>

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
                  fontSize: '1em'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                🔐 Password
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
                minLength="6"
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1em'
                }}
              />
              <div className="form-help">
                <strong>Password Requirements:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '0.85em', listStyle: 'none' }}>
                  <li style={{ color: passwordChecks.minLength ? '#22c55e' : '#ef4444' }}>
                    <span style={{ marginRight: '5px' }}>{passwordChecks.minLength ? '✓' : '✗'}</span>
                    At least 6 characters long
                  </li>
                  <li style={{ color: passwordChecks.hasLowercase ? '#22c55e' : '#ef4444' }}>
                    <span style={{ marginRight: '5px' }}>{passwordChecks.hasLowercase ? '✓' : '✗'}</span>
                    At least one lowercase letter (a-z)
                  </li>
                  <li style={{ color: passwordChecks.hasUppercase ? '#22c55e' : '#ef4444' }}>
                    <span style={{ marginRight: '5px' }}>{passwordChecks.hasUppercase ? '✓' : '✗'}</span>
                    At least one uppercase letter (A-Z)
                  </li>
                  <li style={{ color: passwordChecks.hasNumber ? '#22c55e' : '#ef4444' }}>
                    <span style={{ marginRight: '5px' }}>{passwordChecks.hasNumber ? '✓' : '✗'}</span>
                    At least one number (0-9)
                  </li>
                </ul>
                <em style={{ fontSize: '0.85em', color: '#6b7280' }}>Example: Password1, Test123</em>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label" style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                ✅ Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Confirm your password"
                minLength="6"
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1em'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '1.1em',
                fontWeight: '600',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(17, 153, 142, 0.4)'
              }}
            >
              {isLoading ? '⏳ Creating Account...' : '🚀 Create Account'}
            </button>
          </form>

          <div className="register-footer" style={{ marginTop: '25px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>
              Already have an account?{' '}
              <Link to="/login" className="register-link" style={{ color: '#11998e', fontWeight: '600', textDecoration: 'none' }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;