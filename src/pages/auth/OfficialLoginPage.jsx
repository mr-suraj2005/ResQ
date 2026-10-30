import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { 
  Shield, 
  Radio, 
  Lock, 
  Key, 
  BadgeCheck, 
  ArrowRight, 
  AlertTriangle,
  Server,
  Zap,
  Building
} from 'lucide-react';

export const OfficialLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN); // ADMIN or RESPONDER
  const [badgeId, setBadgeId] = useState(selectedRole === ROLES.ADMIN ? 'EOC-DIR-04' : 'SFD-4091');
  const [callsign, setCallsign] = useState('');
  const [securePin, setSecurePin] = useState('••••••••');

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === ROLES.ADMIN) {
      setBadgeId('EOC-DIR-04');
    } else {
      setBadgeId('SFD-4091');
    }
  };

  const handleDemoLogin = (role) => {
    if (role === ROLES.ADMIN) {
      login('e.vance@eoc.seattle.gov', 'admin123', ROLES.ADMIN);
      navigate('/admin');
    } else {
      login('m.chen@fire.seattle.gov', 'responder123', ROLES.RESPONDER);
      navigate('/responder');
    }
  };

  const handleOfficialSubmit = (e) => {
    e.preventDefault();
    if (selectedRole === ROLES.ADMIN) {
      login('e.vance@eoc.seattle.gov', securePin, ROLES.ADMIN);
      navigate('/admin');
    } else {
      login('m.chen@fire.seattle.gov', securePin, ROLES.RESPONDER);
      navigate('/responder');
    }
  };

  return (
    <div 
      style={{ 
        minHeight: 'calc(100vh - 180px)', 
        backgroundColor: '#070F1E', 
        padding: '3rem 1rem 5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        style={{ 
          maxWidth: '560px', 
          width: '100%', 
          backgroundColor: '#0A192F', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
          padding: '2.5rem 2rem',
          color: '#FFFFFF'
        }}
      >
        {/* Authority Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: 56, 
              height: 56, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(29, 78, 216, 0.25)', 
              border: '2px solid #3B82F6',
              color: '#60A5FA',
              marginBottom: '1rem',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.35)'
            }}
          >
            <Shield size={28} strokeWidth={2.2} />
          </div>
          <div style={{ 
            fontSize: '0.72rem', 
            fontWeight: 700, 
            letterSpacing: '0.12em', 
            textTransform: 'uppercase', 
            color: '#93C5FD',
            marginBottom: '0.25rem' 
          }}>
            Authorized Personnel Only
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', color: '#F8FAFC' }}>
            Official Command Terminal
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: '#94A3B8', marginTop: '0.35rem' }}>
            Emergency Operations Center &bull; Tactical Field Dispatch System
          </p>
        </div>

        {/* 1-Click Fast Evaluator Buttons */}
        <div 
          style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.8)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '1.25rem', 
            marginBottom: '1.75rem' 
          }}
        >
          <div style={{ 
            fontSize: 'var(--text-xs)', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            color: '#38BDF8', 
            letterSpacing: '0.06em', 
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Zap size={14} />
            <span>Instant Role Evaluation (Bypass Login)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn"
              onClick={() => handleDemoLogin(ROLES.ADMIN)}
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(129, 140, 248, 0.4)',
                borderRadius: 'var(--radius-pill)',
                color: '#C7D2FE',
                padding: '0.65rem 0.85rem',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                cursor: 'pointer'
              }}
            >
              <Shield size={15} color="#A5B4FC" />
              <span>Demo Admin Login</span>
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => handleDemoLogin(ROLES.RESPONDER)}
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                borderRadius: 'var(--radius-pill)',
                color: '#A7F3D0',
                padding: '0.65rem 0.85rem',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                cursor: 'pointer'
              }}
            >
              <Radio size={15} color="#6EE7B7" />
              <span>Demo Responder Login</span>
            </button>
          </div>
        </div>

        {/* Role Toggle Pill */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            backgroundColor: 'rgba(15, 23, 42, 0.95)', 
            padding: '4px', 
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.5rem'
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleChange(ROLES.ADMIN)}
            style={{
              padding: '0.6rem 1rem',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              background: selectedRole === ROLES.ADMIN ? '#1D4ED8' : 'transparent',
              color: selectedRole === ROLES.ADMIN ? '#FFFFFF' : '#94A3B8',
              fontWeight: 600,
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Shield size={14} />
            <span>EOC Administrator</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange(ROLES.RESPONDER)}
            style={{
              padding: '0.6rem 1rem',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              background: selectedRole === ROLES.RESPONDER ? '#047857' : 'transparent',
              color: selectedRole === ROLES.RESPONDER ? '#FFFFFF' : '#94A3B8',
              fontWeight: 600,
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Radio size={14} />
            <span>Field Responder</span>
          </button>
        </div>

        {/* Command Form */}
        <form onSubmit={handleOfficialSubmit}>
          <div className="form-group" style={{ marginBottom: '1.15rem' }}>
            <label className="form-label" style={{ color: '#E2E8F0', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {selectedRole === ROLES.ADMIN ? 'Administrator Service Badge ID' : 'Unit Call Sign / Officer ID'}
            </label>
            <div style={{ position: 'relative' }}>
              <BadgeCheck size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="text"
                className="form-input"
                style={{
                  paddingLeft: '2.6rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)'
                }}
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ color: '#E2E8F0', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Secure Agency Passcode / Token
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="password"
                className="form-input"
                style={{
                  paddingLeft: '2.6rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)'
                }}
                value={securePin}
                onChange={(e) => setSecurePin(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{
              backgroundColor: selectedRole === ROLES.ADMIN ? '#1D4ED8' : '#059669',
              borderColor: selectedRole === ROLES.ADMIN ? '#2563EB' : '#10B981',
              borderRadius: 'var(--radius-pill)',
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 700
            }}
          >
            <span>Authenticate to {selectedRole === ROLES.ADMIN ? 'EOC Console' : 'CAD Terminal'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Switch back to Citizen Portal */}
        <div 
          style={{ 
            marginTop: '2rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center' 
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', color: '#94A3B8', marginBottom: '0.5rem' }}>
            Looking for Public / Citizen Assistance?
          </div>
          <Link 
            to="/login" 
            style={{ 
              color: '#60A5FA', 
              fontSize: 'var(--text-sm)', 
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>Go to Citizen Portal</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

