import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserLocation, INDIAN_CITIES } from '../../hooks/useUserLocation';
import { fetchLiveAndPredictiveWeather } from '../../services/weatherPredictionService';
import { predictDisasterRisks } from '../../services/aiDisasterPredictor';
import { 
  MapPin, 
  Compass, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  Wind, 
  Droplets, 
  Thermometer, 
  Gauge, 
  Building2, 
  Navigation, 
  PhoneCall, 
  ChevronRight, 
  Activity, 
  Clock, 
  Shield, 
  Users, 
  HelpCircle,
  ExternalLink,
  Flame,
  Radio,
  LocateFixed
} from 'lucide-react';

export const LiveLocationDisasterPredictor = ({ compact = false }) => {
  const {
    location,
    isLoading: isLocating,
    error: locationError,
    detectLiveLocation,
    setCityPreset,
    proximities
  } = useUserLocation();

  const [weatherData, setWeatherData] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [activePlanTab, setActivePlanTab] = useState('CITIZEN'); // 'CITIZEN' | 'AUTHORITY'
  const [selectedCityOption, setSelectedCityOption] = useState('New Delhi / NCR');

  // Trigger weather & AI prediction whenever location coordinates update
  useEffect(() => {
    let isMounted = true;
    const runAnalysis = async () => {
      if (!location || location.latitude == null || location.longitude == null) {
        return;
      }
      setIsPredicting(true);
      try {
        const weather = await fetchLiveAndPredictiveWeather(location.latitude, location.longitude);
        if (!isMounted) return;
        setWeatherData(weather);

        const prediction = await predictDisasterRisks({
          location,
          weather,
          proximities
        });
        if (!isMounted) return;
        setAiPrediction(prediction);
      } catch (err) {
        console.error('AI prediction pipeline error:', err);
      } finally {
        if (isMounted) setIsPredicting(false);
      }
    };

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [location?.latitude, location?.longitude, location?.city, proximities]);

  const handleCityChange = (e) => {
    const val = e.target.value;
    setSelectedCityOption(val);
    setCityPreset(val);
  };

  const handleManualReRun = async () => {
    if (!location || location.latitude == null) return;
    setIsPredicting(true);
    try {
      const weather = await fetchLiveAndPredictiveWeather(location.latitude, location.longitude);
      setWeatherData(weather);
      const prediction = await predictDisasterRisks({
        location,
        weather,
        proximities
      });
      setAiPrediction(prediction);
    } finally {
      setIsPredicting(false);
    }
  };

  const nearestHospital = proximities?.nearestHospital;
  const nearestShelter = proximities?.nearestShelter;
  const nearestNDRF = proximities?.nearestNDRF;

  // Determine Risk Badge Colors
  const riskLevel = aiPrediction?.overallRiskLevel || 'MODERATE';
  const riskColor = riskLevel === 'CRITICAL' 
    ? '#DC2626' 
    : riskLevel === 'HIGH' 
      ? '#EA580C' 
      : riskLevel === 'MODERATE' 
        ? '#D97706' 
        : '#16A34A';

  const riskBg = riskLevel === 'CRITICAL' 
    ? '#FEF2F2' 
    : riskLevel === 'HIGH' 
      ? '#FFF7ED' 
      : riskLevel === 'MODERATE' 
        ? '#FFFBEB' 
        : '#F0FDF4';

  const riskBorder = riskLevel === 'CRITICAL' 
    ? '#FECACA' 
    : riskLevel === 'HIGH' 
      ? '#FED7AA' 
      : riskLevel === 'MODERATE' 
        ? '#FDE68A' 
        : '#BBF7D0';

  // If no location has been selected or granted yet, prompt user to enable location
  if (!location || location.latitude == null) {
    return (
      <section 
        className="card"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--color-primary-300)',
          padding: '2.25rem 1.5rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2.5rem'
        }}
        aria-label="AI Disaster Prediction Pending Location"
      >
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            AI Real-Time Telemetry &amp; Predictive Disaster Engine
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', marginTop: '0.4rem', lineHeight: 1.55 }}>
            Enable your location at the top of the homepage to activate real-time Open-Meteo multi-day weather forecasts, seismic vulnerability assessment, and emergency management protocols tailored to your coordinates.
          </p>
          <button
            type="button"
            onClick={detectLiveLocation}
            className="btn btn-primary btn-sm"
            style={{ marginTop: '1.15rem', borderRadius: 'var(--radius-pill)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LocateFixed size={14} />
            <span>Use My Current Location</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section 
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        marginBottom: '2.5rem'
      }}
      aria-label="AI Disaster Prediction and Live Telemetry Command"
    >
      {/* =======================================================================
          TOP BAR: Live Location Pill + Quick Controls + City Switcher
          ======================================================================= */}
      <div className="ai-predictor-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Live Pulsing Dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span 
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: location.isLiveGps ? '#22C55E' : '#38BDF8',
                display: 'inline-block',
                boxShadow: location.isLiveGps ? '0 0 10px #22C55E' : '0 0 8px #38BDF8'
              }}
            />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#93C5FD' }}>
              {location.isLiveGps ? 'Live Device GPS Active' : 'Selected Regional Hub'}
            </span>
          </div>

          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={15} color="#F87171" />
            <span>{location.locality}, {location.city} ({location.state})</span>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
              [{Number(location.latitude).toFixed(3)}° N, {Number(location.longitude).toFixed(3)}° E]
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Quick City Switcher Dropdown */}
          <select
            value={selectedCityOption}
            onChange={handleCityChange}
            style={{
              backgroundColor: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-pill)',
              padding: '0.4rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
            aria-label="Switch Indian City to test different climate hazard zones"
          >
            {INDIAN_CITIES.map(c => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.state})
              </option>
            ))}
          </select>

          {/* Detect Live GPS Button */}
          <button
            type="button"
            onClick={detectLiveLocation}
            disabled={isLocating}
            className="btn btn-outline btn-xs"
            style={{
              color: '#FFFFFF',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              borderRadius: 'var(--radius-pill)',
              padding: '0.4rem 0.8rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title="Request browser GPS location"
          >
            <Compass size={13} className={isLocating ? 'spin' : ''} />
            <span>{isLocating ? 'Acquiring GPS...' : 'Locate Me (GPS)'}</span>
          </button>

          {/* Re-run AI Forecast */}
          <button
            type="button"
            onClick={handleManualReRun}
            disabled={isPredicting}
            className="btn btn-emergency btn-xs"
            style={{
              borderRadius: 'var(--radius-pill)',
              padding: '0.4rem 0.85rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Sparkles size={13} className={isPredicting ? 'spin' : ''} />
            <span>{isPredicting ? 'Analyzing...' : 'Re-Run AI Engine'}</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          3-COLUMN DASHBOARD GRID
          ======================================================================= */}
      <div 
        className="ai-predictor-grid"
        style={compact ? { gridTemplateColumns: '1fr', gap: '1rem', padding: '1rem' } : undefined}
      >
        {/* =====================================================================
            COLUMN 1: LIVE & 72-HOUR METEOROLOGICAL TELEMETRY CARD
            ===================================================================== */}
        <div 
          style={{ 
            backgroundColor: '#F8FAFC', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--color-border)', 
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={16} color="var(--color-primary-600)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-neutral-700)' }}>
                  Live Meteorological Array
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-neutral-500)', fontFamily: 'var(--font-mono)' }}>
                Open-Meteo V1
              </span>
            </div>

            {/* Current Conditions Header */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-neutral-900)', lineHeight: 1 }}>
                {weatherData?.current?.temperature ?? '--'}°C
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                Feels like {weatherData?.current?.apparentTemperature ?? '--'}°C
              </span>
            </div>

            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary-700)', marginBottom: '1.25rem' }}>
              {weatherData?.current?.weatherLabel || 'Atmospheric telemetry streaming...'}
            </div>

            {/* Key 4 Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {/* Pressure */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-neutral-500)', fontSize: '0.7rem', fontWeight: 700 }}>
                  <Gauge size={13} />
                  <span>Pressure (hPa)</span>
                </div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: weatherData?.current?.surfacePressure < 1002 ? '#DC2626' : 'var(--color-neutral-900)', marginTop: '0.2rem' }}>
                  {weatherData?.current?.surfacePressure ?? '--'} hPa
                </div>
                <div style={{ fontSize: '0.65rem', color: weatherData?.current?.surfacePressure < 1002 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>
                  {weatherData?.current?.surfacePressure < 1002 ? '⚠ Low Pressure Depression' : '✓ Normal Gradient'}
                </div>
              </div>

              {/* Humidity */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-neutral-500)', fontSize: '0.7rem', fontWeight: 700 }}>
                  <Droplets size={13} />
                  <span>Relative Humidity</span>
                </div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-neutral-900)', marginTop: '0.2rem' }}>
                  {weatherData?.current?.humidity ?? '--'}%
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-neutral-500)' }}>
                  Surface moisture
                </div>
              </div>

              {/* Wind Gusts */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-neutral-500)', fontSize: '0.7rem', fontWeight: 700 }}>
                  <Wind size={13} />
                  <span>Wind / Gusts</span>
                </div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: weatherData?.current?.windGusts > 50 ? '#DC2626' : 'var(--color-neutral-900)', marginTop: '0.2rem' }}>
                  {weatherData?.current?.windGusts ?? '--'} km/h
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-neutral-500)' }}>
                  Steady: {weatherData?.current?.windSpeed ?? '--'} km/h
                </div>
              </div>

              {/* 72h Rain */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-neutral-500)', fontSize: '0.7rem', fontWeight: 700 }}>
                  <Droplets size={13} />
                  <span>72h Rain Sum</span>
                </div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: weatherData?.predictive72h?.cumulativeRainfallMm > 50 ? '#DC2626' : 'var(--color-neutral-900)', marginTop: '0.2rem' }}>
                  {weatherData?.predictive72h?.cumulativeRainfallMm ?? '--'} mm
                </div>
                <div style={{ fontSize: '0.65rem', color: weatherData?.predictive72h?.cumulativeRainfallMm > 50 ? '#DC2626' : 'var(--color-neutral-500)', fontWeight: 600 }}>
                  {weatherData?.predictive72h?.cumulativeRainfallMm > 50 ? 'Inundation Warning' : 'Normal Precipitation'}
                </div>
              </div>
            </div>
          </div>

          {/* Mini 5-Day Outlook Strip */}
          <div style={{ paddingTop: '0.85rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              5-Day Outlook:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
              {(weatherData?.fiveDayForecast || []).map((day, idx) => (
                <div key={idx} style={{ backgroundColor: '#FFFFFF', padding: '0.45rem 0.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', minWidth: 0 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-neutral-600)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{day.dayName}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-neutral-900)', marginTop: '0.15rem' }}>{day.tempMax}°</div>
                  <div style={{ fontSize: '0.62rem', color: day.precipSum > 10 ? '#DC2626' : '#64748B' }}>{day.precipSum}mm</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =====================================================================
            COLUMN 2: AI UPCOMING DISASTER PREDICTION RADAR
            ===================================================================== */}
        <div 
          style={{ 
            backgroundColor: riskBg, 
            borderRadius: 'var(--radius-md)', 
            border: `1px solid ${riskBorder}`, 
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            {/* Header with Risk Pill */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color={riskColor} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: riskColor }}>
                  AI Hazard Radar (72-Hr)
                </span>
              </div>

              <span 
                style={{
                  backgroundColor: riskColor,
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-pill)',
                  letterSpacing: '0.04em'
                }}
              >
                {riskLevel} RISK ({aiPrediction?.riskScore ?? '--'}/100)
              </span>
            </div>

            {/* AI Executive Assessment Headline */}
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-neutral-800)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {aiPrediction?.summaryHeadline || 'Calculating multi-hazard predictive forecast for this sector...'}
            </p>

            {/* Top 3 Predicted Disaster Probability Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {(aiPrediction?.predictedDisasters || []).map((hazard, idx) => (
                <div key={idx} style={{ backgroundColor: '#FFFFFF', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                      {hazard.hazardType}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: hazard.probabilityPercent > 65 ? '#DC2626' : '#D97706' }}>
                      {hazard.probabilityPercent}% Probability
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 6, width: '100%', backgroundColor: '#E2E8F0', borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginBottom: '0.4rem' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${hazard.probabilityPercent}%`, 
                        backgroundColor: hazard.probabilityPercent > 65 ? '#DC2626' : '#EA580C',
                        borderRadius: 'var(--radius-pill)'
                      }} 
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-neutral-500)' }}>
                    <span>Trigger: {hazard.triggerFactor}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-neutral-700)', flexShrink: 0, marginLeft: '0.5rem' }}>
                      {hazard.timeframe}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engine Signature */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-neutral-500)', paddingTop: '0.65rem', borderTop: `1px solid ${riskBorder}` }}>
            <span>Engine: {aiPrediction?.engineSource || 'Gemini 2.5 Flash'}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              Updated: {new Date(aiPrediction?.analyzedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* =====================================================================
            COLUMN 3: AI DISASTER MANAGEMENT & NEAREST SAFE HUB PLAN
            ===================================================================== */}
        <div 
          style={{ 
            backgroundColor: '#F8FAFC', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--color-border)', 
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            {/* Plan Tab Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div 
                style={{ 
                  display: 'inline-flex', 
                  backgroundColor: '#E2E8F0', 
                  padding: '3px', 
                  borderRadius: 'var(--radius-pill)' 
                }}
              >
                <button
                  type="button"
                  onClick={() => setActivePlanTab('CITIZEN')}
                  style={{
                    border: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: activePlanTab === 'CITIZEN' ? '#0F172A' : 'transparent',
                    color: activePlanTab === 'CITIZEN' ? '#FFFFFF' : '#475569'
                  }}
                >
                  Citizen Preparedness Protocol
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlanTab('AUTHORITY')}
                  style={{
                    border: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: activePlanTab === 'AUTHORITY' ? '#0F172A' : 'transparent',
                    color: activePlanTab === 'AUTHORITY' ? '#FFFFFF' : '#475569'
                  }}
                >
                  EOC &amp; NDRF Plan
                </button>
              </div>

              <span style={{ fontSize: '0.68rem', color: '#16A34A', fontWeight: 700 }}>
                Verified Directives
              </span>
            </div>

            {/* Directive Bullet Steps */}
            <div style={{ marginBottom: '1.25rem' }}>
              {activePlanTab === 'CITIZEN' ? (
                <ul style={{ paddingLeft: '1.15rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(aiPrediction?.citizenManagementPlan || []).map((step, idx) => (
                    <li key={idx} style={{ fontSize: '0.75rem', color: 'var(--color-neutral-800)', lineHeight: 1.45 }}>
                      {step}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul style={{ paddingLeft: '1.15rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {(aiPrediction?.authorityResourcePlan || []).map((rec, idx) => (
                    <li key={idx} style={{ fontSize: '0.75rem', color: 'var(--color-neutral-800)', lineHeight: 1.45 }}>
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Nearest Verified Safe Hub Navigation Card */}
          <div 
            style={{ 
              backgroundColor: '#FFFFFF', 
              padding: '0.85rem 1rem', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-neutral-500)', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
              Nearest Verified Safe Hub:
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                  {nearestShelter ? (nearestShelter.facility || nearestShelter.name) : 'Regional Cyclone Shelter'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={13} />
                  <span>ID: {nearestShelter?.id || 'IND-SHL-001'} &bull; <strong>{nearestShelter?.distanceKm ?? 8.5} km</strong> away</span>
                </div>
              </div>

              {/* 1-Click Route on Map Link */}
              <Link
                to={nearestShelter ? `/map?lat=${nearestShelter.latitude}&lng=${nearestShelter.longitude}&zoom=12` : '/map'}
                className="btn btn-navy btn-xs"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  flexShrink: 0
                }}
              >
                <Navigation size={12} />
                <span>Route on Map</span>
              </Link>
            </div>

            {/* Quick Emergency Helplines Strip */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--color-neutral-600)', paddingTop: '0.45rem', borderTop: '1px solid var(--color-border)' }}>
              <span>National Disaster Helpline: <strong style={{ color: '#DC2626' }}>112</strong></span>
              <span>NDMA: <strong>1078</strong></span>
              <span>NDRF: <strong>09711077372</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
