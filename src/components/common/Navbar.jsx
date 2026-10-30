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
  User
} from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentRole, currentUser, logout, isAdmin, isResponder, supabaseSession } = useAuth();
  const { criticalAlerts, pendingIncidents } = useEmergencyData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav-backdrop" 
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <header className={`main-navbar-wrapper ${isScrolled ? 'is-scrolled' : ''}`} role="banner">
        <div className={`main-navbar ${isScrolled ? 'is-scrolled' : ''}`}>
          <div className="navbar-inner">
            {/* Brand Logo */}
            <Link to="/" className="navbar-brand" onClick={closeMenu}>
              <div className="brand-icon-wrapper" aria-hidden="true">
                <AlertTriangle size={18} strokeWidth={2.4} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.15rem' }}>ResQ</span>
                <span className="brand-subtitle">Disaster Hub</span>
              </div>
            </Link>

            {/* Desktop Horizontal Navigation Links */}
            <nav className="nav-links desktop-only" aria-label="Main Navigation">
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                <Home size={15} strokeWidth={1.75} />
                <span>Home</span>
              </NavLink>

              <NavLink 
                to="/map" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <MapPin size={15} strokeWidth={1.75} />
                <span>Live Map</span>
              </NavLink>

              <NavLink 
                to="/alerts" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
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
              >
                <Building2 size={15} strokeWidth={1.75} />
                <span>Shelters</span>
              </NavLink>

              <NavLink 
                to="/my-reports" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <FileText size={15} strokeWidth={1.75} />
                <span>My Reports</span>
              </NavLink>

              {isAdmin && (
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
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
                  style={{ color: '#6EE7B7' }}
                >
                  <Radio size={15} strokeWidth={1.75} />
                  <span>Responder CAD</span>
                </NavLink>
              )}
            </nav>

            {/* Action CTAs */}
            <div className="nav-actions">
              {/* Emergency Red CTA Pill - Always Accessible */}
              <Link 
                to="/report" 
                className="btn btn-emergency btn-sm nav-report-btn" 
                onClick={closeMenu}
                style={{ borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <AlertTriangle size={15} strokeWidth={2.2} />
                <span className="nav-report-text-full">Report Emergency</span>
                <span className="nav-report-text-short">Report</span>
              </Link>

              {/* Desktop User profile & Sign In */}
              <div className="nav-user-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span className="role-tag" title={`Logged in as ${currentUser?.name || currentRole}`}>
                  {currentRole}
                </span>

                {supabaseSession ? (
                  <button 
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-ghost btn-xs"
                    style={{ color: '#E2E8F0', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Log Out of Session"
                  >
                    <LogOut size={13} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Log Out</span>
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    className="btn btn-ghost btn-xs" 
                    style={{ color: '#E2E8F0', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Sign In with Mobile Number"
                  >
                    <LogIn size={14} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Sign In</span>
                  </Link>
                )}
              </div>

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                className="mobile-nav-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* ===================================================================
              MOBILE MENU DRAWER (Revealed on hamburger toggle)
              =================================================================== */}
          {mobileMenuOpen && (
            <div className="mobile-menu-drawer" role="dialog" aria-label="Mobile Navigation Menu">
              {/* User Profile Info Card inside Drawer */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.85rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div 
                    style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}
                  >
                    {currentUser?.avatarInitials || 'CU'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                      {currentUser?.name || 'Citizen User'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                      {currentUser?.phone || 'Mobile Emergency Network'}
                    </div>
                  </div>
                </div>

                <span className="role-tag" style={{ margin: 0 }}>
                  {currentRole}
                </span>
              </div>

              {/* Mobile Navigation Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                  end
                  style={{ padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                >
                  <Home size={18} strokeWidth={1.75} />
                  <span>Home</span>
                </NavLink>

                <NavLink 
                  to="/map" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                  style={{ padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                >
                  <MapPin size={18} strokeWidth={1.75} />
                  <span>Live Map</span>
                </NavLink>

                <NavLink 
                  to="/alerts" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                  style={{ padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                >
                  <Bell size={18} strokeWidth={1.75} />
                  <span style={{ flex: 1 }}>Official Alerts</span>
                  {criticalAlerts.length > 0 && (
                    <span className="sidebar-badge danger" style={{ padding: '0.15rem 0.55rem' }}>
                      {criticalAlerts.length}
                    </span>
                  )}
                </NavLink>

                <NavLink 
                  to="/shelters" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                  style={{ padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                >
                  <Building2 size={18} strokeWidth={1.75} />
                  <span>Shelters &amp; Facilities</span>
                </NavLink>

                <NavLink 
                  to="/my-reports" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                  style={{ padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                >
                  <FileText size={18} strokeWidth={1.75} />
                  <span>My Reports</span>
                </NavLink>

                {isAdmin && (
                  <NavLink 
                    to="/admin" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeMenu}
                    style={{ padding: '0.65rem 0.85rem', fontSize: '0.9rem', color: '#93C5FD' }}
                  >
                    <Shield size={18} strokeWidth={1.75} />
                    <span style={{ flex: 1 }}>Admin Command Center</span>
                    {pendingIncidents.length > 0 && (
                      <span className="sidebar-badge danger" style={{ padding: '0.15rem 0.55rem' }}>
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
                    style={{ padding: '0.65rem 0.85rem', fontSize: '0.9rem', color: '#6EE7B7' }}
                  >
                    <Radio size={18} strokeWidth={1.75} />
                    <span>Responder MDT Terminal</span>
                  </NavLink>
                )}
              </div>

              {/* Drawer Bottom Actions */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link 
                  to="/report" 
                  className="btn btn-emergency" 
                  onClick={closeMenu}
                  style={{ borderRadius: 'var(--radius-pill)', padding: '0.7rem', width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
                >
                  <AlertTriangle size={17} strokeWidth={2.4} />
                  <span>Report Emergency Now</span>
                </Link>

                {supabaseSession ? (
                  <button 
                    type="button" 
                    onClick={handleLogout}
                    className="btn btn-outline"
                    style={{ color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 'var(--radius-pill)', padding: '0.6rem', width: '100%', justifyContent: 'center' }}
                  >
                    <LogOut size={15} />
                    <span>Log Out of Session</span>
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    className="btn btn-primary" 
                    onClick={closeMenu}
                    style={{ borderRadius: 'var(--radius-pill)', padding: '0.6rem', width: '100%', justifyContent: 'center' }}
                  >
                    <LogIn size={15} />
                    <span>Sign In with Mobile</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
