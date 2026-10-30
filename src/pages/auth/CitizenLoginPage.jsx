import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { 
  User, 
  Phone, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  KeyRound,
  FileText,
  AlertTriangle
} from 'lucide-react';

export const CitizenLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDemoCitizenLogin = () => {
    login('sarah.jenkins@citizen.wa.gov', 'demo123', ROLES.CITIZEN);
    navigate('/my-reports');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'otp' && !otpSent) {
      if (!phone.trim()) return;
      setOtpSent(true);
      setSuccessMsg('Verification code sent to ' + phone + ' (Demo code: 123456)');
      return;
    }

    login(email || 'citizen@resq.gov', 'demo123', ROLES.CITIZEN);
    navigate('/my-reports');
  };

  return (
    <div className="container-narrow page-container" style={{ maxWidth: '540px', paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div 
        className="card" 
        style={{ 
          padding: '2.5rem 2rem', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-surface)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: 52, 
              height: 52, 
              borderRadius: '50%', 
              backgroundColor: 'var(--color-primary-100)', 
              color: 'var(--color-primary-600)',
              marginBottom: '0.85rem' 
            }}
          >
            <User size={26} strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Citizen Portal Sign In
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', marginTop: '0.35rem' }}>
            Submit incident reports, access verified shelters, and track real-time assistance
          </p>
        </div>

        {/* Instant Citizen Demo Login */}
        <div 
          style={{ 
            backgroundColor: '#EFF6FF', 
            border: '1px solid #BFDBFE', 
            borderRadius: 'var(--radius-md)', 
            padding: '1.25rem', 
            marginBottom: '1.75rem',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#1D4ED8', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
            <Sparkles size={14} />
            <span>One-Click Evaluator Access</span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: '#1E40AF', marginBottom: '0.85rem' }}>
            Bypass OTP authentication with the pre-configured Sarah Jenkins citizen profile.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-block btn-lg"
            onClick={handleDemoCitizenLogin}
            style={{ borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <User size={18} />
            <span>Instant Citizen Demo Login</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          margin: '1.5rem 0', 
          color: 'var(--color-neutral-400)',
          fontSize: 'var(--text-xs)'
        }}>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }}></div>
          <span style={{ padding: '0 0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>or sign in with contact</span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }}></div>
        </div>

        {/* Mode Selector Tabs */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            backgroundColor: 'var(--color-neutral-100)', 
            padding: '4px', 
            borderRadius: 'var(--radius-pill)',
            marginBottom: '1.25rem'
          }}
        >
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setOtpSent(false); setSuccessMsg(''); }}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              background: authMode === 'otp' ? '#FFFFFF' : 'transparent',
              color: authMode === 'otp' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
              fontWeight: 600,
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: authMode === 'otp' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Phone size={14} />
            <span>Mobile OTP</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setOtpSent(false); setSuccessMsg(''); }}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              background: authMode === 'password' ? '#FFFFFF' : 'transparent',
              color: authMode === 'password' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
              fontWeight: 600,
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: authMode === 'password' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Mail size={14} />
            <span>Email &amp; Password</span>
          </button>
        </div>

        {successMsg && (
          <div style={{ 
            padding: '0.75rem 1rem', 
            backgroundColor: '#DCFCE7', 
            border: '1px solid #86EFAC', 
            borderRadius: 'var(--radius-md)', 
            color: '#15803D', 
            fontSize: 'var(--text-xs)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldCheck size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {authMode === 'otp' ? (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="phone-input">Mobile Number</label>
                <div className="search-wrapper">
                  <Phone size={16} className="search-icon" aria-hidden="true" />
                  <input
                    id="phone-input"
                    type="tel"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem', borderRadius: 'var(--radius-md)' }}
                    placeholder="+91 98765 43210 or 10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {otpSent && (
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label" htmlFor="otp-input">Enter 6-Digit OTP</label>
                  <div className="search-wrapper">
                    <KeyRound size={16} className="search-icon" aria-hidden="true" />
                    <input
                      id="otp-input"
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '2.4rem', letterSpacing: '0.25em', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
                      placeholder="123456"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-navy btn-block btn-lg"
                style={{ marginTop: '1.25rem', borderRadius: 'var(--radius-pill)' }}
              >
                <span>{otpSent ? 'Verify & Continue' : 'Send One-Time Passcode'}</span>
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="citizen-email">Registered Email</label>
                <div className="search-wrapper">
                  <Mail size={16} className="search-icon" aria-hidden="true" />
                  <input
                    id="citizen-email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem', borderRadius: 'var(--radius-md)' }}
                    placeholder="sarah.jenkins@citizen.wa.gov"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="citizen-pass">Password</label>
                <div className="search-wrapper">
                  <Lock size={16} className="search-icon" aria-hidden="true" />
                  <input
                    id="citizen-pass"
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem', borderRadius: 'var(--radius-md)' }}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-navy btn-block btn-lg"
                style={{ marginTop: '1.25rem', borderRadius: 'var(--radius-pill)' }}
              >
                <span>Sign In to Citizen Portal</span>
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>
          First time here?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-primary-600)' }}>
            Register Citizen Account
          </Link>
        </div>

        {/* Link to Official Command Portal */}
        <div 
          style={{ 
            marginTop: '2rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center' 
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginBottom: '0.5rem' }}>
            Emergency Responder or EOC Administrator?
          </div>
          <Link 
            to="/official-login" 
            className="btn btn-outline btn-block"
            style={{ 
              borderRadius: 'var(--radius-pill)', 
              borderColor: 'var(--color-primary-900)', 
              color: 'var(--color-primary-900)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)'
            }}
          >
            <span>Access Official Command Portal &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

