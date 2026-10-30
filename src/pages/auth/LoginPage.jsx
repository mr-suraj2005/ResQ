import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { COUNTRY_CODES, formatE164Phone } from '../../services/supabaseClient';
import { 
  Mail, 
  Phone, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ChevronLeft,
  KeyRound,
  Shield,
  HelpCircle
} from 'lucide-react';

export const LoginPage = () => {
  const { 
    signInWithEmail, 
    signInWithPhone, 
    verifyPhoneOtp, 
    resetPassword,
    login 
  } = useAuth();
  const navigate = useNavigate();

  // Active Login Method: 'EMAIL' | 'MOBILE'
  const [loginMethod, setLoginMethod] = useState('EMAIL');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Mobile number form state
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false); // false = enter number, true = verify OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const otpInputRefs = useRef([]);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // UI status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // 60-Second OTP Countdown Timer
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

  // Clear messages when switching tabs
  const handleSwitchTab = (method) => {
    setLoginMethod(method);
    setErrorMessage('');
    setInfoMessage('');
    if (method === 'EMAIL') {
      setOtpStep(false);
    }
  };

  // ---------------------------------------------------------------------------
  // OPTION 1: EMAIL LOGIN SUBMISSION
  // ---------------------------------------------------------------------------
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signInWithEmail(email, password);
      if (res.success) {
        navigate('/my-reports');
      } else {
        setErrorMessage(res.error || 'Invalid email or password. Please verify your credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // OPTION 2: MOBILE NUMBER — SEND OTP
  // ---------------------------------------------------------------------------
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanDigits = mobileNumber.replace(/\D/g, '');
    if (cleanDigits.length < 7) {
      setErrorMessage('Please enter a valid mobile number (e.g., 9876543210).');
      return;
    }

    const formattedPhone = formatE164Phone(selectedCountryCode, cleanDigits);
    setIsLoading(true);

    try {
      const res = await signInWithPhone(formattedPhone);
      if (res.success) {
        setOtpStep(true);
        setResendCountdown(60);
        setIsResendActive(false);
        setOtpDigits(['', '', '', '', '', '']);
        setInfoMessage(
          res.demoCode 
            ? `Demo OTP sent to ${formattedPhone}. (Evaluation Passcode: ${res.demoCode})` 
            : `6-digit verification code sent to ${formattedPhone}.`
        );
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch verification SMS. Please verify your phone number.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to SMS authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // OPTION 2: MOBILE NUMBER — VERIFY 6-DIGIT OTP
  // ---------------------------------------------------------------------------
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const token = otpDigits.join('');
    if (token.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    const cleanDigits = mobileNumber.replace(/\D/g, '');
    const formattedPhone = formatE164Phone(selectedCountryCode, cleanDigits);
    setIsLoading(true);

    try {
      const res = await verifyPhoneOtp(formattedPhone, token);
      if (res.success) {
        navigate('/my-reports');
      } else {
        setErrorMessage(res.error || 'Invalid or expired 6-digit verification code. Please request a new code.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Box Key Handling (Auto-advance and Backspace)
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

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    const nextIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // ---------------------------------------------------------------------------
  // FORGOT PASSWORD FLOW
  // ---------------------------------------------------------------------------
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setIsLoading(true);
    setResetSuccessMsg('');
    setErrorMessage('');

    try {
      const res = await resetPassword(resetEmail);
      if (res.success) {
        setResetSuccessMsg(`Password reset instructions dispatched to ${resetEmail}. Check your inbox.`);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch reset link.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Service unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // FAST ONE-CLICK EVALUATOR ACCESS
  // ---------------------------------------------------------------------------
  const handleFastDemoLogin = (role) => {
    if (role === ROLES.ADMIN) {
      login('e.vance@eoc.resq.gov', 'demo123', ROLES.ADMIN);
      navigate('/admin');
    } else if (role === ROLES.RESPONDER) {
      login('m.chen@ndrf.resq.gov', 'demo123', ROLES.RESPONDER);
      navigate('/responder');
    } else {
      login('sarah.jenkins@citizen.wa.gov', 'demo123', ROLES.CITIZEN);
      navigate('/my-reports');
    }
  };

  return (
    <div className="container-narrow page-container" style={{ maxWidth: '520px', paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
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
              width: 54, 
              height: 54, 
              borderRadius: '50%', 
              backgroundColor: 'var(--color-primary-100)', 
              color: 'var(--color-primary-600)',
              marginBottom: '0.85rem' 
            }}
          >
            <ShieldCheck size={28} strokeWidth={2.2} />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Sign In to ResQ
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', marginTop: '0.35rem' }}>
            National Unified Disaster Emergency Network &bull; India Command
          </p>
        </div>

        {/* =====================================================================
            1. SEGMENTED SELECTOR: EMAIL vs. MOBILE NUMBER
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
          aria-label="Login method selector"
        >
          <button
            type="button"
            role="tab"
            aria-selected={loginMethod === 'EMAIL'}
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
              transition: 'all var(--transition-fast)',
              backgroundColor: loginMethod === 'EMAIL' ? '#FFFFFF' : 'transparent',
              color: loginMethod === 'EMAIL' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
              boxShadow: loginMethod === 'EMAIL' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Mail size={15} />
            <span>Continue with Email</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={loginMethod === 'MOBILE'}
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
              transition: 'all var(--transition-fast)',
              backgroundColor: loginMethod === 'MOBILE' ? '#FFFFFF' : 'transparent',
              color: loginMethod === 'MOBILE' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
              boxShadow: loginMethod === 'MOBILE' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Phone size={15} />
            <span>Continue with Mobile</span>
          </button>
        </div>

        {/* Global Feedback Alerts */}
        {errorMessage && (
          <div 
            style={{ 
              backgroundColor: 'var(--color-emergency-50)', 
              border: '1px solid var(--color-emergency-200)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.85rem 1rem', 
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-emergency-800)',
              fontSize: 'var(--text-xs)',
              lineHeight: 1.4
            }}
            role="alert"
          >
            <AlertCircle size={16} color="var(--color-emergency-600)" style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
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
            <span>{infoMessage}</span>
          </div>
        )}

        {/* =====================================================================
            2. OPTION 1: EMAIL LOGIN FORM
            ===================================================================== */}
        {loginMethod === 'EMAIL' && (
          <form onSubmit={handleEmailLogin} noValidate>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="login-email">
                Email Address <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-md)' }}
                  placeholder="name@agency.gov.in or user@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
                <Mail 
                  size={16} 
                  color="var(--color-neutral-400)" 
                  style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>
                  Password <span className="required">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-primary-600)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', borderRadius: 'var(--radius-md)' }}
                  placeholder="Enter your account password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Lock 
                  size={16} 
                  color="var(--color-neutral-400)" 
                  style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-neutral-400)',
                    cursor: 'pointer'
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
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
                marginTop: '1.25rem',
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
                  <span>Signing In via Supabase...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Email</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* =====================================================================
            3. OPTION 2: MOBILE NUMBER & 6-DIGIT OTP FLOW
            ===================================================================== */}
        {loginMethod === 'MOBILE' && (
          <div>
            {!otpStep ? (
              // Step 2A: Phone number entry
              <form onSubmit={handleSendOtp} noValidate>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="mobile-input">
                    Mobile Number <span className="required">*</span>
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                    {/* Country Code Selector */}
                    <select
                      className="form-select"
                      style={{ borderRadius: 'var(--radius-md)', padding: '0.65rem 0.5rem', fontSize: 'var(--text-xs)', fontWeight: 700 }}
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      disabled={isLoading}
                      aria-label="Country calling code"
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>

                    {/* National Number Input */}
                    <div style={{ position: 'relative' }}>
                      <input
                        id="mobile-input"
                        type="tel"
                        className="form-input"
                        style={{ paddingLeft: '2.3rem', borderRadius: 'var(--radius-md)' }}
                        placeholder="98765 43210"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        disabled={isLoading}
                        autoComplete="tel-national"
                      />
                      <Phone 
                        size={15} 
                        color="var(--color-neutral-400)" 
                        style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} 
                      />
                    </div>
                  </div>

                  <p style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)', marginTop: '0.4rem', margin: '0.4rem 0 0 0' }}>
                    We will transmit a secure 6-digit one-time verification passcode (OTP) via SMS.
                  </p>
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
                      <span>Sending Passcode...</span>
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
              // Step 2B: 6-Digit OTP Verification Interface
              <form onSubmit={handleVerifyOtp} noValidate>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>
                    Passcode sent to:
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                    {formatE164Phone(selectedCountryCode, mobileNumber)}
                  </div>
                </div>

                {/* 6 OTP Input Boxes */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '0.65rem' }}>
                    Enter 6-Digit Passcode
                  </label>

                  <div 
                    style={{ 
                      display: 'flex', 
                      gap: '0.45rem', 
                      justifyContent: 'center', 
                      alignItems: 'center' 
                    }}
                    onPaste={handleOtpPaste}
                  >
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
                          outline: 'none',
                          boxShadow: digit ? '0 0 0 1px var(--color-primary-600)' : 'none',
                          transition: 'border-color var(--transition-fast)'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Verify OTP Button */}
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
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Verifying Passcode...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Verify &amp; Enter Portal</span>
                    </>
                  )}
                </button>

                {/* Resend & Change Number Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setErrorMessage('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--color-neutral-600)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: 600
                    }}
                  >
                    <ChevronLeft size={14} />
                    <span>Change Mobile Number</span>
                  </button>

                  {isResendActive ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'var(--color-primary-600)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        textDecoration: 'underline'
                      }}
                      disabled={isLoading}
                    >
                      Resend Passcode
                    </button>
                  ) : (
                    <span style={{ color: 'var(--color-neutral-500)' }}>
                      Resend in <strong>{resendCountdown}s</strong>
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* =====================================================================
            4. REGISTRATION LINK
            ===================================================================== */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', margin: 0 }}>
            Don't have an emergency responder or citizen account?{' '}
            <Link 
              to="/register" 
              style={{ color: 'var(--color-primary-600)', fontWeight: 700, textDecoration: 'none' }}
            >
              Create an Account &rarr;
            </Link>
          </p>
        </div>

        {/* =====================================================================
            5. ONE-CLICK EVALUATOR / DEMO ACCESS
            ===================================================================== */}
        <div 
          style={{ 
            marginTop: '1.75rem',
            backgroundColor: '#F8FAFC', 
            border: '1px solid #E2E8F0', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1E293B', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
            <Sparkles size={14} color="#2563EB" />
            <span>Instant Evaluator Demo Access</span>
          </div>

          <p style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '0.75rem', lineHeight: 1.4 }}>
            Bypass live SMS/credentials testing with simulated official profiles:
          </p>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              style={{ borderRadius: 'var(--radius-pill)', fontSize: '0.7rem' }}
              onClick={() => handleFastDemoLogin(ROLES.CITIZEN)}
            >
              Citizen (Sarah J.)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              style={{ borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', borderColor: '#BFDBFE', color: '#1D4ED8', backgroundColor: '#EFF6FF' }}
              onClick={() => handleFastDemoLogin(ROLES.ADMIN)}
            >
              EOC Admin (Edward Vance)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              style={{ borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', borderColor: '#BBF7D0', color: '#15803D', backgroundColor: '#F0FDF4' }}
              onClick={() => handleFastDemoLogin(ROLES.RESPONDER)}
            >
              NDRF Responder (Lt. Chen)
            </button>
          </div>
        </div>
      </div>

      {/* =======================================================================
          6. FORGOT PASSWORD MODAL OVERLAY
          ======================================================================= */}
      {showForgotPassword && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="card"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <KeyRound size={22} color="var(--color-primary-600)" />
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0 }}>
                Reset Your Password
              </h3>
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Enter the registered email associated with your ResQ account. Supabase will send a secure password recovery link.
            </p>

            {resetSuccessMsg ? (
              <div 
                style={{
                  backgroundColor: 'var(--color-success-50)',
                  border: '1px solid var(--color-success-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  color: 'var(--color-success-800)',
                  fontSize: 'var(--text-xs)',
                  marginBottom: '1.5rem',
                  lineHeight: 1.5
                }}
              >
                {resetSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="reset-email">
                    Account Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    className="form-input"
                    placeholder="name@agency.gov.in"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSuccessMsg('');
                      setResetEmail('');
                    }}
                    style={{ borderRadius: 'var(--radius-pill)' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Dispatching Link...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}

            {resetSuccessMsg && (
              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSuccessMsg('');
                    setResetEmail('');
                  }}
                  style={{ borderRadius: 'var(--radius-pill)' }}
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
