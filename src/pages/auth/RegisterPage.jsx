import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { COUNTRY_CODES, formatE164Phone } from '../../services/supabaseClient';
import { 
  User, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  ChevronLeft,
  MapPin,
  Shield,
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
  const { signUpWithPhone, verifyPhoneOtp, register } = useAuth();
  const navigate = useNavigate();

  // Registration profile inputs
  const [role, setRole] = useState(ROLES.CITIZEN);
  const [fullName, setFullName] = useState('');
  const [zone, setZone] = useState('New Delhi / National Capital Region');

  // Mobile number inputs
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const otpInputRefs = useRef([]);

  // UI status
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

  // ---------------------------------------------------------------------------
  // STEP 1: SUBMIT REGISTRATION DETAILS & DISPATCH OTP VIA VONAGE
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
      setErrorMessage('Please enter a valid mobile phone number (e.g., 9876543210).');
      return;
    }

    const formattedPhone = formatE164Phone(countryCode, cleanDigits);
    setIsLoading(true);

    try {
      const metadata = { 
        full_name: fullName.trim(), 
        role, 
        zone 
      };
      const res = await signUpWithPhone(formattedPhone, metadata);

      if (res.success) {
        setOtpStep(true);
        setResendCountdown(60);
        setIsResendActive(false);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessNotice(`A 6-digit verification code has been sent to ${formattedPhone}.`);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch phone verification SMS. Please check your number.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'SMS service error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 2: VERIFY 6-DIGIT OTP & COMPLETE REGISTRATION
  // ---------------------------------------------------------------------------
  const handleVerifyPhoneOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const token = otpDigits.join('');
    if (token.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    const cleanDigits = mobileNumber.replace(/\D/g, '');
    const formattedPhone = formatE164Phone(countryCode, cleanDigits);
    setIsLoading(true);

    try {
      const res = await verifyPhoneOtp(formattedPhone, token);
      if (res.success) {
        register({
          name: fullName.trim(),
          phone: formattedPhone,
          role,
          zone
        });

        if (role === ROLES.ADMIN) {
          navigate('/admin');
        } else if (role === ROLES.RESPONDER) {
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

  const handleChangeMobileNumber = () => {
    setOtpStep(false);
    setErrorMessage('');
    setSuccessNotice('');
    setOtpDigits(['', '', '', '', '', '']);
  };

  return (
    <div className="container-narrow page-container" style={{ maxWidth: '520px', paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
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
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: '0.35rem', fontWeight: 600 }}>
            Register with your verified mobile number to submit crisis reports and coordinate emergency relief
          </p>
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
            MOBILE REGISTRATION FLOW
            ===================================================================== */}
        {!otpStep ? (
          // Step 1: Account Details & Mobile Number
          <form onSubmit={handleSendPhoneOtp} noValidate>
            {/* Role Selection */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">
                Account Designation / Role <span className="required">*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn btn-xs ${role === ROLES.CITIZEN ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-pill)', padding: '0.5rem 0.25rem', fontWeight: 700, fontSize: '0.72rem' }}
                  onClick={() => setRole(ROLES.CITIZEN)}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${role === ROLES.ADMIN ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-pill)', padding: '0.5rem 0.25rem', fontWeight: 700, fontSize: '0.72rem' }}
                  onClick={() => setRole(ROLES.ADMIN)}
                >
                  EOC Admin
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${role === ROLES.RESPONDER ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-pill)', padding: '0.5rem 0.25rem', fontWeight: 700, fontSize: '0.72rem' }}
                  onClick={() => setRole(ROLES.RESPONDER)}
                >
                  Responder
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="reg-name">
                Full Legal Name <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-name"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-md)' }}
                  placeholder="e.g., Sarah Jenkins or Marcus Chen"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isLoading}
                  autoComplete="name"
                />
                <User 
                  size={16} 
                  color="var(--color-neutral-400)" 
                  style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} 
                />
              </div>
            </div>

            {/* Primary Sector / Zone */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="reg-zone">
                Operational Disaster Sector / Zone <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="reg-zone"
                  className="form-select"
                  style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-md)' }}
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  disabled={isLoading}
                >
                  {INDIAN_ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
                <MapPin 
                  size={16} 
                  color="var(--color-neutral-400)" 
                  style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} 
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="reg-mobile">
                Mobile Phone Number <span className="required">*</span>
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                <select
                  className="form-select"
                  style={{ borderRadius: 'var(--radius-md)', padding: '0.65rem 0.5rem', fontSize: 'var(--text-xs)', fontWeight: 700 }}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={isLoading}
                  aria-label="Country calling code"
                >
                  {COUNTRY_CODES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.flag} {item.code}
                    </option>
                  ))}
                </select>

                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-mobile"
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
                A 6-digit SMS verification code will be dispatched to confirm your mobile phone.
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
          // Step 2: 6-Digit OTP Verification
          <form onSubmit={handleVerifyPhoneOtp} noValidate>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                SMS Code Dispatched to:
              </div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)', marginTop: '0.15rem' }}>
                {formatE164Phone(countryCode, mobileNumber)}
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
                  <span>Verifying &amp; Registering...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
              {resendCountdown > 0 ? (
                <span>Resend code in <strong>{resendCountdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendPhoneOtp}
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

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>
              Sign In with Mobile &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
