import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    if (!role) return '';
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="animate-slide-in" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      padding: 'clamp(10px, 2vw, 15px) 0',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 clamp(12px, 3vw, 20px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap',
        position: 'relative'
      }}>
        {/* Logo/Brand */}
        <Link to="/dashboard" style={{ 
          textDecoration: 'none',
          color: 'white',
          fontSize: 'clamp(1.1em, 4vw, 1.5em)',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <span>🎯</span>
          <span style={{ whiteSpace: 'nowrap' }}>Continue Offers</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          style={{
            display: 'none',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            fontSize: '1.4em',
            padding: '10px 14px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            minWidth: '48px',
            minHeight: '48px',
            touchAction: 'manipulation'
          }}
          className="mobile-menu-toggle"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation */}
        <nav style={{ 
          display: 'flex', 
          gap: '15px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
        className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}
        >
          <Link to="/dashboard" style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
            fontSize: 'clamp(0.85em, 2vw, 1em)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          onClick={() => setMobileMenuOpen(false)}
          >
            🏠 Dashboard
          </Link>

          <Link to="/items" style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: '600',
            padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
            borderRadius: '10px',
            transition: 'all 0.3s',
            whiteSpace: 'nowrap',
            fontSize: 'clamp(0.85em, 2vw, 0.95em)',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'manipulation'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={() => setMobileMenuOpen(false)}
          >
            📋 Packages
          </Link>

          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Link to="/items/create" style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
              borderRadius: '10px',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
              fontSize: 'clamp(0.85em, 2vw, 0.95em)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'manipulation'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setMobileMenuOpen(false)}
            >
              ➕ Create
            </Link>
          )}

          {user?.role === 'super_admin' && (
            <Link to="/users" style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
              borderRadius: '10px',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
              fontSize: 'clamp(0.85em, 2vw, 0.95em)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'manipulation'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setMobileMenuOpen(false)}
            >
              👥 Users
            </Link>
          )}
        </nav>

        {/* User Info & Logout */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          flexShrink: 0
        }}
        className="user-actions"
        >
          <div style={{ 
            textAlign: 'right',
            color: 'white',
            display: 'none',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '8px 12px',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)'
          }}
          className="user-info-desktop"
          >
            <div style={{ fontWeight: '700', fontSize: '0.9em', marginBottom: '2px' }}>
              {user?.name}
            </div>
            <div style={{ 
              fontSize: '0.75em',
              padding: '2px 8px',
              background: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '10px',
              display: 'inline-block',
              fontWeight: '600'
            }}>
              {formatRole(user?.role)}
            </div>
          </div>

          <button 
            onClick={handleLogout}
            aria-label="Logout"
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: 'clamp(8px, 2vw, 10px) clamp(14px, 3vw, 20px)',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: 'clamp(0.85em, 2vw, 0.95em)',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              touchAction: 'manipulation'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
