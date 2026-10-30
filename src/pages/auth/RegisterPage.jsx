import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { COUNTRY_CODES, formatE164Phone } from '../../services/supabaseClient';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  ChevronLeft,
  MapPin,
  Sparkles,
  X
} from 'lucide-react';

const INDIAN_ZONES = [
  'New Delhi / National Capital Region',
  'Odisha Coastal Belt (Puri / Bhubaneswar)',
  'Andhra Pradesh East Coast (Visakhapatnam)',
  'West Bengal & Sundarbans Delta (Kolkata)',
  'Mumbai / Konkan Coastal Zone (Maharashtra)',
  'Chennai / Coromandel Coast (Tamil Nadu)',
  'Gujarat Coastal & Kutch Corridor (Ahmedabad)',
  'Karnataka Coast & Urban Hub (Bengaluru)',
  'Kerala Monsoon & Flood Sector (Kochi)',
  'Assam & Brahmaputra Basin (Guwahati)',
  'Himalayan Seismic Sector (Uttarakhand)'
];

export const RegisterPage = () => {
  const { signUpWithEmail, signUpWithPhone, verifyPhoneOtp, register } = useAuth();
  const navigate = useNavigate();

  // Mode: 'EMAIL' | 'MOBILE'
  const [registerMethod, setRegisterMethod] = useState('EMAIL');

  // Shared form inputs
  const [fullName, setFullName] = useState('');
  const [zone, setZone] = useState('New Delhi / National Capital Region');

  // Email mode inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Mobile mode inputs
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const otpInputRefs = useRef([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // 60-Second Countdown for Phone OTP
  useEffect(() => {
    let timer;
    if (otpStep && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            setIsResendActive(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpStep, resendCountdown]);

  const handleSwitchTab = (method) => {
    setRegisterMethod(method);
    setErrorMessage('');
    setSuccessNotice('');
    setOtpStep(false);
  };

  // ---------------------------------------------------------------------------
  // 1. REGISTER WITH EMAIL SUBMIT
  // ---------------------------------------------------------------------------
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const metadata = { full_name: fullName.trim(), zone };
      const res = await signUpWithEmail(email, password, metadata);

      if (res.success) {
        if (res.data?.user?.identities?.length === 0) {
          setErrorMessage('An account with this email already exists. Please sign in instead.');
        } else if (res.data?.session) {
          // Immediately signed in
          navigate('/my-reports');
        } else {
          // Email confirmation required
          setSuccessNotice(`Registration successful! A verification link has been sent to ${email}. Please confirm your email.`);
        }
      } else {
        setErrorMessage(res.error || 'Failed to complete registration.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration service unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. REGISTER WITH MOBILE — SEND OTP
  // ---------------------------------------------------------------------------
  const handleSendPhoneOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!fullName.trim()) {
      setErrorMessage('Please provide your full legal name.');
      return;
    }

    const cleanDigits = mobileNumber.replace(/\D/g, '');
    if (cleanDigits.length < 7) {
      setErrorMessage('Please enter a valid mobile phone number.');
      return;
    }

    const formattedPhone = formatE164Phone(countryCode, cleanDigits);
    setIsLoading(true);

    try {
      const metadata = { full_name: fullName.trim(), zone };
      const res = await signUpWithPhone(formattedPhone, metadata);

      if (res.success) {
        setOtpStep(true);
        setResendCountdown(60);
        setIsResendActive(false);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessNotice(
          res.demoCode 
            ? `Verification code dispatched to ${formattedPhone} (Evaluation Code: ${res.demoCode}).`
            : `6-digit verification code sent to ${formattedPhone}.`
        );
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch phone verification SMS.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'SMS service error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemoBypass = () => {
    const cleanDigits = mobileNumber.replace(/\D/g, '');
    const formattedPhone = formatE164Phone(countryCode, cleanDigits || '8167815646');
    setErrorMessage('');
    setOtpStep(true);
    setResendCountdown(60);
    setIsResendActive(false);
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
    setSuccessNotice(`Simulation Passcode 123456 loaded for ${formattedPhone}. Click Complete Registration.`);
    setTimeout(() => {
      otpInputRefs.current[5]?.focus();
    }, 150);
  };

  // ---------------------------------------------------------------------------
  // 3. REGISTER WITH MOBILE — VERIFY OTP
  // ---------------------------------------------------------------------------
  const handleVerifyPhoneOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const token = otpDigits.join('');
    if (token.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the code.');
      return;
    }

    const cleanDigits = mobileNumber.replace(/\D/g, '');
    const formattedPhone = formatE164Phone(countryCode, cleanDigits);
    setIsLoading(true);

    try {
      const res = await verifyPhoneOtp(formattedPhone, token);
      if (res.success) {
        register({
          name: fullName,
          email: `${cleanDigits}@phone.resq.gov`,
          phone: formattedPhone,
          zone
        });
        navigate('/my-reports');
      } else {
        setErrorMessage(res.error || 'Invalid or expired 6-digit code. Please request a new one.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    const digit = value.slice(-1).replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="container-narrow page-container" style={{ maxWidth: '560px', paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div 
        className="card" 
        style={{ 
          padding: '2.25rem 2rem', 
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
            <User size={26} strokeWidth={2.2} />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Create Your ResQ Account
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', marginTop: '0.35rem' }}>
            Register to submit localized crisis reports and receive verified disaster warnings
          </p>
        </div>

        {/* =====================================================================
            1. SEGMENTED SELECTOR: REGISTER WITH EMAIL vs. MOBILE NUMBER
            ===================================================================== */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.35rem', 
            backgroundColor: 'var(--color-neutral-100)', 
            padding: '4px', 
            borderRadius: 'var(--radius-pill)', 
            marginBottom: '1.75rem' 
          }}
          role="tablist"
          aria-label="Registration method selector"
        >
          <button
            type="button"
            role="tab"
            aria-selected={registerMethod === 'EMAIL'}
            onClick={() => handleSwitchTab('EMAIL')}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              backgroundColor: registerMethod === 'EMAIL' ? '#FFFFFF' : 'transparent',
              color: registerMethod === 'EMAIL' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
              boxShadow: registerMethod === 'EMAIL' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Mail size={15} />
            <span>Register with Email</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={registerMethod === 'MOBILE'}
            onClick={() => handleSwitchTab('MOBILE')}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              backgroundColor: registerMethod === 'MOBILE' ? '#FFFFFF' : 'transparent',
              color: registerMethod === 'MOBILE' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
              boxShadow: registerMethod === 'MOBILE' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Phone size={15} />
            <span>Register with Mobile</span>
          </button>
        </div>

        {/* Global Feedback Messages */}
        {errorMessage && (
          <div 
            style={{ 
              backgroundColor: 'var(--color-emergency-50)', 
              border: '1px solid var(--color-emergency-200)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.85rem 1rem', 
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: 'var(--color-emergency-800)',
              fontSize: 'var(--text-xs)',
              lineHeight: 1.4
            }}
            role="alert"
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <AlertCircle size={16} color="var(--color-emergency-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMessage}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setErrorMessage('')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', padding: 0 }}
                title="Dismiss notice"
              >
                <X size={14} />
              </button>
            </div>

            {(errorMessage.toLowerCase().includes('vonage') || errorMessage.toLowerCase().includes('status: 4')) && (
              <div style={{ borderTop: '1px solid var(--color-emergency-200)', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#B91C1C', fontWeight: 600 }}>
                  Vonage SMS provider pending in Supabase. Test registration immediately:
                </span>
                <button
                  type="button"
                  onClick={handleUseDemoBypass}
                  className="btn btn-emergency btn-xs"
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Sparkles size={12} />
                  <span>Use Sandbox Passcode (123456)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {successNotice && (
          <div 
            style={{ 
              backgroundColor: 'var(--color-success-50)', 
              border: '1px solid var(--color-success-200)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.85rem 1rem', 
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-success-800)',
              fontSize: 'var(--text-xs)',
              lineHeight: 1.4
            }}
            role="status"
          >
            <CheckCircle2 size={16} color="var(--color-success-600)" style={{ flexShrink: 0 }} />
            <span>{successNotice}</span>
          </div>
        )}

        {/* =====================================================================
            2. EMAIL REGISTRATION FORM
            ===================================================================== */}
        {registerMethod === 'EMAIL' && (
          <form onSubmit={handleEmailRegister} noValidate>
            <div className="form-group" style={{ marginBottom: '1.15rem' }}>
              <label className="form-label" htmlFor="reg-name">
                Full Legal Name <span className="required">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                className="form-input"
                style={{ borderRadius: 'var(--radius-md)' }}
                placeholder="e.g. Priya Sharma"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.15rem' }}>
              <label className="form-label" htmlFor="reg-email">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                style={{ borderRadius: 'var(--radius-md)' }}
                placeholder="name@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.15rem' }}>
              <label className="form-label" htmlFor="reg-zone">
                Primary Disaster Risk / Residential Zone <span className="required">*</span>
              </label>
              <select
                id="reg-zone"
                className="form-select"
                style={{ borderRadius: 'var(--radius-md)' }}
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                disabled={isLoading}
              >
                {INDIAN_ZONES.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="reg-password">
                Create Secure Password <span className="required">*</span>
              </label>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                style={{ borderRadius: 'var(--radius-md)' }}
                placeholder="Minimum 8 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                padding: '0.85rem', 
                borderRadius: 'var(--radius-pill)', 
                fontSize: 'var(--text-sm)', 
                fontWeight: 700, 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Registering via Supabase...</span>
                </>
              ) : (
                <>
                  <span>Create Account with Email</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* =====================================================================
            3. MOBILE REGISTRATION FORM
            ===================================================================== */}
        {registerMethod === 'MOBILE' && (
          <div>
            {!otpStep ? (
              <form onSubmit={handleSendPhoneOtp} noValidate>
                <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                  <label className="form-label" htmlFor="reg-mob-name">
                    Full Legal Name <span className="required">*</span>
                  </label>
                  <input
                    id="reg-mob-name"
                    type="text"
                    className="form-input"
                    style={{ borderRadius: 'var(--radius-md)' }}
                    placeholder="e.g. Priya Sharma"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                  <label className="form-label" htmlFor="reg-mob-number">
                    Mobile Phone Number <span className="required">*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                    <select
                      className="form-select"
                      style={{ borderRadius: 'var(--radius-md)', padding: '0.65rem 0.5rem', fontSize: 'var(--text-xs)', fontWeight: 700 }}
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={isLoading}
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>

                    <input
                      id="reg-mob-number"
                      type="tel"
                      className="form-input"
                      style={{ borderRadius: 'var(--radius-md)' }}
                      placeholder="98765 43210"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="reg-mob-zone">
                    Primary Disaster Risk / Residential Zone <span className="required">*</span>
                  </label>
                  <select
                    id="reg-mob-zone"
                    className="form-select"
                    style={{ borderRadius: 'var(--radius-md)' }}
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    disabled={isLoading}
                  >
                    {INDIAN_ZONES.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ 
                    width: '100%', 
                    padding: '0.85rem', 
                    borderRadius: 'var(--radius-pill)', 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 700, 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Sending SMS Passcode...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              // 6-Digit OTP Verification interface
              <form onSubmit={handleVerifyPhoneOtp} noValidate>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>
                    Passcode sent to:
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                    {formatE164Phone(countryCode, mobileNumber)}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '0.65rem' }}>
                    Enter 6-Digit SMS Verification Code
                  </label>

                  <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center', alignItems: 'center' }}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        disabled={isLoading}
                        style={{
                          width: '46px',
                          height: '52px',
                          textAlign: 'center',
                          fontSize: '1.35rem',
                          fontWeight: 800,
                          borderRadius: 'var(--radius-md)',
                          border: '2px solid var(--color-border)',
                          backgroundColor: digit ? '#F8FAFC' : '#FFFFFF',
                          color: 'var(--color-neutral-900)',
                          outline: 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ 
                    width: '100%', 
                    padding: '0.85rem', 
                    borderRadius: 'var(--radius-pill)', 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 700, 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}
                  disabled={isLoading || otpDigits.join('').length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify Passcode & Complete Registration'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setErrorMessage('');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-neutral-600)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    &larr; Change Mobile Number
                  </button>

                  {isResendActive ? (
                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Resend Passcode
                    </button>
                  ) : (
                    <span style={{ color: 'var(--color-neutral-500)' }}>
                      Resend in {resendCountdown}s
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer sign in link */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', margin: 0 }}>
            Already registered on the national grid?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 700, textDecoration: 'none' }}>
              Sign In Here &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
