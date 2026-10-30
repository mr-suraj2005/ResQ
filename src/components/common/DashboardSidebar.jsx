import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Radio, 
  ArrowLeft, 
  MapPin 
} from 'lucide-react';

export const DashboardSidebar = () => {
  const { currentUser, currentRole } = useAuth();

  return (
    <aside className="dashboard-sidebar" aria-label="Field Tactical Navigation">
      <div className="sidebar-header">
        <div>
          <div className="sidebar-title">
            Tactical Unit Terminal
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>
            {currentUser?.unit || 'Field Unit Alpha'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/responder" 
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <div className="sidebar-link-content">
            <Radio size={18} strokeWidth={1.75} />
            <span>Assigned Missions</span>
          </div>
        </NavLink>

        <NavLink 
          to="/map" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <div className="sidebar-link-content">
            <MapPin size={18} strokeWidth={1.75} />
            <span>Regional Threat Map</span>
          </div>
        </NavLink>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" className="sidebar-link">
            <div className="sidebar-link-content">
              <ArrowLeft size={16} />
              <span>Public Portal</span>
            </div>
          </Link>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E' }}></div>
          <span style={{ fontWeight: 600, color: '#E2E8F0' }}>{currentUser?.name || 'Authorized Official'}</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
          {currentUser?.badgeNumber ? `Badge: ${currentUser.badgeNumber}` : `Role: ${currentRole || 'RESPONDER'}`}
        </div>
      </div>
    </aside>
  );
};

