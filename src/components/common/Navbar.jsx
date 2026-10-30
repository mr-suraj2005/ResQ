import React, { useState, useEffect } from 'react';
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
  User,
  ExternalLink
} from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentRole, currentUser, logout, isAdmin, isResponder } = useAuth();
  const { criticalAlerts, pendingIncidents } = useEmergencyData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className={`main-navbar-wrapper ${isScrolled ? 'is-scrolled' : ''}`} role="banner">
      <div className={`main-navbar ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="navbar-inner">
          {/* Brand */}
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <div className="brand-icon-wrapper" aria-hidden="true">
              <AlertTriangle size={18} strokeWidth={2.4} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.15rem' }}>ResQ</span>
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
              <Home size={15} strokeWidth={1.75} />
              <span>Home</span>
            </NavLink>

            <NavLink 
              to="/map" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <MapPin size={15} strokeWidth={1.75} />
              <span>Live Map</span>
            </NavLink>

            <NavLink 
              to="/alerts" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <Bell size={15} strokeWidth={1.75} />
              <span>Alerts</span>
              {criticalAlerts.length > 0 && (
                <span className="sidebar-badge danger" style={{ marginLeft: '0.2rem', padding: '0.1rem 0.45rem', fontSize: '0.65rem' }}>
                  {criticalAlerts.length}
                </span>
              )}
            </NavLink>

            <NavLink 
              to="/shelters" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <Building2 size={15} strokeWidth={1.75} />
              <span>Shelters</span>
            </NavLink>

            <NavLink 
              to="/my-reports" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <FileText size={15} strokeWidth={1.75} />
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
                <Shield size={15} strokeWidth={1.75} />
                <span>Admin Console</span>
                {pendingIncidents.length > 0 && (
                  <span className="sidebar-badge danger" style={{ marginLeft: '0.2rem', padding: '0.1rem 0.45rem', fontSize: '0.65rem' }}>
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
                <Radio size={15} strokeWidth={1.75} />
                <span>Responder CAD</span>
              </NavLink>
            )}
          </nav>

          {/* Action CTAs */}
          <div className="nav-actions">
            {/* Strictly Reserved Emergency Red CTA */}
            <Link 
              to="/report" 
              className="btn btn-emergency btn-sm" 
              onClick={closeMenu}
              style={{ borderRadius: 'var(--radius-pill)', padding: '0.45rem 1rem' }}
            >
              <AlertTriangle size={15} strokeWidth={2.2} />
              <span>Report Emergency</span>
            </Link>

            {/* User profile / Role pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="role-tag" title={`Logged in as ${currentUser?.name || currentRole}`}>
                {currentRole}
              </span>

              {/* Citizen Login Link */}
              <Link 
                to="/login" 
                className="btn btn-ghost btn-xs" 
                style={{ color: '#CBD5E1', padding: '0.35rem 0.55rem', borderRadius: 'var(--radius-pill)' }}
                title="Citizen Portal Login"
                onClick={closeMenu}
              >
                <User size={14} />
              </Link>

              {/* Official Command Login Link */}
              <Link 
                to="/official-login" 
                className="btn btn-ghost btn-xs" 
                style={{ color: '#93C5FD', padding: '0.35rem 0.55rem', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(147, 197, 253, 0.25)' }}
                title="Official Command & Dispatch Portal"
                onClick={closeMenu}
              >
                <Shield size={14} />
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
      </div>
    </header>
  );
};
