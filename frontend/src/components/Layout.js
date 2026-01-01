import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './Layout.css';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/schedule', label: 'Schedule', icon: '📅' },
    { path: '/register', label: 'Register', icon: '👤' },
    { path: '/reports', label: 'Reports', icon: '📊' }
  ];

  if (isMobile) {
    return (
      <div className="mobile-layout">
        {/* Mobile Header */}
        <header className="mobile-header">
          <h1 className="app-title">Duty Manager</h1>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <main className="mobile-main">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="desktop-layout">
      {/* Top Navigation */}
      <header className="top-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <h1 className="app-title">Employee Duty Management</h1>
          </div>
          <nav className="nav-menu">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="desktop-main">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;