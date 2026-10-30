import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserLocation, INDIAN_CITIES } from '../../context/LocationContext';
import { 
  MapPin, 
  LocateFixed, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Navigation, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  Building2, 
  ShieldCheck,
  Radio,
  ExternalLink
} from 'lucide-react';

export const HomeLocationSection = () => {
  const {
    location,
    status,
    isDetected,
    isLoading,
    isLiveGps,
    error,
    detectLiveLocation,
    setCityPreset,
    clearLocation,
    proximities,
    isCollapsed,
    toggleCollapsed
  } = useUserLocation();

  const [showCityPicker, setShowCityPicker] = useState(false);

  // -------------------------------------------------------------------------
  // 1. LOADING / DETECTING STATE
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div 
        className="card"
        style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          marginBottom: '1.75rem',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.85rem'
        }}
        role="status"
        aria-live="polite"
      >
        <div style={{ position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              borderRadius: '50%', 
              border: '2px solid rgba(59, 130, 246, 0.3)', 
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' 
            }} 
          />
          <RefreshCw size={26} color="#60A5FA" className="spin" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            Detecting your location...
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: '#94A3B8', marginTop: '0.35rem', maxWidth: '460px' }}>
            Acquiring high-accuracy GPS coordinates and resolving Indian regional disaster zones via satellite reverse geocoding...
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. PERMISSION DENIED / ERROR STATE
  // -------------------------------------------------------------------------
  if (status === 'denied') {
    return (
      <div 
        className="card"
        style={{
          backgroundColor: '#FFFBEB',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          border: '1px solid #FCD34D',
          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)'
        }}
        role="alert"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              backgroundColor: '#FEF3C7', 
              color: '#D97706', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={22} />
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400E' }}>
                Location Access Needed for Localized Alerts
              </h3>
              <span style={{ fontSize: '0.68rem', backgroundColor: '#FDE68A', color: '#78350F', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}>
                PERMISSION REQUIRED
              </span>
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: '#B45309', marginTop: '0.35rem', lineHeight: 1.5 }}>
              {error || 'Location permission was denied. To enable live emergency detection, click the site settings/lock icon in your browser address bar, set Location to "Allow", and click Retry below.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={detectLiveLocation}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <RefreshCw size={14} />
                <span>Retry Location Detection</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCityPicker(!showCityPicker)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: 'var(--radius-pill)', color: '#92400E', borderColor: '#FCD34D', fontWeight: 600 }}
              >
                <MapPin size={14} />
                <span>{showCityPicker ? 'Hide Regional Cities' : 'Select Region Manually'}</span>
              </button>
            </div>

            {/* Quick Regional Fallbacks */}
            {showCityPicker && (
              <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #FDE68A' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#78350F', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Choose Your Regional Indian Zone:
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {INDIAN_CITIES.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => {
                        setCityPreset(city.name);
                        setShowCityPicker(false);
                      }}
                      className="filter-pill"
                      style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-pill)' }}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 3. SUCCESS STATE: COMPACT COLLAPSED BAR
  // -------------------------------------------------------------------------
  if (isDetected && isCollapsed && location) {
    return (
      <aside 
        className="card"
        style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-pill)',
          padding: '0.55rem 1.25rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
        aria-label="Active Location Status"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#34D399', fontSize: '0.75rem', fontWeight: 800 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span>{isLiveGps ? 'GPS ACTIVE:' : 'ZONE ACTIVE:'}</span>
          </div>

          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={13} color="#60A5FA" />
            <span>{location.locality ? `${location.locality}, ` : ''}{location.city}, {location.state}</span>
            <span style={{ color: '#94A3B8', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              ({location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E)
            </span>
          </div>

          {location.accuracy && (
            <span style={{ fontSize: '0.68rem', color: '#93C5FD', backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              ±{location.accuracy}m accuracy
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            to={`/map?lat=${location.latitude}&lng=${location.longitude}&zoom=11`}
            className="btn btn-outline btn-xs"
            style={{ color: '#93C5FD', borderColor: 'rgba(147, 197, 253, 0.35)', borderRadius: 'var(--radius-pill)', padding: '0.2rem 0.6rem' }}
          >
            <Compass size={12} />
            <span>Live Map</span>
          </Link>

          <button
            type="button"
            onClick={detectLiveLocation}
            className="btn btn-ghost btn-xs"
            style={{ color: '#CBD5E1', padding: '0.2rem 0.5rem' }}
            title="Re-acquire live GPS"
          >
            <RefreshCw size={12} />
            <span>Re-detect</span>
          </button>

          <button
            type="button"
            onClick={toggleCollapsed}
            className="btn btn-ghost btn-xs"
            style={{ color: '#94A3B8', padding: '0.2rem 0.4rem' }}
            title="Expand location details"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </aside>
    );
  }

  // -------------------------------------------------------------------------
  // 4. SUCCESS STATE: FULL EXPANDED BANNER
  // -------------------------------------------------------------------------
  if (isDetected && location) {
    const nearestHospital = proximities?.nearestHospital;
    const nearestShelter = proximities?.nearestShelter;
    const nearestNDRF = proximities?.nearestNDRF;

    return (
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0A192F 0%, #0F172A 100%)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          boxShadow: '0 10px 25px -5px rgba(2, 6, 23, 0.3)'
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 10px #10B981' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#34D399' }}>
              Location detected successfully &bull; {isLiveGps ? 'Live High-Accuracy GPS' : 'Regional Zone Fallback'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={detectLiveLocation}
              className="btn btn-ghost btn-xs"
              style={{ color: '#93C5FD', padding: '0.25rem 0.55rem' }}
              title="Refresh high-accuracy GPS coordinates"
            >
              <RefreshCw size={13} />
              <span>Re-detect GPS</span>
            </button>

            <button
              type="button"
              onClick={clearLocation}
              className="btn btn-ghost btn-xs"
              style={{ color: '#94A3B8', padding: '0.25rem 0.55rem' }}
              title="Change or reset location"
            >
              Change Location
            </button>

            <button
              type="button"
              onClick={toggleCollapsed}
              className="btn btn-ghost btn-xs"
              style={{ color: '#94A3B8', padding: '0.25rem 0.5rem' }}
              title="Collapse into compact status bar"
            >
              <ChevronUp size={15} />
            </button>
          </div>
        </div>

        {/* Content Row: Coordinates + Reverse Geocoded Address */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Disaster Monitoring Zone
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.2rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <MapPin size={22} color="#60A5FA" style={{ flexShrink: 0 }} />
              <span>{location.locality ? `${location.locality}, ` : ''}{location.city}</span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: '#CBD5E1', marginTop: '0.25rem', paddingLeft: '1.85rem' }}>
              {location.state}, {location.country} &bull; Coordinates: <code style={{ color: '#93C5FD', fontWeight: 700 }}>{location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E</code>
              {location.accuracy && <span> (±{location.accuracy}m GPS)</span>}
            </div>
          </div>

          {/* Real Proximity Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
            {nearestHospital && (
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-md)', padding: '0.65rem' }}>
                <div style={{ fontSize: '0.68rem', color: '#93C5FD', fontWeight: 700 }}>NEAREST APEX HOSPITAL</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: '#FFFFFF', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {nearestHospital.facility}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700, marginTop: '0.2rem' }}>
                  {nearestHospital.distanceKm} km away
                </div>
              </div>
            )}

            {nearestShelter && (
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-md)', padding: '0.65rem' }}>
                <div style={{ fontSize: '0.68rem', color: '#93C5FD', fontWeight: 700 }}>CYCLONE/FLOOD SHELTER</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: '#FFFFFF', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {nearestShelter.location || nearestShelter.facility}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700, marginTop: '0.2rem' }}>
                  {nearestShelter.distanceKm} km away
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="#34D399" />
            <span>Dashboard telemetry, weather telemetry, and nearby shelters synchronized with your coordinates.</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to={`/map?lat=${location.latitude}&lng=${location.longitude}&zoom=11`}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-pill)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Compass size={14} />
              <span>Explore on Live Map</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 5. IDLE STATE: PROMINENT LOCATION PROMPT AT TOP OF HOMEPAGE
  // -------------------------------------------------------------------------
  return (
    <section 
      className="card"
      style={{
        background: 'linear-gradient(135deg, #0B192C 0%, #1E293B 100%)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(1.25rem, 3.5vw, 2rem)',
        marginBottom: '2rem',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        boxShadow: '0 12px 28px -6px rgba(11, 25, 44, 0.35)'
      }}
      aria-label="Location Permission Section"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
        {/* Glowing GPS Radar Icon */}
        <div 
          style={{ 
            width: 56, 
            height: 56, 
            borderRadius: '50%', 
            backgroundColor: 'rgba(37, 99, 235, 0.2)', 
            border: '2px solid rgba(96, 165, 250, 0.4)',
            color: '#60A5FA', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(37, 99, 235, 0.35)',
            flexShrink: 0
          }}
        >
          <LocateFixed size={28} strokeWidth={2.2} />
        </div>

        {/* Text and Actions */}
        <div style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 800, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
            <Radio size={12} color="#60A5FA" />
            <span>Emergency Telemetry &bull; Priority Area Detection</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Enable Your Location
          </h2>

          <p style={{ fontSize: 'var(--text-sm)', color: '#CBD5E1', marginTop: '0.5rem', lineHeight: 1.55, maxWidth: '680px' }}>
            Allow location access to receive disaster alerts, weather updates, nearby shelters, and emergency information relevant to your area.
          </p>

          {/* Primary Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={detectLiveLocation}
              className="btn btn-primary btn-lg"
              style={{
                borderRadius: 'var(--radius-pill)',
                padding: '0.75rem 1.65rem',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#2563EB',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.45)',
                transition: 'all 0.15s ease'
              }}
            >
              <LocateFixed size={18} strokeWidth={2.4} />
              <span>Use My Current Location</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCityPicker(!showCityPicker)}
              className="btn btn-outline"
              style={{
                borderRadius: 'var(--radius-pill)',
                padding: '0.7rem 1.25rem',
                color: '#E2E8F0',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <MapPin size={16} />
              <span>{showCityPicker ? 'Close City List' : 'Or Select an Indian City'}</span>
            </button>
          </div>

          {/* Quick Fallback Indian Cities */}
          {showCityPicker && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                Select an Indian Regional Hub:
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {INDIAN_CITIES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setCityPreset(c.name);
                      setShowCityPicker(false);
                    }}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: 'var(--radius-pill)',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.75rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Message */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', color: '#94A3B8', fontSize: '0.72rem' }}>
            <Lock size={13} color="#60A5FA" style={{ flexShrink: 0 }} />
            <span>
              <strong>Privacy Notice:</strong> Location access is used strictly to provide localized emergency alerts and proximity to disaster facilities. Your coordinates are never stored on tracking servers or shared.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
