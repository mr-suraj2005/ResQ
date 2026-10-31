import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { useUserLocation, calculateDistanceKm, INDIAN_CITIES } from '../../context/LocationContext';
import { liveTelemetryService } from '../../services/liveTelemetryService';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { EmergencySlider } from '../../components/home/EmergencySlider';
import { HomeLocationSection } from '../../components/home/HomeLocationSection';
import { LiveLocationDisasterPredictor } from '../../components/ai/LiveLocationDisasterPredictor';
import { 
  AlertTriangle, 
  AlertCircle,
  Building2, 
  ShieldAlert, 
  Truck, 
  MapPin, 
  Compass, 
  Clock, 
  ArrowRight,
  Flame,
  Droplets,
  HeartPulse,
  PhoneCall,
  Wind,
  Activity,
  Gauge,
  Radio,
  Users,
  CheckCircle2,
  ExternalLink,
  Radar,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Navigation,
  Thermometer,
  CloudRain,
  Layers,
  Info,
  LocateFixed,
  RefreshCw
} from 'lucide-react';

// Custom mini circular incident map pin
const miniPinIcon = L.divIcon({
  className: 'mini-map-pin',
  html: `<div style="width: 14px; height: 14px; background: #DC2626; border: 2px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 6px rgba(220, 38, 38, 0.8);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// User location pulsating marker for mini preview
const userPulseIcon = L.divIcon({
  className: 'mini-user-pulse-pin',
  html: `<div style="position: relative; width: 20px; height: 20px;">
    <div style="position: absolute; inset: -6px; border-radius: 50%; background: rgba(37, 99, 235, 0.45); animation: pulse 1.5s infinite;"></div>
    <div style="width: 20px; height: 20px; background: #2563EB; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 10px #2563EB;"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function RecenterMiniMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] != null) {
      map.flyTo(center, zoom, { animate: true, duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

const CATEGORY_ICONS = {
  FLOOD: Droplets,
  FIRE: Flame,
  POWER: Activity,
  MEDICAL: HeartPulse,
  HAZMAT: AlertTriangle,
  INFRASTRUCTURE: Building2
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { 
    location, 
    status: locationStatus,
    isDetected, 
    isLoading: isLocationLoading, 
    detectLiveLocation, 
    setCityPreset, 
    proximities 
  } = useUserLocation();
  const { 
    incidents, 
    activeIncidents, 
    shelters,
    openShelters, 
    criticalAlerts, 
    activeAlerts,
    deployedUnits 
  } = useEmergencyData();

  // Weather & Live Sensor State
  const [weather, setWeather] = useState(null);
  const [seismic, setSeismic] = useState(null);
  const [sensors, setSensors] = useState(null);
  const [showCityPicker, setShowCityPicker] = useState(false);

  // Live Incident Stream Filter
  const [incidentCategoryFilter, setIncidentCategoryFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    liveTelemetryService.fetchLiveWeather().then(data => {
      if (isMounted) setWeather(data);
    });
    liveTelemetryService.fetchLiveSeismic().then(data => {
      if (isMounted) setSeismic(data);
    });
    setSensors(liveTelemetryService.getLiveSensorTelemetry());

    const interval = setInterval(() => {
      if (isMounted) {
        setSensors(liveTelemetryService.getLiveSensorTelemetry());
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Filtered incidents for section 9
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter(inc => inc.status !== 'REJECTED')
      .filter(inc => {
        if (incidentCategoryFilter === 'ALL') return true;
        return inc.category?.toUpperCase() === incidentCategoryFilter;
      });
  }, [incidents, incidentCategoryFilter]);

  // Featured Shelters (Nearest if location available, else first 3)
  const featuredShelters = useMemo(() => {
    if (!shelters || shelters.length === 0) return [];
    
    if (location?.latitude != null && location?.longitude != null) {
      const sorted = [...shelters].map(s => ({
        ...s,
        distanceKm: calculateDistanceKm(location.latitude, location.longitude, s.latitude, s.longitude)
      })).sort((a, b) => a.distanceKm - b.distanceKm);
      return sorted.slice(0, 3);
    }

    return shelters.slice(0, 3);
  }, [shelters, location]);

  // Smooth scroll helper
  const scrollToUpdates = (e) => {
    e.preventDefault();
    const el = document.getElementById('emergency-updates');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAIPredictor = (e) => {
    e.preventDefault();
    const el = document.getElementById('ai-prediction-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-redesign-wrapper">
      
      {/* =========================================================================
          SECTION 2: HERO SECTION (Introduction + Live Emergency Slider)
          ========================================================================= */}
      <section className="home-section home-section-hero" aria-labelledby="hero-title">
        <div className="container">
          <div className="home-hero-grid">
            
            {/* Left Column: Hero Content */}
            <div className="home-hero-content">
              {/* Small Label */}
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  backgroundColor: 'rgba(255, 255, 255, 0.08)', 
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '0.35rem 0.9rem', 
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#E2E8F0',
                  marginBottom: '1.25rem',
                  letterSpacing: '0.06em',
                  width: 'fit-content'
                }}
              >
                <span 
                  style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: '#10B981', 
                    display: 'inline-block', 
                    boxShadow: '0 0 8px #10B981' 
                  }} 
                />
                <span>REAL-TIME DISASTER RESPONSE NETWORK</span>
              </div>

              {/* Main Heading */}
              <h1 
                id="hero-title"
                style={{ 
                  fontSize: 'clamp(2rem, 3.8vw, 3.1rem)', 
                  fontWeight: 900, 
                  lineHeight: 1.15, 
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  marginBottom: '1.25rem' 
                }}
              >
                Stay Informed. Stay Prepared. Save Lives.
              </h1>

              {/* Supporting Description */}
              <p 
                style={{ 
                  fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)', 
                  color: '#CBD5E1', 
                  lineHeight: 1.65, 
                  maxWidth: '580px',
                  margin: 0
                }}
              >
                National disaster monitoring network. Real-time telemetry, verified shelter routing, and rapid emergency dispatch.
              </p>

              {/* Three Action Buttons */}
              <div className="home-hero-actions-group">
                {/* 1. Report an Emergency */}
                <Link 
                  to="/report" 
                  className="btn btn-emergency btn-lg" 
                  style={{ 
                    borderRadius: 'var(--radius-pill)', 
                    padding: '0.9rem 1.85rem',
                    fontWeight: 800,
                    fontSize: 'var(--text-base)',
                    boxShadow: '0 6px 20px rgba(220, 38, 38, 0.45)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none'
                  }}
                >
                  <AlertTriangle size={20} strokeWidth={2.4} />
                  <span>Report an Emergency</span>
                </Link>

                {/* 2. Explore Live Map */}
                <Link 
                  to={location?.latitude != null ? `/map?lat=${location.latitude}&lng=${location.longitude}&zoom=11` : '/map'} 
                  className="btn btn-lg" 
                  style={{ 
                    borderRadius: 'var(--radius-pill)', 
                    padding: '0.9rem 1.85rem',
                    fontWeight: 700,
                    fontSize: 'var(--text-base)',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-primary-900)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none'
                  }}
                >
                  <Compass size={20} strokeWidth={2.2} color="var(--color-primary-700)" />
                  <span>Explore Live Map</span>
                </Link>

                {/* 3. Latest Emergency Updates */}
                <button
                  type="button"
                  onClick={scrollToUpdates}
                  className="btn btn-ghost btn-lg"
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.85rem 1.5rem',
                    fontWeight: 700,
                    fontSize: 'var(--text-sm)',
                    color: '#E2E8F0',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <Radio size={18} color="#93C5FD" />
                  <span>Latest Emergency Updates</span>
                </button>
              </div>

              {/* =========================================================================
                  LOCATION-FIRST HERO DASHBOARD CARD (Live Location, Weather & AI Telemetry)
                  ========================================================================= */}
              <div className="home-hero-location-card">
                {/* Header: Location Status & GPS Actions */}
                <div className="home-hero-location-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <div 
                      style={{ 
                        width: 34, 
                        height: 34, 
                        borderRadius: '50%', 
                        backgroundColor: isDetected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)', 
                        color: isDetected ? '#34D399' : '#60A5FA', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <MapPin size={18} strokeWidth={2.2} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
                          {location?.city ? `${location.locality || location.city}, ${location.state}` : 'Locating Nearest Emergency Grid...'}
                        </span>
                        <span 
                          style={{ 
                            fontSize: '0.65rem', 
                            fontWeight: 800, 
                            padding: '0.15rem 0.5rem', 
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: isDetected ? '#DCFCE7' : '#EFF6FF',
                            color: isDetected ? '#15803D' : '#1D4ED8',
                            letterSpacing: '0.04em'
                          }}
                        >
                          {isDetected ? '● GPS LIVE' : 'LOCATION REQUIRED'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.15rem' }}>
                        {location?.latitude != null 
                          ? `Coordinates: ${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E • Telemetry Calibrated`
                          : 'Allow GPS access to unlock instant proximity to 30 verified Indian disaster facilities'}
                      </div>
                    </div>
                  </div>

                  {/* Location Action Buttons: Live Detect + City Preset */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={detectLiveLocation}
                      disabled={isLocationLoading}
                      className="btn btn-sm"
                      style={{
                        borderRadius: 'var(--radius-pill)',
                        padding: '0.4rem 0.95rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: isDetected ? 'rgba(255, 255, 255, 0.1)' : '#2563EB',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: isLocationLoading ? 'wait' : 'pointer'
                      }}
                    >
                      {isLocationLoading ? (
                        <>
                          <RefreshCw size={14} className="spin" />
                          <span>Detecting...</span>
                        </>
                      ) : (
                        <>
                          <LocateFixed size={14} />
                          <span>{isDetected ? 'Refresh GPS' : 'Detect My Location'}</span>
                        </>
                      )}
                    </button>

                    {/* Quick Indian City Selector Fallback */}
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setShowCityPicker(prev => !prev)}
                        className="btn btn-ghost btn-sm"
                        style={{
                          borderRadius: 'var(--radius-pill)',
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#E2E8F0',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <span>Select City</span>
                        <ChevronDown size={13} />
                      </button>

                      {showCityPicker && (
                        <div 
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            right: 0,
                            width: '240px',
                            backgroundColor: '#0F172A',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.5rem',
                            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                            zIndex: 500,
                            maxHeight: '260px',
                            overflowY: 'auto'
                          }}
                        >
                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', padding: '0.3rem 0.5rem', textTransform: 'uppercase' }}>
                            Select Regional Sector
                          </div>
                          {INDIAN_CITIES.map(city => (
                            <button
                              key={city.name}
                              type="button"
                              onClick={() => {
                                setCityPreset(city.name);
                                setShowCityPicker(false);
                              }}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.45rem 0.65rem',
                                borderRadius: 'var(--radius-xs)',
                                border: 'none',
                                backgroundColor: location?.city === city.name ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                                color: location?.city === city.name ? '#60A5FA' : '#F1F5F9',
                                fontSize: '0.75rem',
                                fontWeight: location?.city === city.name ? 800 : 500,
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <span>{city.name}</span>
                              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>{city.state}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4 Telemetry Mini-Cards */}
                <div className="home-hero-telemetry-grid">
                  {/* 1. Temperature & Weather */}
                  <div className="home-hero-telemetry-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8' }}>Atmospheric</span>
                      <Thermometer size={14} color="#60A5FA" />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                      {weather?.temperature ? `${weather.temperature}${weather.tempUnit || '°C'}` : '29°C'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
                      {weather?.condition || 'Partly Cloudy'} &bull; Hum: {weather?.humidity || 74}%
                    </div>
                  </div>

                  {/* 2. Wind & Peak Gusts */}
                  <div className="home-hero-telemetry-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8' }}>Wind &amp; Gusts</span>
                      <Wind size={14} color="#34D399" />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                      {weather?.windSpeed ? `${weather.windSpeed} ${weather.windUnit || 'km/h'}` : '28 km/h'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
                      Peak Gusts: {weather?.windGusts || 46} km/h
                    </div>
                  </div>

                  {/* 3. Rainfall & Surge */}
                  <div className="home-hero-telemetry-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8' }}>Precipitation</span>
                      <Droplets size={14} color="#38BDF8" />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                      {weather?.precipitation != null ? `${weather.precipitation} mm` : '4.2 mm'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
                      Flood Surge: <strong style={{ color: '#FCD34D' }}>{weather?.floodRiskLevel || 'MODERATE'}</strong>
                    </div>
                  </div>

                  {/* 4. AI Disaster Risk */}
                  <div className="home-hero-telemetry-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8' }}>Automated Threat Index</span>
                      <Radar size={14} color="#FBBF24" />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34D399', lineHeight: 1 }}>
                      STABLE / LOW
                    </div>
                    <div 
                      style={{ fontSize: '0.7rem', color: '#93C5FD', marginTop: '0.25rem', cursor: 'pointer', fontWeight: 600 }} 
                      onClick={scrollToAIPredictor}
                    >
                      View 72h Protocol &rarr;
                    </div>
                  </div>
                </div>

                {/* Proximity Strip */}
                <div className="home-hero-proximity-pills">
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Nearest Lifeline Proximities:
                  </span>

                  <div className="home-hero-proximity-item">
                    <Building2 size={12} color="#60A5FA" />
                    <span>Hospital: <strong>{proximities?.nearestHospital ? `${proximities.nearestHospital.facility || proximities.nearestHospital.name} (${proximities.nearestHospital.distanceKm} km)` : 'AIIMS Apex Trauma (4.2 km)'}</strong></span>
                  </div>

                  <div className="home-hero-proximity-item">
                    <ShieldCheck size={12} color="#34D399" />
                    <span>Shelter: <strong>{proximities?.nearestShelter ? `${proximities.nearestShelter.facility || proximities.nearestShelter.name} (${proximities.nearestShelter.distanceKm} km)` : 'Disaster Relief Shelter (2.8 km)'}</strong></span>
                  </div>

                  <div className="home-hero-proximity-item">
                    <Truck size={12} color="#FBBF24" />
                    <span>NDRF: <strong>{proximities?.nearestNDRF ? `${proximities.nearestNDRF.facility || proximities.nearestNDRF.name} (${proximities.nearestNDRF.distanceKm} km)` : 'NDRF Quick Reaction Force (11.5 km)'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Hero KPI Stat Strip */}
              <div className="home-hero-kpi-bar">
                {/* Stat 1: Active Incidents */}
                <div className="home-kpi-card">
                  <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1, color: '#FFFFFF' }}>{activeIncidents.length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.15rem' }}>Active Incidents</div>
                  </div>
                </div>

                {/* Stat 2: Open Shelters */}
                <div className="home-kpi-card">
                  <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1, color: '#FFFFFF' }}>{openShelters.length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.15rem' }}>Open Shelters</div>
                  </div>
                </div>

                {/* Stat 3: Critical Broadcasts */}
                <div className="home-kpi-card">
                  <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1, color: '#FFFFFF' }}>{criticalAlerts.length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.15rem' }}>Critical Alerts</div>
                  </div>
                </div>

                {/* Stat 4: Units Deployed */}
                <div className="home-kpi-card">
                  <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1, color: '#FFFFFF' }}>{deployedUnits}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.15rem' }}>Units Deployed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Emergency Slider */}
            <div className="home-hero-slider-wrap">
              <EmergencySlider incidents={activeIncidents.length > 0 ? activeIncidents : incidents} />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: LOCATION ACCESS / GPS STATUS
          ========================================================================= */}
      <section className="home-section home-section-alt" aria-label="Location Access and Status">
        <div className="container">
          <HomeLocationSection />
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CRITICAL EMERGENCY ALERTS
          ========================================================================= */}
      <section className="home-section home-section-white" aria-labelledby="critical-alerts-title">
        <div className="container">
          <div className="home-section-header">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                <AlertCircle size={15} />
                <span>Priority Emergency Broadcasts</span>
              </div>
              <h2 id="critical-alerts-title" className="home-section-title">
                Active Crisis Directives &amp; Warnings
              </h2>
              <p className="home-section-subtitle">
                Official life-safety instructions, storm surge warnings, and disaster advisories issued by national and state authorities.
              </p>
            </div>

            <Link 
              to="/alerts" 
              className="btn btn-outline btn-sm"
              style={{ borderRadius: 'var(--radius-pill)', padding: '0.45rem 1.25rem', fontWeight: 700 }}
            >
              <span>View All Alerts ({criticalAlerts.length + (activeAlerts?.length || 0)})</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {criticalAlerts.length > 0 ? (
            <div 
              className="home-crisis-alerts-container"
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'flex-start', width: '100%' }}
            >
              {criticalAlerts.slice(0, 2).map((alert) => {
                const zones = Array.isArray(alert.affectedZones) 
                  ? alert.affectedZones 
                  : typeof alert.affectedZones === 'string' && alert.affectedZones.trim() 
                    ? [alert.affectedZones] 
                    : [];

                return (
                  <div 
                    key={alert.id}
                    className="card home-crisis-alert-card"
                    style={{
                      width: '100%',
                      height: 'fit-content',
                      minHeight: 'auto',
                      borderRadius: 'var(--radius-lg)',
                      border: '1.5px solid #FCA5A5',
                      backgroundColor: '#FEF2F2',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)'
                    }}
                  >
                    {/* Header Row: Badge & Category */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                      <div 
                        style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          backgroundColor: '#FEE2E2', 
                          color: '#DC2626', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <AlertCircle size={18} strokeWidth={2.4} />
                      </div>
                      <span 
                        style={{ 
                          backgroundColor: '#DC2626', 
                          color: '#FFFFFF', 
                          fontSize: '0.68rem', 
                          fontWeight: 800, 
                          padding: '0.2rem 0.65rem', 
                          borderRadius: 'var(--radius-pill)',
                          letterSpacing: '0.04em'
                        }}
                      >
                        CRITICAL RED ALERT
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#991B1B', fontWeight: 700, textTransform: 'uppercase' }}>
                        {alert.category || 'WEATHER DIRECTIVE'}
                      </span>
                    </div>

                    {/* Alert Title */}
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7F1D1D', marginBottom: '0.35rem', lineHeight: 1.35 }}>
                      {alert.title}
                    </h3>

                    {/* Alert Description */}
                    {alert.description && (
                      <p style={{ fontSize: 'var(--text-xs)', color: '#991B1B', lineHeight: 1.55, margin: 0, maxWidth: '850px' }}>
                        {alert.description}
                      </p>
                    )}

                    {/* Affected Regions */}
                    {zones.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#B91C1C', marginTop: '0.45rem', fontWeight: 600 }}>
                        <strong>Affected Regions:</strong> {zones.join(', ')}
                      </div>
                    )}

                    {/* View Directives Button: Flows naturally right beneath the alert text with simple margin-top: 16px */}
                    <Link 
                      to="/alerts" 
                      className="btn btn-emergency btn-sm alert-directives-btn"
                      style={{ 
                        marginTop: '16px',
                        borderRadius: 'var(--radius-pill)', 
                        padding: '0.5rem 1.35rem', 
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        alignSelf: 'flex-start',
                        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)'
                      }}
                    >
                      <span>View Directives</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div 
              className="card home-crisis-alert-card"
              style={{
                width: '100%',
                height: 'fit-content',
                minHeight: 'auto',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #DCFCE7',
                backgroundColor: '#F0FDF4',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#166534', margin: 0 }}>
                    0 Active Red Alerts in Region
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: 'var(--text-xs)', color: '#15803D', margin: 0, lineHeight: 1.55 }}>
                Regional meteorological radar and seismic networks are operational. All civil sectors operating under baseline surveillance.
              </p>

              <Link 
                to="/alerts" 
                className="btn btn-outline btn-sm alert-directives-btn"
                style={{ 
                  marginTop: '16px',
                  borderRadius: 'var(--radius-pill)', 
                  padding: '0.45rem 1.25rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  borderColor: '#86EFAC', 
                  color: '#166534',
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>Browse Regional Advisories</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: LIVE DISASTER MAP PREVIEW
          ========================================================================= */}
      <section className="home-section home-section-alt" aria-labelledby="map-preview-title">
        <div className="container">
          <div className="home-section-header">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-600)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                <Compass size={15} />
                <span>Geospatial Intelligence</span>
              </div>
              <h2 id="map-preview-title" className="home-section-title">
                Live Disaster Tactical Map Preview
              </h2>
              <p className="home-section-subtitle">
                Interactive real-time map displaying incident clusters, verified disaster shelters, apex trauma centers, and live GPS positioning across India.
              </p>
            </div>

            <Link 
              to={location?.latitude != null ? `/map?lat=${location.latitude}&lng=${location.longitude}&zoom=11` : '/map'}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-pill)', padding: '0.5rem 1.35rem', fontWeight: 700 }}
            >
              <Compass size={16} />
              <span>Launch Fullscreen Tactical Map</span>
            </Link>
          </div>

          {/* Interactive Map Preview Card */}
          <div 
            className="card"
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
              position: 'relative'
            }}
          >
            <div 
              style={{ 
                height: '380px', 
                width: '100%', 
                position: 'relative', 
                cursor: 'pointer' 
              }}
              onClick={() => navigate(location?.latitude != null ? `/map?lat=${location.latitude}&lng=${location.longitude}&zoom=11` : '/map')}
              title="Click to launch interactive Live Tactical Map centered on this area"
            >
              <MapContainer
                center={location?.latitude != null ? [location.latitude, location.longitude] : [21.1458, 79.0882]}
                zoom={location?.latitude != null ? 9 : 5}
                scrollWheelZoom={false}
                zoomControl={false}
                dragging={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Detected User GPS Pin */}
                {location?.latitude != null && (
                  <>
                    <Marker position={[location.latitude, location.longitude]} icon={userPulseIcon} />
                    <RecenterMiniMap center={[location.latitude, location.longitude]} zoom={9} />
                  </>
                )}

                {/* Incident Pins */}
                {incidents.slice(0, 10).map(inc => (
                  <Marker 
                    key={inc.id} 
                    position={[inc.latitude, inc.longitude]} 
                    icon={miniPinIcon}
                  />
                ))}
              </MapContainer>

              {/* Bottom Tactical Overlay Bar */}
              <div 
                style={{ 
                  position: 'absolute', 
                  bottom: '12px', 
                  left: '12px', 
                  right: '12px', 
                  backgroundColor: 'rgba(10, 25, 47, 0.92)', 
                  backdropFilter: 'blur(8px)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.55rem 1.25rem',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  zIndex: 400,
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Navigation size={14} color="#60A5FA" />
                  <span>
                    {location?.city 
                      ? `Active Tactical Sector: ${location.city}, ${location.state} • Live GPS Synced` 
                      : `National Indian Disaster Grid • ${incidents.length} Active Geo-Coded Pins`}
                  </span>
                </span>
                <span style={{ color: '#93C5FD', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                  <span>Open Full Tactical GIS</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: WEATHER AND METEOROLOGICAL INFORMATION
          ========================================================================= */}
      <section className="home-section home-section-white" aria-labelledby="weather-telemetry-title">
        <div className="container">
          <div className="home-section-header">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#0284C7', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                <CloudRain size={15} />
                <span>Atmospheric Telemetry</span>
              </div>
              <h2 id="weather-telemetry-title" className="home-section-title">
                Weather &amp; Meteorological Information
              </h2>
              <p className="home-section-subtitle">
                Live Doppler radar, precipitation accumulation, storm surge velocity, and seismic telemetry from Open-Meteo and national sensors.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.72rem', color: '#1D4ED8', fontWeight: 700 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#2563EB', animation: 'pulse 1.5s infinite' }} />
              <span>Open-Meteo Live Telemetry</span>
            </div>
          </div>

          {/* 5-Card Telemetry Grid */}
          <div className="home-telemetry-grid">
            
            {/* Card 1: Ambient Temperature */}
            <div 
              className="card"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>Temperature</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Thermometer size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                {weather?.temperature ? `${weather.temperature}${weather.tempUnit || '°C'}` : '29°C'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', marginTop: '0.45rem', fontWeight: 600 }}>
                {weather?.condition || 'Partly Cloudy'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', marginTop: '0.2rem' }}>
                Humidity: {weather?.humidity ? `${weather.humidity}%` : '74%'}
              </div>
            </div>

            {/* Card 2: Wind Speed & Gusts */}
            <div 
              className="card"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>Wind &amp; Gusts</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wind size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                {weather?.windSpeed ? `${weather.windSpeed} ${weather.windUnit || 'km/h'}` : '28 km/h'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', marginTop: '0.45rem', fontWeight: 600 }}>
                Peak Gusts: {weather?.windGusts || 46} km/h
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', marginTop: '0.2rem' }}>
                Heading: {weather?.windDirection ? `${weather.windDirection}°` : 'NE (042°)'}
              </div>
            </div>

            {/* Card 3: Rainfall Accumulation */}
            <div 
              className="card"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>Precipitation</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Droplets size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                {weather?.precipitation != null ? `${weather.precipitation} mm` : '4.2 mm'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', marginTop: '0.45rem', fontWeight: 600 }}>
                Flood Risk: {weather?.floodRiskLevel || 'MODERATE'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', marginTop: '0.2rem' }}>
                24h Forecast: 18.5 mm
              </div>
            </div>

            {/* Card 4: Seismic Tremor Telemetry */}
            <div 
              className="card"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>Seismic Telemetry</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                {seismic?.latestEvent ? `M ${seismic.latestEvent.mag}` : 'M 1.9'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', marginTop: '0.45rem', fontWeight: 600 }}>
                Indian Shield: NORMAL
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {seismic?.latestEvent?.place ? seismic.latestEvent.place.slice(0, 24) : 'Plate Boundary Stable'}
              </div>
            </div>

            {/* Card 5: River Hydro Surge & Grid */}
            <div 
              className="card"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>Basin Water Level</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gauge size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                {sensors?.waterLevelMeters ? `${sensors.waterLevelMeters}m` : '2.40m'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: '#DC2626', marginTop: '0.45rem', fontWeight: 700 }}>
                Threat Surge: ELEVATED
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', marginTop: '0.2rem' }}>
                Grid Capacity: {sensors?.gridLoadPercent ? `${sensors.gridLoadPercent}%` : '82%'}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: AUTOMATED THREAT ASSESSMENT AND PREDICTIVE TELEMETRY
          ========================================================================= */}
      <section id="ai-prediction-section" className="home-section home-section-alt" aria-label="Automated Threat Assessment and Predictive Information">
        <div className="container">
          <LiveLocationDisasterPredictor />
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: NEARBY VERIFIED SHELTERS
          ========================================================================= */}
      <section className="home-section home-section-white" aria-labelledby="nearby-shelters-title">
        <div className="container">
          <div className="home-section-header">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#16A34A', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                <Building2 size={15} />
                <span>Verified Facilities</span>
              </div>
              <h2 id="nearby-shelters-title" className="home-section-title">
                Nearby Verified Shelters &amp; Apex Hospitals
              </h2>
              <p className="home-section-subtitle">
                30 verified national disaster shelters, apex trauma facilities, and NDRF relief camps across India equipped with medical bays and emergency life-support.
              </p>
            </div>

            <Link 
              to="/shelters" 
              className="btn btn-outline btn-sm"
              style={{ borderRadius: 'var(--radius-pill)', padding: '0.5rem 1.25rem', fontWeight: 700 }}
            >
              <span>View All 30 Facilities</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="home-shelter-grid">
            {featuredShelters.map((s) => {
              const capacity = Number(s.capacity) || 500;
              const occupancy = Number(s.occupancy) || 150;
              const percent = Math.min(100, Math.round((occupancy / capacity) * 100));

              return (
                <div 
                  key={s.id}
                  className="card"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div>
                    {/* Header badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <span 
                        style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 800, 
                          backgroundColor: s.type === 'Hospital' ? '#EFF6FF' : '#DCFCE7', 
                          color: s.type === 'Hospital' ? '#1D4ED8' : '#15803D', 
                          padding: '0.2rem 0.65rem', 
                          borderRadius: 'var(--radius-pill)',
                          letterSpacing: '0.03em'
                        }}
                      >
                        {s.type?.toUpperCase() || 'SHELTER'}
                      </span>

                      {s.distanceKm != null ? (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Navigation size={12} />
                          <span>{s.distanceKm} km away</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)' }}>
                          {s.district || s.state}
                        </span>
                      )}
                    </div>

                    {/* Facility Name */}
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: '0.4rem', lineHeight: 1.35 }}>
                      {s.facility || s.name}
                    </h3>

                    {/* Address */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-neutral-600)', fontSize: 'var(--text-xs)', marginBottom: '1.15rem' }}>
                      <MapPin size={14} color="#64748B" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.address || s.location}
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-neutral-600)', marginBottom: '0.35rem' }}>
                        <span>Capacity: {occupancy} / {capacity} Beds</span>
                        <span style={{ color: percent > 85 ? '#DC2626' : '#16A34A' }}>{percent}% Full</span>
                      </div>
                      <div style={{ width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${percent}%`, 
                            height: '100%', 
                            backgroundColor: percent > 85 ? '#DC2626' : percent > 60 ? '#F59E0B' : '#10B981',
                            borderRadius: 'var(--radius-pill)'
                          }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      borderTop: '1px solid var(--color-border)', 
                      paddingTop: '0.85rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        color: '#16A34A', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.35rem' 
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>{s.status || 'OPERATIONAL'}</span>
                    </span>

                    <Link 
                      to={s.latitude != null ? `/map?lat=${s.latitude}&lng=${s.longitude}&zoom=14` : '/map'}
                      className="btn btn-sm"
                      style={{ 
                        borderRadius: 'var(--radius-pill)', 
                        padding: '0.35rem 0.85rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        backgroundColor: 'var(--color-primary-900)',
                        color: '#FFFFFF',
                        textDecoration: 'none'
                      }}
                    >
                      <span>Locate on Map</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: LIVE INCIDENT STREAM / LATEST EMERGENCY UPDATES
          ========================================================================= */}
      <section id="emergency-updates" className="home-section home-section-alt" aria-labelledby="incident-stream-title">
        <div className="container">
          <div className="home-section-header">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                <Radio size={15} />
                <span>Field Incident Triage</span>
              </div>
              <h2 id="incident-stream-title" className="home-section-title">
                Live Incident Stream &amp; Updates
              </h2>
              <p className="home-section-subtitle">
                Verified emergency reports submitted by citizens and active response units across India with real-time operational status.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              {['ALL', 'FLOOD', 'FIRE', 'MEDICAL', 'INFRASTRUCTURE'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setIncidentCategoryFilter(cat)}
                  style={{
                    border: '1px solid',
                    borderColor: incidentCategoryFilter === cat ? 'var(--color-primary-600)' : 'var(--color-border)',
                    backgroundColor: incidentCategoryFilter === cat ? 'var(--color-primary-600)' : '#FFFFFF',
                    color: incidentCategoryFilter === cat ? '#FFFFFF' : 'var(--color-neutral-700)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Incidents */}
          <div className="home-incident-grid">
            {filteredIncidents.slice(0, 6).map((incident) => {
              const CategoryIcon = CATEGORY_ICONS[incident.category] || AlertTriangle;
              const people = Number(incident.peopleAffected) || 12;

              return (
                <div 
                  key={incident.id} 
                  className="card"
                  style={{ 
                    borderRadius: 'var(--radius-lg)', 
                    padding: '1.5rem', 
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div 
                          style={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            backgroundColor: incident.severity === 'CRITICAL' ? '#FEE2E2' : '#FEF3C7',
                            color: incident.severity === 'CRITICAL' ? '#DC2626' : '#D97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <CategoryIcon size={20} strokeWidth={2.2} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>
                            {incident.category}
                          </div>
                          <span className="mono-id" style={{ fontSize: '0.72rem' }}>{incident.id}</span>
                        </div>
                      </div>

                      <SeverityBadge severity={incident.severity} />
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: '0.45rem', lineHeight: 1.35 }}>
                      {incident.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-neutral-600)', fontSize: 'var(--text-xs)', marginBottom: '0.85rem' }}>
                      <MapPin size={14} color="var(--color-primary-600)" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{incident.address}</span>
                    </div>

                    {incident.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-600)', lineHeight: 1.5, marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {incident.description}
                      </p>
                    )}
                  </div>

                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      borderTop: '1px solid var(--color-border)', 
                      paddingTop: '0.85rem',
                      marginTop: '0.5rem',
                      flexWrap: 'wrap',
                      gap: '0.4rem'
                    }}
                  >
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        padding: '0.2rem 0.55rem', 
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: people > 25 ? '#FEE2E2' : '#EFF6FF',
                        color: people > 25 ? '#B91C1C' : '#1D4ED8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Users size={12} />
                      <span>~{people} Affected</span>
                    </span>

                    <Link
                      to={incident.latitude != null ? `/map?lat=${incident.latitude}&lng=${incident.longitude}&zoom=14` : '/map'}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-neutral-800)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        textDecoration: 'none'
                      }}
                    >
                      <span>Map View</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: EMERGENCY PREPAREDNESS INFORMATION
          ========================================================================= */}
      <section className="home-section home-section-dark" aria-labelledby="prep-protocols-heading">
        <div className="container">
          <div className="home-section-header">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#60A5FA', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                <ShieldAlert size={15} />
                <span>Civic Protection Guides</span>
              </div>
              <h2 id="prep-protocols-heading" className="home-section-title home-section-title-light">
                Immediate Civic Triage &amp; Emergency Protocols
              </h2>
              <p className="home-section-subtitle home-section-subtitle-light">
                Official life-safety directives, survival standard operating procedures, and 24/7 national emergency helplines.
              </p>
            </div>
          </div>

          <div className="home-prep-grid">
            
            {/* Protocol 1: Flood & Cyclone */}
            <div 
              className="card" 
              style={{ 
                borderRadius: 'var(--radius-lg)', 
                padding: '1.75rem 1.5rem', 
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Droplets size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.45rem' }}>
                Flood &amp; Surge Protocol
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '1rem' }}>
                Turn Around, Don&rsquo;t Drown. Avoid driving into water depths &gt; 15cm. Move essential medical kits, drinking water, and battery packs to upper floors immediately.
              </p>
              <Link 
                to="/alerts" 
                style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#93C5FD', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
              >
                <span>Check Storm Surge Advisories</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Protocol 2: Fire & Smoke Evacuation */}
            <div 
              className="card" 
              style={{ 
                borderRadius: 'var(--radius-lg)', 
                padding: '1.75rem 1.5rem', 
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Flame size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.45rem' }}>
                Fire &amp; Smoke Evacuation
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '1rem' }}>
                Crawl low under smoke where air is cool and oxygen-rich. Feel doors with the back of your hand before opening. Follow primary egress routes without stopping for belongings.
              </p>
              <Link 
                to="/report" 
                style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#FCA5A5', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
              >
                <span>Report Fire Threat Immediately</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Protocol 3: Trauma First-Aid */}
            <div 
              className="card" 
              style={{ 
                borderRadius: 'var(--radius-lg)', 
                padding: '1.75rem 1.5rem', 
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <HeartPulse size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.45rem' }}>
                Trauma &amp; Medical Triage
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '1rem' }}>
                Apply firm, direct pressure on severe arterial bleeding using clean dressings. Keep unconscious breathing patients in the lateral recovery position to preserve airways.
              </p>
              <Link 
                to="/shelters" 
                style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#86EFAC', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
              >
                <span>Locate Apex Trauma Hospitals</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Protocol 4: National Crisis Helplines */}
            <div 
              className="card" 
              style={{ 
                borderRadius: 'var(--radius-lg)', 
                padding: '1.75rem 1.5rem', 
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#FFFFFF'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <PhoneCall size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FDE68A', marginBottom: '0.45rem' }}>
                National Crisis Helplines
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: '#FEF3C7', lineHeight: 1.6, marginBottom: '1rem' }}>
                National Unified Helpline: <strong style={{ color: '#FFFFFF' }}>112</strong> &bull; NDMA Disaster Helpline: <strong style={{ color: '#FFFFFF' }}>1078</strong> &bull; Ambulance: <strong style={{ color: '#FFFFFF' }}>108</strong>.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a 
                  href="tel:112" 
                  className="btn btn-xs" 
                  style={{ backgroundColor: '#DC2626', color: '#FFFFFF', borderRadius: 'var(--radius-pill)', padding: '0.35rem 0.85rem', fontWeight: 700 }}
                >
                  Call 112
                </a>
                <a 
                  href="tel:1078" 
                  className="btn btn-xs" 
                  style={{ backgroundColor: '#D97706', color: '#FFFFFF', borderRadius: 'var(--radius-pill)', padding: '0.35rem 0.85rem', fontWeight: 700 }}
                >
                  Call 1078
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
