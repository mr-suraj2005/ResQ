import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { COUNTRY_CODES, formatE164Phone } from '../../services/supabaseClient';
import { 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ChevronLeft,
  Shield,
  HelpCircle,
  X
} from 'lucide-react';

export const LoginPage = () => {
  const { signInWithPhone, verifyPhoneOtp } = useAuth();
  const navigate = useNavigate();

  // Mobile number form state
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false); // false = enter number, true = verify OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const otpInputRefs = useRef([]);

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

  // ---------------------------------------------------------------------------
  // STEP 1: MOBILE NUMBER — SEND OTP VIA VONAGE
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
        setInfoMessage(`A 6-digit verification code has been dispatched to ${formattedPhone}.`);
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
  // STEP 2: MOBILE NUMBER — VERIFY 6-DIGIT OTP
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
        const userRole = res.data?.session?.user?.user_metadata?.role;
        if (userRole === ROLES.ADMIN) {
          navigate('/admin');
        } else if (userRole === ROLES.RESPONDER) {
          navigate('/responder');
        } else {
          navigate('/my-reports');
        }
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

  // Return from OTP verification step back to editing mobile number
  const handleChangeMobileNumber = () => {
    setOtpStep(false);
    setErrorMessage('');
    setInfoMessage('');
    setOtpDigits(['', '', '', '', '', '']);
  };

  return (
    <div className="container-narrow page-container" style={{ maxWidth: '480px', paddingTop: '3rem', paddingBottom: '3.5rem' }}>
      <div 
        className="card"
        style={{ 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-surface)',
          padding: '2.25rem 2rem'
        }}
      >
        {/* Header Branding */}
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
            <ShieldCheck size={28} strokeWidth={2.2} />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Sign In to ResQ
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: '0.35rem', fontWeight: 600 }}>
            National Unified Disaster Emergency Network &bull; India Command
          </p>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.35rem', 
            marginTop: '0.65rem', 
            fontSize: '0.72rem', 
            color: 'var(--color-primary-700)', 
            backgroundColor: 'var(--color-primary-50)', 
            padding: '0.2rem 0.65rem', 
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-primary-200)',
            fontWeight: 700 
          }}>
            <Phone size={12} />
            <span>Mobile OTP Authentication</span>
          </div>
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
            MOBILE NUMBER & 6-DIGIT OTP AUTHENTICATION FLOW
            ===================================================================== */}
        {!otpStep ? (
          // Step 1: Phone number entry
          <form onSubmit={handleSendOtp} noValidate>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="mobile-input">
                Mobile Phone Number <span className="required">*</span>
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
                    onChange={(e) => {
                      setMobileNumber(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
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
              <p style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)', marginTop: '0.4rem' }}>
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
                  <span>Dispatching SMS Code...</span>
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
          // Step 2: 6-Digit OTP Verification Interface
          <form onSubmit={handleVerifyOtp} noValidate>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                Verification code dispatched to:
              </div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)', marginTop: '0.15rem' }}>
                {formatE164Phone(selectedCountryCode, mobileNumber)}
              </div>
              <button
                type="button"
                onClick={handleChangeMobileNumber}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary-600)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '0.35rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <ChevronLeft size={13} />
                <span>Change Mobile Number</span>
              </button>
            </div>

            {/* 6-Digit Input Boxes */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '0.75rem' }}>
                Enter 6-Digit Verification Code <span className="required">*</span>
              </label>

              <div 
                style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="form-input"
                    style={{
                      width: '44px',
                      height: '52px',
                      textAlign: 'center',
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      borderRadius: 'var(--radius-md)',
                      border: digit ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      backgroundColor: digit ? 'var(--color-primary-50)' : 'var(--color-bg-surface)'
                    }}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    disabled={isLoading}
                    autoFocus={idx === 0}
                    aria-label={`Digit ${idx + 1}`}
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
                gap: '0.5rem'
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
                  <span>Verify &amp; Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Resend OTP Timer & Option */}
            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
              {resendCountdown > 0 ? (
                <span>Resend verification code in <strong>{resendCountdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary-600)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
                  <span>Resend Code via SMS</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* Footer Navigation */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)' }}>
            Don't have an emergency responder or citizen account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>
              Register with Mobile &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
