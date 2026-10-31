import React from 'react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { ShieldAlert, RefreshCw, Database } from 'lucide-react';

export const SimulationBanner = () => {
  const { currentRole, switchRole } = useAuth();
  const { resetToFactoryData, supabaseStatus, supabaseMessage } = useEmergencyData();

  const getStatusBadge = () => {
    if (supabaseStatus === 'CONNECTED') {
      return {
        color: '#34D399',
        dotBg: '#10B981',
        label: 'Supabase Cloud: Live Sync'
      };
    }
    if (supabaseStatus === 'CONNECTED_PENDING_SCHEMA') {
      return {
        color: '#60A5FA',
        dotBg: '#3B82F6',
        label: 'Supabase Connected'
      };
    }
    return {
      color: '#CBD5E1',
      dotBg: '#94A3B8',
      label: 'Local Storage Cache'
    };
  };

  const badge = getStatusBadge();

  return (
    <aside className="simulation-bar" aria-label="Simulation Environment Information">
      <div className="simulation-notice">
        <span className="notice-pill">NOTICE</span>
        <ShieldAlert size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />
        <span>EXERCISE ENVIRONMENT &bull; OFFICIAL DISASTER RESPONSE SIMULATION</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Supabase Backend Live Connection Pill */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem', 
            fontSize: '0.68rem', 
            color: badge.color,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
          title={supabaseMessage}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: badge.dotBg, boxShadow: `0 0 6px ${badge.dotBg}` }}></span>
          <Database size={11} />
          <span>{badge.label}</span>
        </div>

        {/* Demo Role Switcher */}
        <div className="demo-role-switcher" role="radiogroup" aria-label="Quick Demo Role Switcher">
          <span className="demo-role-label">Demo Role:</span>
          
          <button
            type="button"
            role="radio"
            aria-checked={currentRole === ROLES.CITIZEN}
            className={`role-switcher-btn ${currentRole === ROLES.CITIZEN ? 'active' : ''}`}
            onClick={() => switchRole(ROLES.CITIZEN)}
            title="Switch to Citizen View"
          >
            Citizen
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={currentRole === ROLES.RESPONDER}
            className={`role-switcher-btn ${currentRole === ROLES.RESPONDER ? 'active' : ''}`}
            onClick={() => switchRole(ROLES.RESPONDER)}
            title="Switch to Tactical Responder View"
          >
            Responder
          </button>
        </div>

        <button
          type="button"
          onClick={resetToFactoryData}
          className="btn-ghost btn-xs"
          style={{ color: '#94A3B8', fontSize: '0.68rem', padding: '0.15rem 0.4rem', border: '1px solid rgba(255,255,255,0.1)' }}
          title="Reset simulated incidents and alerts to defaults"
        >
          <RefreshCw size={11} /> Reset Data
        </button>
      </div>
    </aside>
  );
};
