import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Compass, 
  TrendingUp, 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  User, 
  Menu,
  X,
  LogOut
} from 'lucide-react';
import './Layout.css';

const Layout = ({ currentView, setCurrentView, children }) => {
  const { user, theme, toggleTheme, logout } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interview', label: 'Mock Interview', icon: MessageSquare },
    { id: 'learning', label: 'Learning Path', icon: Compass },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar - Desktop */}
      <aside className={`sidebar glass-panel ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-wrapper">
            <span className="logo-icon">✨</span>
            <h2 className="logo-text gradient-text">SmartAI Prep</h2>
          </div>
          <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileOpen(false);
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge-wrapper">
            <div className="user-badge">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  <User size={18} />
                </div>
              )}
              <div className="user-info-text">
                <h4>{user?.name || 'Loading...'}</h4>
                <p>{user?.targetRole || 'Software Candidate'}</p>
              </div>
            </div>
            
            <button className="logout-btn" onClick={logout} title="Log Out from Session">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <header className="header-bar glass-panel">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="header-title-section">
              <h1 className="header-title">
                {menuItems.find(m => m.id === currentView)?.label}
              </h1>
              <p className="header-subtitle">
                {currentView === 'dashboard' && 'Welcome back! Ready to prepare?'}
                {currentView === 'interview' && 'Practice and refine your technical responses.'}
                {currentView === 'learning' && 'Track progress on your career preparation roadmap.'}
                {currentView === 'analytics' && 'Detailed breakdown of mock interview historical results.'}
                {currentView === 'settings' && 'Update profile settings and Gemini API key details.'}
              </p>
            </div>
          </div>

          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="content-container">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
