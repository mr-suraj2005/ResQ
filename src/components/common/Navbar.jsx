import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { 
  AlertTriangle, 
  MapPin, 
  Bell, 
  Home, 
  Building2, 
  FileText, 
  Shield, 
  Radio, 
  Menu, 
  X, 
  LogOut, 
  LogIn, 
  PlusCircle 
} from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentRole, currentUser, logout, isAdmin, isResponder } = useAuth();
  const { criticalAlerts, pendingIncidents } = useEmergencyData();
  const navigate = useNavigate();

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="main-navbar" role="banner">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon-wrapper" aria-hidden="true">
            <AlertTriangle size={18} strokeWidth={2.2} />
          </div>
          <div>
            <span style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>ResQ</span>
            <span className="brand-subtitle">Disaster Hub</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav 
          className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} 
          aria-label="Main Navigation"
        >
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
            end
          >
            <Home size={16} strokeWidth={1.75} />
            <span>Home</span>
          </NavLink>

          <NavLink 
            to="/map" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <MapPin size={16} strokeWidth={1.75} />
            <span>Live Map</span>
          </NavLink>

          <NavLink 
            to="/alerts" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <Bell size={16} strokeWidth={1.75} />
            <span>Alerts</span>
            {criticalAlerts.length > 0 && (
              <span className="sidebar-badge danger" style={{ marginLeft: '0.2rem' }}>
                {criticalAlerts.length}
              </span>
            )}
          </NavLink>

          <NavLink 
            to="/shelters" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <Building2 size={16} strokeWidth={1.75} />
            <span>Shelters</span>
          </NavLink>

          <NavLink 
            to="/my-reports" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <FileText size={16} strokeWidth={1.75} />
            <span>My Reports</span>
          </NavLink>

          {/* Role specific portals shortcuts */}
          {isAdmin && (
            <NavLink 
              to="/admin" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
              style={{ color: '#93C5FD' }}
            >
              <Shield size={16} strokeWidth={1.75} />
              <span>Admin Portal</span>
              {pendingIncidents.length > 0 && (
                <span className="sidebar-badge danger" style={{ marginLeft: '0.2rem' }}>
                  {pendingIncidents.length}
                </span>
              )}
            </NavLink>
          )}

          {isResponder && (
            <NavLink 
              to="/responder" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
              style={{ color: '#6EE7B7' }}
            >
              <Radio size={16} strokeWidth={1.75} />
              <span>Responder Portal</span>
            </NavLink>
          )}
        </nav>

        {/* Action CTAs */}
        <div className="nav-actions">
          {/* Strictly Reserved Emergency Red CTA */}
          <Link to="/report" className="btn btn-emergency btn-sm" onClick={closeMenu}>
            <AlertTriangle size={15} strokeWidth={2} />
            <span>Report Emergency</span>
          </Link>

          {/* User profile / Role pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="role-tag" title={`Logged in as ${currentUser.name}`}>
              {currentRole}
            </span>

            <Link 
              to="/login" 
              className="btn btn-ghost btn-xs" 
              style={{ color: '#CBD5E1', padding: '0.35rem 0.5rem' }}
              title="Switch Account / Login"
            >
              <LogIn size={14} />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

