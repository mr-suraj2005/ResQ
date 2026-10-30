import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { 
  LayoutDashboard, 
  AlertOctagon, 
  BellRing, 
  Boxes, 
  Radio, 
  ArrowLeft, 
  ShieldAlert, 
  MapPin, 
  CheckCircle2,
  Users
} from 'lucide-react';

export const DashboardSidebar = ({ type = 'admin' }) => {
  const { currentUser, currentRole } = useAuth();
  const { pendingIncidents, criticalAlerts, inventory } = useEmergencyData();

  const lowStockCount = inventory.filter(i => i.status !== 'SUFFICIENT').length;

  return (
    <aside className="dashboard-sidebar" aria-label="Administrative Navigation">
      <div className="sidebar-header">
        <div>
          <div className="sidebar-title">
            {type === 'admin' ? 'EOC Command Center' : 'Tactical Unit Terminal'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>
            {type === 'admin' ? 'Operations & Dispatch' : currentUser?.unit || 'Field Unit Alpha'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {type === 'admin' ? (
          <>
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-link-content">
                <LayoutDashboard size={18} strokeWidth={1.75} />
                <span>Overview & KPIs</span>
              </div>
            </NavLink>

            <NavLink 
              to="/admin/incidents" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-link-content">
                <AlertOctagon size={18} strokeWidth={1.75} />
                <span>Incident Queue</span>
              </div>
              {pendingIncidents.length > 0 && (
                <span className="sidebar-badge danger" title={`${pendingIncidents.length} Pending Review`}>
                  {pendingIncidents.length}
                </span>
              )}
            </NavLink>

            <NavLink 
              to="/admin/alerts" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-link-content">
                <BellRing size={18} strokeWidth={1.75} />
                <span>Broadcast Alerts</span>
              </div>
              {criticalAlerts.length > 0 && (
                <span className="sidebar-badge danger">
                  {criticalAlerts.length}
                </span>
              )}
            </NavLink>

            <NavLink 
              to="/admin/resources" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-link-content">
                <Boxes size={18} strokeWidth={1.75} />
                <span>Shelters & Supply</span>
              </div>
              {lowStockCount > 0 && (
                <span className="sidebar-badge" style={{ backgroundColor: 'var(--color-warning-600)' }}>
                  {lowStockCount}
                </span>
              )}
            </NavLink>
          </>
        ) : (
          <>
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
          </>
        )}

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
          {currentUser?.badgeNumber ? `Badge: ${currentUser.badgeNumber}` : `Role: ${currentRole || 'CITIZEN'}`}
        </div>
      </div>
    </aside>
  );
};

