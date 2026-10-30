import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

const pickerIcon = L.divIcon({
  className: 'resq-map-marker marker-picker',
  html: `
    <div class="marker-pin" style="background-color: #DC2626; border: 3px solid #FFFFFF;">
      <span class="marker-glyph" style="font-size: 13px; font-weight: 800;">✕</span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// Ensures tile bounds are calculated properly upon mounting/resizing
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

function MapClickHandler({ onChange, onAddressResolve }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const roundedLat = Number(lat.toFixed(5));
      const roundedLng = Number(lng.toFixed(5));
      onChange([roundedLat, roundedLng]);
      if (onAddressResolve) {
        onAddressResolve(`GPS: ${roundedLat}° N, ${roundedLng}° E (India Command Zone)`);
      }
    }
  });

  return null;
}

export const LocationPickerMap = ({
  position = [28.6139, 77.2090],
  onChange,
  onAddressResolve,
  height = '240px'
}) => {
  const eventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        if (marker != null) {
          const latLng = marker.getLatLng();
          const roundedLat = Number(latLng.lat.toFixed(5));
          const roundedLng = Number(latLng.lng.toFixed(5));
          onChange([roundedLat, roundedLng]);
          if (onAddressResolve) {
            onAddressResolve(`GPS: ${roundedLat}° N, ${roundedLng}° E (India Command Zone)`);
          }
        }
      }
    }),
    [onChange, onAddressResolve]
  );

  return (
    <div className="map-picker-wrapper" style={{ height, width: '100%' }}>
      <MapContainer
        center={position}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <InvalidateMapSize />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapClickHandler onChange={onChange} onAddressResolve={onAddressResolve} />

        <Marker
          position={position}
          icon={pickerIcon}
          draggable={true}
          eventHandlers={eventHandlers}
        />
      </MapContainer>

      {/* Coordinate badge safely isolated within map container */}
      <div className="map-coordinate-badge">
        {position[0].toFixed(4)}° N, {position[1].toFixed(4)}° W
      </div>
    </div>
  );
};
