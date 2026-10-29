import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { Shield, User, Radio, Lock, Mail, ArrowRight, ShieldAlert, Check } from 'lucide-react';

export const LoginPage = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.CITIZEN);
  const [notice, setNotice] = useState('');

  const handleStandardLogin = (e) => {
    e.preventDefault();
    login(email || undefined, password || undefined, selectedRole);
    redirectToRole(selectedRole);
  };

  const handleQuickLogin = (role) => {
    login(null, null, role);
    redirectToRole(role);
  };

  const redirectToRole = (role) => {
    if (role === ROLES.ADMIN) {
      navigate('/admin');
    } else if (role === ROLES.RESPONDER) {
      navigate('/responder');
    } else {
      navigate('/my-reports');
    }
  };

  return (
    <div className="container-narrow page-container" style={{ maxWidth: '580px', paddingTop: '2.5rem' }}>
      <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 44, 
            height: 44, 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: 'var(--color-primary-900)', 
            color: '#FFFFFF',
            marginBottom: '0.75rem' 
          }}>
            <Shield size={22} />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>ResQ Incident Portal</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', marginTop: '0.25rem' }}>
            Multi-Role Emergency Management &amp; Incident Dispatch System
          </p>
        </div>

        {/* Demo Fast-Login Selector */}
        <div style={{ 
          backgroundColor: 'var(--color-neutral-50)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1.25rem', 
          marginBottom: '1.75rem' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            fontSize: 'var(--text-xs)', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            color: 'var(--color-primary-700)', 
            marginBottom: '0.75rem',
            letterSpacing: '0.04em'
          }}>
            <span>One-Click Role Authentication (For Evaluators)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ justifyContent: 'flex-start', padding: '0.75rem', backgroundColor: '#FFFFFF' }}
              onClick={() => handleQuickLogin(ROLES.CITIZEN)}
            >
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: 'var(--color-primary-100)', 
                color: 'var(--color-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem'
              }}>
                <User size={16} />
              </div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)' }}>
                  Citizen User: Sarah Jenkins
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)' }}>
                  Submit reports, view live map &amp; track verified responses
                </div>
              </div>
              <ArrowRight size={16} color="var(--color-neutral-400)" />
            </button>

            <button
              type="button"
              className="btn btn-outline"
              style={{ justifyContent: 'flex-start', padding: '0.75rem', backgroundColor: '#FFFFFF' }}
              onClick={() => handleQuickLogin(ROLES.ADMIN)}
            >
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: '#EDE9FE', 
                color: '#6D28D9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem'
              }}>
                <Shield size={16} />
              </div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)' }}>
                  EOC Admin: Cmdr. Edward Vance
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)' }}>
                  Triage queue, assign units, broadcast alerts &amp; manage supplies
                </div>
              </div>
              <ArrowRight size={16} color="var(--color-neutral-400)" />
            </button>

            <button
              type="button"
              className="btn btn-outline"
              style={{ justifyContent: 'flex-start', padding: '0.75rem', backgroundColor: '#FFFFFF' }}
              onClick={() => handleQuickLogin(ROLES.RESPONDER)}
            >
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: 'var(--color-success-100)', 
                color: 'var(--color-success-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem'
              }}>
                <Radio size={16} />
              </div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)' }}>
                  Responder: Lt. Marcus Chen
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)' }}>
                  Marine Rescue Unit 1 &bull; Update CAD statuses &amp; field log
                </div>
              </div>
              <ArrowRight size={16} color="var(--color-neutral-400)" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          margin: '1.25rem 0', 
          color: 'var(--color-neutral-400)',
          fontSize: 'var(--text-xs)'
        }}>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }}></div>
          <span style={{ padding: '0 0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>or manual sign in</span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }}></div>
        </div>

        {/* Form */}
        <form onSubmit={handleStandardLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Official Email Address</label>
            <div className="search-wrapper">
              <Mail size={16} className="search-icon" aria-hidden="true" />
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="name@agency.gov or personal email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="search-wrapper">
              <Lock size={16} className="search-icon" aria-hidden="true" />
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sign in As Role</label>
            <select 
              className="form-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value={ROLES.CITIZEN}>Citizen Resident (Public Access)</option>
              <option value={ROLES.ADMIN}>Emergency Operations Commander (EOC Admin)</option>
              <option value={ROLES.RESPONDER}>Tactical Emergency Responder (Field Unit)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-navy btn-block btn-lg" style={{ marginTop: '1rem' }}>
            <span>Sign In to Terminal</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>
          Don't have a registered citizen ID?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>Create Citizen Account</Link>
        </div>

        {/* Civic Privacy Notice */}
        <div style={{ 
          marginTop: '1.75rem', 
          padding: '0.85rem', 
          backgroundColor: '#FFFBEB', 
          border: '1px solid #FDE68A', 
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: '0.65rem'
        }}>
          <ShieldAlert size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: 'var(--text-xs)', color: '#92400E', lineHeight: 1.5 }}>
            <strong>Privacy &amp; Security Protocol:</strong> This platform is configured for technical evaluation. Do NOT enter real classified data, patient PHI, or production credentials.
          </div>
        </div>
      </div>
    </div>
  );
};

