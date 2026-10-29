import React from 'react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { ShieldAlert, RefreshCw, UserCheck } from 'lucide-react';

export const SimulationBanner = () => {
  const { currentRole, switchRole, currentUser } = useAuth();
  const { resetToFactoryData } = useEmergencyData();

  return (
    <aside className="simulation-bar" aria-label="Simulation Environment Information">
      <div className="simulation-notice">
        <span className="notice-pill">NOTICE</span>
        <ShieldAlert size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />
        <span>SIMULATION PROTOTYPE — FOR EDUCATIONAL DEMONSTRATION ONLY. DO NOT USE FOR REAL EMERGENCIES.</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            aria-checked={currentRole === ROLES.ADMIN}
            className={`role-switcher-btn ${currentRole === ROLES.ADMIN ? 'active' : ''}`}
            onClick={() => switchRole(ROLES.ADMIN)}
            title="Switch to Emergency Admin View"
          >
            Admin
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

