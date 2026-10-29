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
  ShieldCheck,
  AlertTriangle,
  Compass
} from 'lucide-react';

/**
 * Custom HTML/CSS L.divIcon marker factory
 * Eliminates missing default Leaflet PNG image paths
 */
export const createDivIcon = (type, glyph) => {
  let markerClass = 'marker-critical';
  if (type === 'CRITICAL') markerClass = 'marker-critical';
  else if (type === 'HIGH' || type === 'MODERATE') markerClass = 'marker-warning';
  else if (type === 'SHELTER') markerClass = 'marker-shelter';
  else if (type === 'HOSPITAL') markerClass = 'marker-hospital';
  else if (type === 'LOW') markerClass = 'marker-warning';

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
  MODERATE: createDivIcon('MODERATE', '●'),
  LOW: createDivIcon('LOW', '○'),
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
  selectedTarget = null,
  center = [47.6062, -122.3321],
  zoom = 12,
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

        {/* Incident Markers */}
        {incidents.map((incident) => {
          const icon = incident.severity === 'CRITICAL' 
            ? ICONS.CRITICAL 
            : incident.severity === 'HIGH' 
              ? ICONS.HIGH 
              : incident.severity === 'MODERATE' 
                ? ICONS.MODERATE 
                : ICONS.LOW;

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
                    <SeverityBadge severity={incident.severity} />
                  </div>

                  <div className="map-popup-title">{incident.title}</div>
                  <div className="map-popup-desc">{incident.description}</div>

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

        {/* Shelter and Hospital Markers */}
        {shelters.map((shelter) => {
          const isHospital = shelter.type === 'HOSPITAL';
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
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-xs)'
                    }}>
                      {shelter.type}
                    </span>
                  </div>

                  <div className="map-popup-title">{shelter.name}</div>

                  <div style={{ margin: '0.4rem 0', fontSize: 'var(--text-xs)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span><strong>Bed Capacity:</strong></span>
                      <span>{shelter.occupancy} / {shelter.capacity}</span>
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
                      <a href={`tel:${shelter.phone}`} style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
                        {shelter.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Persistent Map Legend (Kept safely inside isolated map context with z-index: 400) */}
      <div 
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 400,
          fontSize: 'var(--text-xs)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          pointerEvents: 'auto'
        }}
        aria-label="Map Legend"
      >
        <div style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-600)', marginBottom: '0.15rem' }}>
          Tactical Layer Legend
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block' }}></span>
          <span>Critical Hazard (Pulsing)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#D97706', display: 'inline-block' }}></span>
          <span>Warning / Moderate Hazard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#0A192F', display: 'inline-block' }}></span>
          <span>Emergency Shelter (Navy)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#15803D', display: 'inline-block' }}></span>
          <span>Hospital / Trauma Hub (Green)</span>
        </div>
      </div>
    </div>
  );
};
