import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <h5>☁️ CloudSales</h5>
        <small>{user?.storeName}</small>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/sales/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="icon">🛒</span> New Sale
        </NavLink>
        <NavLink to="/sales" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="icon">📋</span> Sales History
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="icon">📦</span> Products
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="icon">📈</span> Reports
        </NavLink>
        {user?.role === 'owner' && (
          <NavLink to="/staff" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">👥</span> Staff
          </NavLink>
        )}
        {user?.role === 'owner' && (
          <NavLink to="/salesforce" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">☁️</span> Salesforce
          </NavLink>
        )}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
        <small style={{ color: 'rgba(255,255,255,0.5)' }}>
          {user?.role === 'owner' ? '👑 Owner' : '👤 Staff'}: {user?.name}
        </small>
      </div>
    </div>
  );
};

export default Sidebar;
