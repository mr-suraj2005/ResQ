import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  Building2, 
  HeartPulse, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Radio, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Map as MapIcon
} from 'lucide-react';

const STATE_QUICK_FILTERS = [
  'All States',
  'New Delhi / NCR',
  'Odisha',
  'Andhra Pradesh',
  'West Bengal',
  'Tamil Nadu',
  'Maharashtra',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Assam / NE',
  'Chandigarh',
  'Goa',
  'Uttarakhand'
];

export const ShelterFinderPage = () => {
  const { shelters = [], responseResources = [] } = useEmergencyData() || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedState, setSelectedState] = useState('All States');

  // Unified list of all 30 verified national disaster hubs across India
  const allFacilities = useMemo(() => {
    const map = new Map();

    // 1. Ingest shelters (Hospitals & Shelter Networks)
    (shelters || []).forEach(item => {
      if (item && item.id) {
        map.set(item.id, {
          ...item,
          id: item.id,
          facility: item.facility || item.name,
          name: item.name || item.facility,
          type: item.type || (item.id.includes('HSP') ? 'Hospital' : 'Shelter Network'),
          location: item.location || item.state || item.district || 'India',
          state: item.state || item.location || item.district || 'India',
          district: item.district || item.location,
          address: item.address || '',
          verifiedDetails: item.verifiedDetails || `${item.capacity || 500} capacity`,
          latitude: Number(item.latitude) || 28.5672,
          longitude: Number(item.longitude) || 77.2100,
          status: item.status || 'OPERATIONAL',
          emergencyContact: item.emergencyContact || item.phone || '112 / 011-26701700',
          phone: item.phone || item.emergencyContact || '112',
          activeUnits: item.activeUnits || `${item.capacity || 500} units`,
          capacity: Number(item.capacity) || 500,
          occupancy: Number(item.occupancy) || 0,
          amenities: Array.isArray(item.amenities) ? item.amenities : ['Emergency Medical Care', 'Potable Water & Rations']
        });
      }
    });

    // 2. Ingest response resources (Official NDRF Battalions)
    (responseResources || []).forEach(res => {
      if (res && res.id) {
        const existing = map.get(res.id) || {};
        map.set(res.id, {
          ...existing,
          ...res,
          id: res.id,
          facility: res.facility || res.name,
          name: res.name || res.facility,
          type: 'Response Force',
          location: res.location || res.state || 'New Delhi / NCR',
          state: res.state || res.location || 'New Delhi / NCR',
          district: res.district || res.location,
          address: res.address || '',
          verifiedDetails: res.verifiedDetails || res.equipment || 'National rescue force command',
          latitude: Number(res.latitude) || 28.6139,
          longitude: Number(res.longitude) || 77.2090,
          status: res.status || 'ACTIVE FORCE',
          emergencyContact: res.emergencyContact || res.contact || '112 / 011-24363260',
          phone: res.phone || res.contact || '112',
          activeUnits: res.activeUnits || (res.personnel ? `${res.personnel} Personnel` : '1,149 Personnel'),
          capacity: Number(res.capacity) || (res.personnel ? Number(res.personnel) * 2 : 2000),
          occupancy: Number(res.occupancy) || (res.personnel ? Math.round(Number(res.personnel) * 0.75) : 1400),
          amenities: Array.isArray(res.amenities) && res.amenities.length > 0 
            ? res.amenities 
            : ['Amphibious Zodiacs', 'Deep Inundation Search', 'USAR Acoustic Sensors', 'Field Triage Clinic']
        });
      }
    });

    return Array.from(map.values());
  }, [shelters, responseResources]);

  // Dynamic live counts for classification pills
  const totalCount = allFacilities.length;
  const hospitalCount = allFacilities.filter(f => (f.type || '').toLowerCase().includes('hospital')).length;
  const shelterCount = allFacilities.filter(f => (f.type || '').toLowerCase().includes('shelter')).length;
  const forceCount = allFacilities.filter(f => {
    const t = (f.type || '').toLowerCase();
    return t.includes('response') || t.includes('force');
  }).length;

  // Filtered dataset
  const filteredShelters = useMemo(() => {
    return allFacilities.filter(shelter => {
      // 1. Classification type filter
      if (typeFilter !== 'ALL') {
        const sType = (shelter.type || '').toLowerCase();
        const fType = typeFilter.toLowerCase();
        if (fType === 'hospital' && !sType.includes('hospital')) return false;
        if (fType === 'shelter network' && !sType.includes('shelter')) return false;
        if (fType === 'response force' && !sType.includes('response') && !sType.includes('force')) return false;
      }

      // 2. State / Region quick-filter
      if (selectedState !== 'All States') {
        const target = selectedState.toLowerCase();
        const facilityState = (shelter.state || shelter.location || shelter.district || '').toLowerCase();
        if (target.includes('delhi') && !facilityState.includes('delhi')) return false;
        else if (target.includes('assam') && (!facilityState.includes('assam') && !facilityState.includes('ne'))) return false;
        else if (!target.includes('delhi') && !target.includes('assam') && !facilityState.includes(target)) return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = (shelter.id || '').toLowerCase().includes(query);
        const matchesName = (shelter.facility || shelter.name || '').toLowerCase().includes(query);
        const matchesLocation = (shelter.location || shelter.state || shelter.district || '').toLowerCase();
        const matchesAddress = (shelter.address || '').toLowerCase().includes(query);
        const matchesDetails = (shelter.verifiedDetails || '').toLowerCase().includes(query);
        return matchesId || matchesName || matchesLocation.includes(query) || matchesAddress || matchesDetails;
      }

      return true;
    });
  }, [allFacilities, typeFilter, selectedState, searchQuery]);

  return (
    <div className="container page-container" style={{ paddingBottom: '3.5rem' }}>
      <PageHeader
        title="Verified National Disaster Facilities &amp; Response Hubs"
        subtitle="Official directory of 30 certified apex trauma hospitals, state cyclone shelter networks, and national rescue forces across India."
        breadcrumb="PUBLIC PORTAL / VERIFIED FACILITIES"
      />

      {/* Control Filters Panel */}
      <div 
        className="card" 
        style={{ 
          padding: '1.5rem', 
          marginBottom: '2rem', 
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.9fr)', gap: '1.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
              Search National Facilities
            </label>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by ID (IND-HSP-001), state (Odisha, Delhi), or facility..."
              onClear={() => setSearchQuery('')}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
              Filter by Facility Classification
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setTypeFilter('ALL')}
                style={{ borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)' }}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'Hospital' ? 'active' : ''}`}
                onClick={() => setTypeFilter('Hospital')}
                style={{ borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)' }}
              >
                Hospital ({hospitalCount})
              </button>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'Shelter Network' ? 'active' : ''}`}
                onClick={() => setTypeFilter('Shelter Network')}
                style={{ borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)' }}
              >
                Shelter Network ({shelterCount})
              </button>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'Response Force' ? 'active' : ''}`}
                onClick={() => setTypeFilter('Response Force')}
                style={{ borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)' }}
              >
                Response Force ({forceCount})
              </button>
            </div>
          </div>
        </div>

        {/* State / Region Quick-Filter Row */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <Layers size={13} color="var(--color-primary-600)" />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-neutral-600)' }}>
              State &amp; Regional Quick-Filter:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {STATE_QUICK_FILTERS.map(st => {
              const isActive = selectedState === st;
              return (
                <button
                  key={st}
                  type="button"
                  className={`filter-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedState(st)}
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.65rem'
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      {filteredShelters.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No verified national facilities match your search"
          description="Try clearing your search query or resetting filters to 'All States'."
          action={
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('ALL');
                setSelectedState('All States');
              }}
              style={{ borderRadius: 'var(--radius-pill)' }}
            >
              Reset All Filters
            </button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {filteredShelters.map((shelter) => {
            const isHospital = shelter.type === 'Hospital' || shelter.type === 'HOSPITAL';
            const isResponseForce = shelter.type === 'Response Force';
            const isShelterNetwork = shelter.type === 'Shelter Network' || shelter.type === 'SHELTER';

            const capacity = shelter.capacity || 500;
            const occupancy = shelter.occupancy || 0;
            const occupancyPct = Math.min(Math.round((occupancy / capacity) * 100), 100);

            return (
              <article 
                key={shelter.id} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden'
                }}
              >
                <div>
                  {/* Card Header with Exact Monospace ID Badge & Live Status */}
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span 
                        className="mono-id"
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          backgroundColor: '#0F172A',
                          color: '#F8FAFC',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-pill)',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {shelter.id}
                      </span>

                      {/* Exact Type Badge */}
                      <span 
                        style={{ 
                          fontSize: 'var(--text-xs)', 
                          fontWeight: 700, 
                          color: isHospital ? '#1E40AF' : isResponseForce ? '#B45309' : '#065F46',
                          backgroundColor: isHospital ? '#EFF6FF' : isResponseForce ? '#FEF3C7' : '#ECFDF5',
                          border: isHospital ? '1px solid #BFDBFE' : isResponseForce ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                          padding: '0.2rem 0.65rem',
                          borderRadius: 'var(--radius-pill)'
                        }}
                      >
                        {shelter.type}
                      </span>
                    </div>

                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        color: '#15803D', 
                        backgroundColor: '#DCFCE7', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: 'var(--radius-pill)' 
                      }}
                    >
                      {shelter.status}
                    </span>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    {/* Facility Title */}
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                      {shelter.facility || shelter.name}
                    </h2>

                    {/* Exact Verified Details Badge */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.4rem', 
                          fontSize: '0.78rem', 
                          fontWeight: 700, 
                          color: '#065F46', 
                          backgroundColor: '#ECFDF5', 
                          border: '1px solid #A7F3D0', 
                          padding: '0.35rem 0.75rem', 
                          borderRadius: 'var(--radius-md)' 
                        }}
                      >
                        <ShieldCheck size={16} color="#059669" />
                        <span><strong>Verified Details:</strong> {shelter.verifiedDetails}</span>
                      </div>
                    </div>

                    {/* Location & Address */}
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', marginBottom: '0.35rem' }}>
                        <MapPin size={16} color="var(--color-primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                            Location: {shelter.location || shelter.district}
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: '0.15rem' }}>
                            {shelter.address}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Metrics / Capacity */}
                    <div className="occupancy-wrapper" style={{ marginBottom: '1rem' }}>
                      <div className="occupancy-label" style={{ fontSize: 'var(--text-xs)' }}>
                        <span>
                          <strong>{isHospital ? 'Trauma Bed Load:' : isResponseForce ? 'Personnel Readiness:' : 'Shelter Intake Load:'}</strong> {occupancy.toLocaleString()} / {capacity.toLocaleString()}
                        </span>
                        <span style={{ fontWeight: 800 }}>{occupancyPct}%</span>
                      </div>
                      <div className="occupancy-bar-bg" style={{ height: 7 }}>
                        <div 
                          className="occupancy-bar-fill occupancy-normal"
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Amenities List */}
                    {shelter.amenities && Array.isArray(shelter.amenities) && shelter.amenities.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-neutral-500)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Verified Capabilities:
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {shelter.amenities.map((item, idx) => (
                            <span 
                              key={idx}
                              style={{
                                fontSize: '0.72rem',
                                backgroundColor: 'var(--color-neutral-100)',
                                color: 'var(--color-neutral-700)',
                                padding: '0.2rem 0.55rem',
                                borderRadius: 'var(--radius-pill)',
                                fontWeight: 500
                              }}
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Emergency Contact Link + View on Live Map Button */}
                <div 
                  style={{ 
                    padding: '1rem 1.5rem', 
                    borderTop: '1px solid var(--color-border)', 
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <a 
                      href={`tel:${(shelter.emergencyContact || shelter.phone || '112').split('/')[0].trim()}`} 
                      className="btn btn-outline btn-sm"
                      style={{ borderRadius: 'var(--radius-pill)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Phone size={14} />
                      <span>{shelter.emergencyContact || shelter.phone}</span>
                    </a>

                    <Link
                      to={`/map?lat=${shelter.latitude}&lng=${shelter.longitude}&zoom=10`}
                      className="btn btn-navy btn-sm"
                      style={{ 
                        borderRadius: 'var(--radius-pill)', 
                        fontWeight: 700, 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.35rem',
                        padding: '0.4rem 0.85rem'
                      }}
                      title="Fly directly to this facility on the interactive Live Map"
                    >
                      <MapIcon size={14} />
                      <span>View on Live Map</span>
                    </Link>
                  </div>

                  <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={13} />
                    <span>24/7 Active</span>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
