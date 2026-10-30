import { useState, useEffect, useCallback, useMemo } from 'react';
import { initialShelters } from '../data/shelters';
import { initialResponseResources, initialBlockedRoads } from '../data/tacticalLayers';
import { initialIncidents } from '../data/incidents';

export const INDIAN_CITIES = [
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, locality: 'MG Road / Central Bengaluru', region: 'Deccan Plateau' },
  { name: 'New Delhi / NCR', state: 'Delhi NCR', lat: 28.6139, lng: 77.2090, locality: 'Connaught Place / Central Delhi', region: 'Northern Indo-Gangetic Plain' },
  { name: 'Bhubaneswar / Puri', state: 'Odisha', lat: 20.2961, lng: 85.8245, locality: 'Coastal Marine Hub', region: 'East Coast Cyclone Corridor' },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, locality: 'Parel / Marine Drive', region: 'West Coast Monsoon & Marine Belt' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, locality: 'RK Beach / Port Corridor', region: 'Bay of Bengal Deep Water Coast' },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, locality: 'Marina / Park Town', region: 'Coromandel Coastal Corridor' },
  { name: 'Kolkata / Sundarbans', state: 'West Bengal', lat: 22.5726, lng: 88.3639, locality: 'Diamond Harbour / Ganges Delta', region: 'Ganges Delta & Lowland Silt' },
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362, locality: 'Brahmaputra Riverfront', region: 'Brahmaputra Flood & Seismic Zone V' },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, locality: 'Sabarmati Sector', region: 'Saurashtra & Western Seismic Zone' },
  { name: 'Chandigarh', state: 'Punjab & Haryana', lat: 30.7333, lng: 76.7794, locality: 'Sector 17 / Shivalik Base', region: 'Shivalik Himalayan Foothills' },
  { name: 'Rishikesh / Haridwar', state: 'Uttarakhand', lat: 30.0869, lng: 78.2676, locality: 'Ganga Valley Corridor', region: 'Himalayan Glacial & Landslide Zone' }
];

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 9999;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function useUserLocation() {
  // Default preset to Bengaluru/Delhi
  const [location, setLocation] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    accuracy: null,
    locality: 'Connaught Place / Central Delhi',
    city: 'New Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    isLiveGps: false,
    region: 'Northern Indo-Gangetic Plain'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Performs reverse geocoding via OpenStreetMap Nominatim API
   */
  const reverseGeocode = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ResQ-Disaster-Response-Hub/1.0 (resq-disaster-response-hub)'
        }
      });
      if (!res.ok) throw new Error('Geocoding response error');
      const data = await res.json();
      const addr = data.address || {};

      const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.road || 'Live Urban Sector';
      const city = addr.city || addr.town || addr.county || addr.district || 'National Metro';
      const district = addr.state_district || addr.county || city;
      const state = addr.state || 'India';

      return {
        locality,
        city,
        district,
        state,
        country: addr.country || 'India'
      };
    } catch (err) {
      // Clean fallback if Nominatim rate-limits
      return {
        locality: 'GPS Target Zone',
        city: 'Local District',
        district: 'Regional Zone',
        state: 'India',
        country: 'India'
      };
    }
  };

  /**
   * Prompts the browser for High-Accuracy Live GPS Coordinates
   */
  const detectLiveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const geoInfo = await reverseGeocode(latitude, longitude);

        setLocation({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          locality: geoInfo.locality,
          city: geoInfo.city,
          district: geoInfo.district,
          state: geoInfo.state,
          country: geoInfo.country,
          isLiveGps: true,
          region: `${geoInfo.state} Regional Zone`
        });
        setIsLoading(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setError('Location permission denied or timed out. Switched to fallback Indian metropolitan zone.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  /**
   * Sets location manually to one of the 11 quick Indian city presets
   */
  const setCityPreset = (cityName) => {
    const preset = INDIAN_CITIES.find(c => c.name.toLowerCase().includes(cityName.toLowerCase())) || INDIAN_CITIES[0];
    setLocation({
      latitude: preset.lat,
      longitude: preset.lng,
      accuracy: null,
      locality: preset.locality,
      city: preset.name.split('/')[0].trim(),
      district: preset.state,
      state: preset.state,
      country: 'India',
      isLiveGps: false,
      region: preset.region
    });
    setError(null);
  };

  // Attempt auto-locating on initial mount
  useEffect(() => {
    detectLiveLocation();
  }, [detectLiveLocation]);

  // Merge full 30 facilities catalog to calculate real proximities
  const allFacilities = useMemo(() => {
    const list = [...initialShelters];
    initialResponseResources.forEach(res => {
      if (!list.some(s => s.id === res.id)) {
        list.push({
          ...res,
          type: 'Response Force',
          facility: res.facility || res.name,
          verifiedDetails: res.verifiedDetails || res.equipment || 'NDRF Battalion'
        });
      }
    });
    return list;
  }, []);

  // Compute nearest facilities from user's current coordinates
  const proximities = useMemo(() => {
    const userLat = location.latitude;
    const userLng = location.longitude;

    // Hospitals
    const hospitals = allFacilities
      .filter(f => (f.type || '').toLowerCase().includes('hospital'))
      .map(h => ({
        ...h,
        distanceKm: calculateDistanceKm(userLat, userLng, h.latitude, h.longitude)
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    // Shelters
    const shelters = allFacilities
      .filter(f => (f.type || '').toLowerCase().includes('shelter'))
      .map(s => ({
        ...s,
        distanceKm: calculateDistanceKm(userLat, userLng, s.latitude, s.longitude)
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    // NDRF Battalions
    const ndrfUnits = allFacilities
      .filter(f => (f.type || '').toLowerCase().includes('response') || (f.type || '').toLowerCase().includes('force'))
      .map(r => ({
        ...r,
        distanceKm: calculateDistanceKm(userLat, userLng, r.latitude, r.longitude)
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    // Incidents within 100km
    const nearbyIncidents = initialIncidents
      .map(inc => ({
        ...inc,
        distanceKm: calculateDistanceKm(userLat, userLng, inc.latitude, inc.longitude)
      }))
      .filter(inc => inc.distanceKm <= 100)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    // Blocked roads within 100km
    const nearbyBlockedRoads = initialBlockedRoads
      .map(blk => ({
        ...blk,
        distanceKm: calculateDistanceKm(userLat, userLng, blk.latitude, blk.longitude)
      }))
      .filter(blk => blk.distanceKm <= 100)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return {
      nearestHospital: hospitals[0] || null,
      nearestShelter: shelters[0] || null,
      nearestNDRF: ndrfUnits[0] || null,
      nearbyIncidents,
      nearbyBlockedRoads
    };
  }, [location.latitude, location.longitude, allFacilities]);

  return {
    location,
    isLoading,
    error,
    detectLiveLocation,
    setCityPreset,
    proximities
  };
}

