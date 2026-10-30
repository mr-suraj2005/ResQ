import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { useUserLocation } from '../../context/LocationContext';
import { liveTelemetryService } from '../../services/liveTelemetryService';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LiveLocationDisasterPredictor } from '../../components/ai/LiveLocationDisasterPredictor';
import { HomeLocationSection } from '../../components/home/HomeLocationSection';
import { 
  AlertTriangle, 
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
  ExternalLink,
  Sparkles
} from 'lucide-react';

// Custom mini circular map pin
const miniPinIcon = L.divIcon({
  className: 'mini-map-pin',
  html: `<div style="width: 14px; height: 14px; background: #DC2626; border: 2px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 6px rgba(220, 38, 38, 0.8);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// User location pulsating marker for mini preview
const userPulseIcon = L.divIcon({
  className: 'mini-user-pulse-pin',
  html: `<div style="position: relative; width: 18px; height: 18px;">
    <div style="position: absolute; inset: -5px; border-radius: 50%; background: rgba(37, 99, 235, 0.4); animation: pulse 1.5s infinite;"></div>
    <div style="width: 18px; height: 18px; background: #2563EB; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 10px #2563EB;"></div>
  </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
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
  const { location, isDetected } = useUserLocation();
  const { 
    incidents, 
    activeIncidents, 
    openShelters, 
    criticalAlerts, 
    deployedUnits 
  } = useEmergencyData();

  const [weather, setWeather] = useState(null);
  const [seismic, setSeismic] = useState(null);
  const [sensors, setSensors] = useState(null);

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

  // Visual feed: Top 3 active incidents
  const visualFeed = incidents
    .filter(inc => inc.status !== 'REJECTED')
    .slice(0, 3);

  return (
    <div className="container page-container" style={{ paddingTop: '1rem', paddingBottom: '3.5rem' }}>
      
      {/* =========================================================================
          LOCATION-FIRST EXPERIENCE: Prominent location access section at the very top
          ========================================================================= */}
      <HomeLocationSection />

      {/* =========================================================================
          HERO SPLIT VIEW: Left (Headline & KPIs) + Right (Mini Map & Telemetry)
          ========================================================================= */}
      <section 
        className="home-hero-section"
        aria-labelledby="hero-title"
      >
        {/* Left Column */}
        <div className="home-hero-left">
          <div>
            {/* Status Badge */}
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              padding: '0.3rem 0.85rem', 
              borderRadius: 'var(--radius-pill)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: '#E2E8F0',
              marginBottom: '1rem',
              letterSpacing: '0.04em'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }}></span>
              <span>OFFICIAL CRISIS NETWORK &bull; INDIA NATIONAL HUB</span>
            </div>

            {/* Bold Single-Line Headline */}
            <h1 
              id="hero-title"
              style={{ 
                fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', 
                fontWeight: 900, 
                lineHeight: 1.15, 
                color: '#FFFFFF',
                letterSpacing: '-0.025em',
                marginBottom: '1.25rem' 
              }}
            >
              Real-Time Disaster Response &amp; Relief Hub
            </h1>

            {/* 2 Oversized Pill Action Buttons */}
            <div className="home-hero-actions">
              <Link 
                to="/report" 
                className="btn btn-emergency btn-lg" 
                style={{ 
                  borderRadius: 'var(--radius-pill)', 
                  padding: '0.85rem 1.75rem',
                  fontWeight: 700,
                  fontSize: 'var(--text-base)',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
                }}
              >
                <AlertTriangle size={20} strokeWidth={2.4} />
                <span>Report Emergency</span>
              </Link>

              <Link 
                to={location?.latitude != null ? `/map?lat=${location.latitude}&lng=${location.longitude}&zoom=11` : '/map'} 
                className="btn btn-primary btn-lg" 
                style={{ 
                  borderRadius: 'var(--radius-pill)', 
                  padding: '0.85rem 1.75rem',
                  fontWeight: 700,
                  fontSize: 'var(--text-base)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary-900)',
                  border: '1px solid rgba(255, 255, 255, 0.25)'
                }}
              >
                <Compass size={20} strokeWidth={2} />
                <span>Open Live Map</span>
              </Link>
            </div>
          </div>

          {/* 4 Circular KPI Stat Cards */}
          <div className="home-hero-kpi-grid">
            {/* KPI 1 */}
            <div 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.06)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{activeIncidents.length}</div>
                <div style={{ fontSize: '0.72rem', color: '#CBD5E1', marginTop: '0.15rem' }}>Active Incidents</div>
              </div>
            </div>

            {/* KPI 2 */}
            <div 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.06)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{openShelters.length}</div>
                <div style={{ fontSize: '0.72rem', color: '#CBD5E1', marginTop: '0.15rem' }}>Open Shelters</div>
              </div>
            </div>

            {/* KPI 3 */}
            <div 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.06)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldAlert size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{criticalAlerts.length}</div>
                <div style={{ fontSize: '0.72rem', color: '#CBD5E1', marginTop: '0.15rem' }}>Critical Broadcasts</div>
              </div>
            </div>

            {/* KPI 4 */}
            <div 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.06)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Truck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{deployedUnits}</div>
                <div style={{ fontSize: '0.72rem', color: '#CBD5E1', marginTop: '0.15rem' }}>Units Deployed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mini Map & Telemetry Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0, width: '100%' }}>
          {/* Mini Interactive Map Preview */}
          <div 
            className="map-picker-wrapper"
            style={{ 
              height: '210px', 
              borderRadius: 'var(--radius-lg)', 
              overflow: 'hidden', 
              border: '1px solid var(--color-border)',
              position: 'relative',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer'
            }}
            onClick={() => navigate(location?.latitude != null ? `/map?lat=${location.latitude}&lng=${location.longitude}&zoom=11` : '/map')}
            title="Click to launch interactive Live Threat Map centered on this area"
          >
            <MapContainer
              center={location?.latitude != null ? [location.latitude, location.longitude] : [21.1458, 79.0882]}
              zoom={location?.latitude != null ? 8 : 4}
              scrollWheelZoom={false}
              zoomControl={false}
              dragging={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {location?.latitude != null && (
                <>
                  <Marker position={[location.latitude, location.longitude]} icon={userPulseIcon} />
                  <RecenterMiniMap center={[location.latitude, location.longitude]} zoom={8} />
                </>
              )}
              {incidents.slice(0, 6).map(inc => (
                <Marker 
                  key={inc.id} 
                  position={[inc.latitude, inc.longitude]} 
                  icon={miniPinIcon}
                />
              ))}
            </MapContainer>

            {/* Overlay Banner */}
            <div 
              style={{ 
                position: 'absolute', 
                bottom: '10px', 
                left: '10px', 
                right: '10px', 
                backgroundColor: 'rgba(10, 25, 47, 0.9)', 
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.45rem 1rem',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                zIndex: 400
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Compass size={14} color="#60A5FA" />
                <span>
                  {location?.city 
                    ? `Active Area: ${location.city} • Localized Threat Telemetry` 
                    : `Live Tactical GIS • ${incidents.length} Mapped India Pins`}
                </span>
              </span>
              <span style={{ color: '#93C5FD', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Explore Map &rarr;
              </span>
            </div>
          </div>

          {/* AI Risk & Weather Telemetry Widget */}
          <div 
            className="card" 
            style={{ 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.25rem', 
              border: '1px solid #C7D2FE',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-xs)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Sparkles size={16} color="var(--color-primary-600)" />
                <span style={{ fontWeight: 800, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-primary-900)' }}>
                  AI Risk &amp; Real-Time Telemetry
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#15803D', fontWeight: 600, backgroundColor: '#DCFCE7', padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-pill)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#15803D' }}></span>
                <span>Live Stream Active</span>
              </div>
            </div>

            {/* Environmental Metric Badges */}
            <div className="home-telemetry-metrics">
              {/* Wind */}
              <div style={{ backgroundColor: 'var(--color-neutral-50)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: 'var(--color-primary-700)', fontSize: '0.7rem', fontWeight: 600 }}>
                  <Wind size={12} />
                  <span>Wind</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: '#0F172A', marginTop: '0.15rem' }}>
                  {weather ? `${weather.windSpeed} ${weather.windUnit}` : '28 km/h'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
                  Gusts {weather?.windGusts || 46} km/h
                </div>
              </div>

              {/* Precipitation */}
              <div style={{ backgroundColor: 'var(--color-neutral-50)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: '#0284C7', fontSize: '0.7rem', fontWeight: 600 }}>
                  <Droplets size={12} />
                  <span>Rainfall</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: '#0F172A', marginTop: '0.15rem' }}>
                  {weather ? `${weather.precipitation} mm` : '4.2 mm'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
                  {weather?.condition?.slice(0, 15) || 'Heavy Rain'}
                </div>
              </div>

              {/* Seismic */}
              <div style={{ backgroundColor: 'var(--color-neutral-50)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: '#D97706', fontSize: '0.7rem', fontWeight: 600 }}>
                  <Activity size={12} />
                  <span>Seismic</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: '#0F172A', marginTop: '0.15rem' }}>
                  {seismic?.latestEvent ? `M ${seismic.latestEvent.mag}` : 'M 1.9'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#16A34A', fontWeight: 600 }}>
                  Stable Tremor
                </div>
              </div>
            </div>

            {/* Hydro & Grid Sensors */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', fontSize: '0.72rem', color: 'var(--color-neutral-600)', flexWrap: 'wrap', gap: '0.35rem' }}>
              <span>Hydro Surge Sensor: <strong>{sensors?.waterLevelMeters || '2.40'}m</strong></span>
              <span>Grid Stress: <strong>{sensors?.gridLoadPercent || 82}%</strong></span>
              <span style={{ color: 'var(--color-emergency-600)', fontWeight: 700 }}>Threat: HIGH</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          LIVE GPS LOCATION, METEOROLOGICAL TELEMETRY & AI DISASTER PREDICTOR
          ========================================================================= */}
      <section style={{ marginBottom: '2.75rem' }} aria-label="AI Disaster Prediction and Live Telemetry">
        <LiveLocationDisasterPredictor />
      </section>

      {/* =========================================================================
          VISUAL INCIDENT FEED: 3 High-Impact Cards (Icon, Badges, Title, Affected)
          ========================================================================= */}
      <section style={{ marginBottom: '2.75rem' }} aria-labelledby="visual-feed-heading">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 id="visual-feed-heading" style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
              Live Incident Stream
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: '0.15rem' }}>
              Real-time operational alerts triage stream validated by emergency responders
            </p>
          </div>

          <Link 
            to="/map" 
            className="btn btn-outline btn-sm" 
            style={{ borderRadius: 'var(--radius-pill)', padding: '0.4rem 1rem' }}
          >
            <span>View All On Tactical Map</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
          {visualFeed.map((incident) => {
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
                          width: 44, 
                          height: 44, 
                          borderRadius: '50%', 
                          backgroundColor: incident.severity === 'CRITICAL' ? '#FEE2E2' : '#FEF3C7',
                          color: incident.severity === 'CRITICAL' ? '#DC2626' : '#D97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <CategoryIcon size={22} strokeWidth={2.2} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>
                          {incident.category}
                        </div>
                        <span className="mono-id" style={{ fontSize: '0.75rem' }}>{incident.id}</span>
                      </div>
                    </div>

                    <SeverityBadge severity={incident.severity} />
                  </div>

                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {incident.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-neutral-600)', fontSize: 'var(--text-xs)', marginBottom: '1rem' }}>
                    <MapPin size={14} color="var(--color-primary-600)" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{incident.address}</span>
                  </div>
                </div>

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
                      fontSize: 'var(--text-xs)', 
                      fontWeight: 700, 
                      padding: '0.2rem 0.65rem', 
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: people > 25 ? '#FEE2E2' : '#EFF6FF',
                      color: people > 25 ? '#B91C1C' : '#1D4ED8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Users size={12} />
                    <span>~{people} People Affected</span>
                  </span>

                  <span style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} />
                    <span>{new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          VISUAL QUICK-ACTION BAR: 4 Iconic Civic Triage Cards
          ========================================================================= */}
      <section aria-labelledby="quick-actions-heading">
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 id="quick-actions-heading" style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Immediate Civic Triage &amp; Emergency Protocols
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: '0.15rem' }}>
            Official standard operating directives for life-safety response
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.25rem' }}>
          {/* Card 1: Flood Protocol */}
          <div 
            className="card" 
            style={{ 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.5rem', 
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Droplets size={22} />
            </div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.35rem' }}>
              Flood Protocol
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Turn Around, Don&rsquo;t Drown. Avoid driving into water depths &gt; 15cm. Move essential medical kits to higher floors immediately.
            </p>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary-600)' }}>
              Check Storm Surge Levels &rarr;
            </span>
          </div>

          {/* Card 2: Fire Evacuation */}
          <div 
            className="card" 
            style={{ 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.5rem', 
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Flame size={22} />
            </div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.35rem' }}>
              Fire Evacuation
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Crawl low under smoke. Feel doors for heat before opening. Close doors behind you to starve oxygen and follow primary egress route.
            </p>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: '#DC2626' }}>
              View Evacuation Routes &rarr;
            </span>
          </div>

          {/* Card 3: Medical Triage */}
          <div 
            className="card" 
            style={{ 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.5rem', 
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <HeartPulse size={22} />
            </div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.35rem' }}>
              Medical Triage
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Apply direct firm pressure on arterial bleeding. Clear airways and position unconscious victims in lateral recovery posture.
            </p>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: '#15803D' }}>
              Locate Trauma Centers &rarr;
            </span>
          </div>

          {/* Card 4: Helplines */}
          <div 
            className="card" 
            style={{ 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.5rem', 
              border: '1px solid #FED7AA',
              backgroundColor: '#FFFBEB',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <PhoneCall size={22} />
            </div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: '#92400E', marginBottom: '0.35rem' }}>
              Helpline 112 / 1078
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: '#78350F', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              National Disaster Helpline: <a href="tel:112" style={{ fontWeight: 800, color: '#B45309' }}>112</a> &bull; NDMA Central Helpline: <a href="tel:1078" style={{ fontWeight: 800, color: '#B45309' }}>1078</a>.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a 
                href="tel:112" 
                className="btn btn-xs" 
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF', borderRadius: 'var(--radius-pill)', padding: '0.35rem 0.75rem' }}
              >
                Call 112
              </a>
              <a 
                href="tel:1078" 
                className="btn btn-xs" 
                style={{ backgroundColor: '#D97706', color: '#FFFFFF', borderRadius: 'var(--radius-pill)', padding: '0.35rem 0.75rem' }}
              >
                Call 1078
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
