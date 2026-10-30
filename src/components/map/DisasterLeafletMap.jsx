import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SeverityBadge } from '../common/SeverityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { 
  MapPin, 
  Clock, 
  Truck, 
  Building2, 
  Phone, 
  ShieldAlert,
  AlertTriangle,
  Compass,
  Users,
  Navigation,
  Radio,
  HelpCircle,
  Construction
} from 'lucide-react';

/**
 * Custom HTML/CSS L.divIcon marker factory
 */
export const createDivIcon = (type, glyph) => {
  let markerClass = 'marker-critical';
  if (type === 'CRITICAL') markerClass = 'marker-critical';
  else if (type === 'HIGH' || type === 'MODERATE' || type === 'LOW') markerClass = 'marker-warning';
  else if (type === 'UNVERIFIED') markerClass = 'marker-unverified';
  else if (type === 'RESOURCE') markerClass = 'marker-resource';
  else if (type === 'BLOCKED_ROAD') markerClass = 'marker-blocked-road';
  else if (type === 'SHELTER') markerClass = 'marker-shelter';
  else if (type === 'HOSPITAL') markerClass = 'marker-hospital';

  return L.divIcon({
    className: `resq-map-marker ${markerClass}`,
    html: `
      <div class="marker-pin">
        <span class="marker-glyph">${glyph}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30]
  });
};

const ICONS = {
  CRITICAL: createDivIcon('CRITICAL', '!'),
  HIGH: createDivIcon('HIGH', '▲'),
  MODERATE: createDivIcon('HIGH', '●'),
  LOW: createDivIcon('HIGH', '○'),
  UNVERIFIED: createDivIcon('UNVERIFIED', '?'),
  RESOURCE: createDivIcon('RESOURCE', 'R'),
  BLOCKED_ROAD: createDivIcon('BLOCKED_ROAD', '✕'),
  SHELTER: createDivIcon('SHELTER', 'S'),
  HOSPITAL: createDivIcon('HOSPITAL', '+')
};

// Recalculates map tile dimensions upon mounting or resizing to avoid broken/grey tiles
function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// Map controller component for smooth programmatic panning and zoom
function MapController({ targetCoords, zoom = 14 }) {
  const map = useMap();

  useEffect(() => {
    if (targetCoords && targetCoords.length === 2) {
      map.flyTo(targetCoords, zoom, {
        animate: true,
        duration: 1.2
      });
    }
  }, [targetCoords, zoom, map]);

  return null;
}

export const DisasterLeafletMap = ({
  incidents = [],
  shelters = [],
  blockedRoads = [],
  responseResources = [],
  visibleLayers = {
    critical: true,
    high: true,
    unverified: true,
    resources: true,
    blockedRoads: true,
    shelters: true
  },
  selectedTarget = null,
  center = [21.1458, 79.0882],
  zoom = 5,
  onMarkerClick
}) => {
  const markerRefs = useRef({});

  // Auto-open popup when target changes
  useEffect(() => {
    if (selectedTarget && selectedTarget.id && markerRefs.current[selectedTarget.id]) {
      markerRefs.current[selectedTarget.id].openPopup();
    }
  }, [selectedTarget]);

  const targetCoords = selectedTarget 
    ? [selectedTarget.latitude, selectedTarget.longitude] 
    : null;

  return (
    <div 
      className="map-canvas-wrapper" 
      style={{ 
        height: '100%', 
        width: '100%', 
        position: 'relative', 
        zIndex: 1, 
        isolation: 'isolate', 
        overflow: 'hidden',
        borderRadius: 'var(--radius-md)'
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <InvalidateMapSize />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {targetCoords && <MapController targetCoords={targetCoords} zoom={15} />}

        {/* =========================================================================
            INCIDENT MARKERS (Critical, High, Unverified)
            ========================================================================= */}
        {incidents.map((incident) => {
          const isUnverified = incident.isVerified === false;
          
          // Layer Visibility Gate
          if (isUnverified && !visibleLayers.unverified) return null;
          if (!isUnverified && incident.severity === 'CRITICAL' && !visibleLayers.critical) return null;
          if (!isUnverified && incident.severity !== 'CRITICAL' && !visibleLayers.high) return null;

          let icon = ICONS.HIGH;
          if (isUnverified) {
            icon = ICONS.UNVERIFIED;
          } else if (incident.severity === 'CRITICAL') {
            icon = ICONS.CRITICAL;
          }

          return (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
              icon={icon}
              ref={(ref) => {
                if (ref) markerRefs.current[incident.id] = ref;
              }}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(incident);
                }
              }}
            >
              <Popup>
                <div className="map-popup-card">
                  <div className="map-popup-header">
                    <span className="mono-id">{incident.id}</span>
                    {isUnverified ? (
                      <span 
                        style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          color: '#4F46E5', 
                          backgroundColor: '#EEF2FF', 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: 'var(--radius-pill)',
                          border: '1px dashed #6366F1'
                        }}
                      >
                        UNVERIFIED REPORT
                      </span>
                    ) : (
                      <SeverityBadge severity={incident.severity} />
                    )}
                  </div>

                  <div className="map-popup-title">{incident.title}</div>
                  <div className="map-popup-desc">{incident.description}</div>

                  {incident.peopleAffected && (
                    <div style={{ marginTop: '0.4rem', marginBottom: '0.4rem' }}>
                      <span 
                        style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 700, 
                          color: '#B91C1C', 
                          backgroundColor: '#FEE2E2', 
                          padding: '0.15rem 0.55rem', 
                          borderRadius: 'var(--radius-pill)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Users size={11} />
                        <span>~{incident.peopleAffected} People Impacted</span>
                      </span>
                    </div>
                  )}

                  <div className="map-popup-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={12} color="var(--color-primary-600)" />
                      <span>{incident.address}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                      <StatusBadge status={incident.status} />
                      <span className="timestamp">
                        {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {incident.assignedUnit && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem', color: 'var(--color-neutral-800)', fontWeight: 600 }}>
                        <Truck size={12} />
                        <span>Unit: {incident.assignedUnit}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* =========================================================================
            LAYER 4: ACTIVE RESPONSE RESOURCES (Emerald Green)
            ========================================================================= */}
        {visibleLayers.resources && responseResources.map((res) => (
          <Marker
            key={res.id}
            position={[res.latitude, res.longitude]}
            icon={ICONS.RESOURCE}
            ref={(ref) => {
              if (ref) markerRefs.current[res.id] = ref;
            }}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) onMarkerClick(res);
              }
            }}
          >
            <Popup>
              <div className="map-popup-card">
                <div className="map-popup-header">
                  <span className="mono-id">{res.id}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#15803D', backgroundColor: '#DCFCE7', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)' }}>
                    {res.status}
                  </span>
                </div>

                <div className="map-popup-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Truck size={14} color="#15803D" />
                  <span>{res.facility || res.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0.35rem 0', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-pill)', backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
                    Type: {res.type}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-pill)', backgroundColor: '#FEF3C7', color: '#B45309' }}>
                    {res.location || 'India-wide'}
                  </span>
                </div>

                {res.verifiedDetails && (
                  <div style={{ fontSize: '0.72rem', backgroundColor: '#F0FDF4', color: '#166534', padding: '0.35rem 0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid #BBF7D0', marginBottom: '0.35rem' }}>
                    <strong>Verified Details:</strong> {res.verifiedDetails}
                  </div>
                )}

                <div className="map-popup-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={12} color="#15803D" />
                    <span>Emergency Contact: {res.contact || res.emergencyContact || '112'}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* =========================================================================
            LAYER 5: BLOCKED ROADS / ROUTE HAZARDS (Charcoal / Red)
            ========================================================================= */}
        {visibleLayers.blockedRoads && blockedRoads.map((br) => (
          <Marker
            key={br.id}
            position={[br.latitude, br.longitude]}
            icon={ICONS.BLOCKED_ROAD}
            ref={(ref) => {
              if (ref) markerRefs.current[br.id] = ref;
            }}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) onMarkerClick(br);
              }
            }}
          >
            <Popup>
              <div className="map-popup-card">
                <div className="map-popup-header">
                  <span className="mono-id">{br.id}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)' }}>
                    ROAD BLOCKED
                  </span>
                </div>

                <div className="map-popup-title" style={{ color: '#991B1B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Construction size={14} color="#DC2626" />
                  <span>{br.name}</span>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#7F1D1D', margin: '0.35rem 0', lineHeight: 1.4 }}>
                  <strong>Obstruction Reason:</strong> {br.reason}
                </div>

                <div style={{ backgroundColor: '#FEF2F2', padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid #FECACA', fontSize: '0.7rem', color: '#991B1B' }}>
                  <Navigation size={11} style={{ display: 'inline', marginRight: '4px' }} />
                  <strong>Tactical Bypass:</strong> {br.bypassAdvice}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Shelter and Hospital Markers */}
        {visibleLayers.shelters && shelters.map((shelter) => {
          const isHospital = shelter.type === 'HOSPITAL' || shelter.type === 'Hospital';
          const icon = isHospital ? ICONS.HOSPITAL : ICONS.SHELTER;

          return (
            <Marker
              key={shelter.id}
              position={[shelter.latitude, shelter.longitude]}
              icon={icon}
              ref={(ref) => {
                if (ref) markerRefs.current[shelter.id] = ref;
              }}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(shelter);
                }
              }}
            >
              <Popup>
                <div className="map-popup-card">
                  <div className="map-popup-header">
                    <span className="mono-id">{shelter.id}</span>
                    <span style={{ 
                      fontSize: 'var(--text-xs)', 
                      fontWeight: 700, 
                      color: isHospital ? '#15803D' : '#0A192F',
                      backgroundColor: isHospital ? '#DCFCE7' : '#DBEAFE',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-pill)'
                    }}>
                      {shelter.type}
                    </span>
                  </div>

                  <div className="map-popup-title">{shelter.facility || shelter.name}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0.3rem 0', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-pill)', backgroundColor: '#F1F5F9', color: '#334155' }}>
                      Location: {shelter.location || shelter.district}
                    </span>
                    {shelter.verifiedDetails && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-pill)', backgroundColor: '#DCFCE7', color: '#15803D' }}>
                        {shelter.verifiedDetails}
                      </span>
                    )}
                  </div>

                  <div style={{ margin: '0.4rem 0', fontSize: 'var(--text-xs)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span><strong>Active Capacity:</strong></span>
                      <span>{shelter.occupancy.toLocaleString()} / {shelter.capacity.toLocaleString()}</span>
                    </div>
                    <div className="occupancy-bar-bg" style={{ height: 6 }}>
                      <div 
                        className={`occupancy-bar-fill ${
                          shelter.occupancy >= shelter.capacity ? 'occupancy-critical' : shelter.occupancy >= shelter.capacity * 0.85 ? 'occupancy-warning' : 'occupancy-normal'
                        }`} 
                        style={{ width: `${Math.min(100, Math.round((shelter.occupancy / shelter.capacity) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="map-popup-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={12} color="var(--color-primary-600)" />
                      <span>{shelter.address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={12} />
                      <a href={`tel:${(shelter.emergencyContact || shelter.phone || '112').split('/')[0].trim()}`} style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
                        {shelter.emergencyContact || shelter.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* 5-Layer Persistent Tactical Legend */}
      <div 
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 400,
          fontSize: 'var(--text-xs)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          pointerEvents: 'auto'
        }}
        aria-label="Map Legend"
      >
        <div style={{ fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-neutral-700)', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>
          5-Layer Tactical Legend
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block', boxShadow: '0 0 6px rgba(220, 38, 38, 0.8)' }}></span>
          <span>Critical Hazard (Pulsing Red)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#D97706', display: 'inline-block' }}></span>
          <span>High Priority Hazard (Amber)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#6366F1', border: '1px dashed #FFFFFF', display: 'inline-block' }}></span>
          <span>Unverified Report (Dashed Violet)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#15803D', display: 'inline-block' }}></span>
          <span>Response Units &amp; Resources (Green)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#1E293B', border: '1px solid #DC2626', display: 'inline-block' }}></span>
          <span>Blocked Route / Hazard (Charcoal)</span>
        </div>
      </div>
    </div>
  );
};
