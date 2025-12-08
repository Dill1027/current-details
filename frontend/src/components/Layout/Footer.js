import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="animate-fade-in" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: 'clamp(25px, 5vw, 40px) 0',
      marginTop: 'clamp(40px, 8vw, 60px)',
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 clamp(15px, 4vw, 25px)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: 'clamp(25px, 5vw, 35px)',
          marginBottom: 'clamp(20px, 4vw, 30px)'
        }}>
          {/* About Section */}
          <div>
            <h4 style={{ 
              fontSize: 'clamp(1.1em, 3vw, 1.3em)', 
              marginBottom: '15px',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              🎯 Continue Offers
            </h4>
            <p style={{ 
              opacity: 0.95,
              lineHeight: '1.7',
              fontSize: 'clamp(0.85em, 2.5vw, 0.95em)'
            }}>
              A comprehensive promotional offers management system for managing offers, users, and permissions efficiently.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ 
              fontSize: 'clamp(1.1em, 3vw, 1.3em)', 
              marginBottom: '15px',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              🔗 Quick Links
            </h4>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <li>
                <a href="/dashboard" style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  opacity: 0.95,
                  transition: 'all 0.3s',
                  fontSize: 'clamp(0.9em, 2.5vw, 1em)',
                  padding: '4px 0',
                  fontWeight: '500',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.textShadow = 'none';
                }}
                >
                  → Dashboard
                </a>
              </li>
              <li>
                <a href="/items" style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  opacity: 0.95,
                  transition: 'all 0.3s',
                  fontSize: 'clamp(0.9em, 2.5vw, 1em)',
                  padding: '4px 0',
                  fontWeight: '500',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.textShadow = 'none';
                }}
                >
                  → Packages
                </a>
              </li>
              <li>
                <a href="/users" style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  opacity: 0.95,
                  transition: 'all 0.3s',
                  fontSize: 'clamp(0.9em, 2.5vw, 1em)',
                  padding: '4px 0',
                  fontWeight: '500',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.textShadow = 'none';
                }}
                >
                  → User Management
                </a>
              </li>
            </ul>
          </div>

          {/* Contact/Info */}
          <div>
            <h4 style={{ 
              fontSize: 'clamp(1.1em, 3vw, 1.3em)', 
              marginBottom: '15px',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              📞 Support
            </h4>
            <p style={{ 
              opacity: 0.95,
              lineHeight: '1.7',
              fontSize: 'clamp(0.85em, 2.5vw, 0.95em)'
            }}>
              Need help? Contact your system administrator for assistance with access and permissions.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '2px solid rgba(255, 255, 255, 0.25)',
          paddingTop: 'clamp(15px, 3vw, 25px)',
          marginTop: 'clamp(15px, 3vw, 25px)',
          textAlign: 'center',
          fontSize: 'clamp(0.8em, 2vw, 0.9em)',
          opacity: 0.95
        }}>
          <p style={{ 
            margin: 0,
            fontWeight: '500',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            lineHeight: '1.6'
          }}>
            © {currentYear} Continue Offers. All rights reserved.<br className="mobile-break" />
            <span style={{ display: 'inline-block', marginTop: '5px' }}>Built with ❤️ for promotional offers management</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
