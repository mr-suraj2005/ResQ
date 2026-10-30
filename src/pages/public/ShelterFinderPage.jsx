import React, { useState, useMemo } from 'react';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  Building2, 
  HeartPulse, 
  Phone, 
  MapPin, 
  Check, 
  ShieldAlert,
  ShieldCheck,
  Radio,
  CheckCircle2,
  Users,
  Award
} from 'lucide-react';

export const ShelterFinderPage = () => {
  const { shelters } = useEmergencyData();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredShelters = useMemo(() => {
    return shelters.filter(shelter => {
      // Type filter
      if (typeFilter !== 'ALL') {
        const sType = (shelter.type || '').toLowerCase();
        const fType = typeFilter.toLowerCase();
        if (fType === 'hospital' && !sType.includes('hospital')) return false;
        if (fType === 'shelter network' && !sType.includes('shelter')) return false;
        if (fType === 'response force' && !sType.includes('response') && !sType.includes('force')) return false;
      }

      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = (shelter.id || '').toLowerCase().includes(query);
        const matchesName = (shelter.facility || shelter.name || '').toLowerCase().includes(query);
        const matchesLocation = (shelter.location || shelter.district || '').toLowerCase().includes(query);
        const matchesAddress = (shelter.address || '').toLowerCase().includes(query);
        const matchesDetails = (shelter.verifiedDetails || '').toLowerCase().includes(query);
        return matchesId || matchesName || matchesLocation || matchesAddress || matchesDetails;
      }
      return true;
    });
  }, [shelters, typeFilter, searchQuery]);

  return (
    <div className="container page-container" style={{ paddingBottom: '3.5rem' }}>
      <PageHeader
        title="Verified National Disaster Facilities &amp; Response Hubs"
        subtitle="Official directory of certified apex trauma hospitals, state cyclone shelter networks, and national rescue forces across India."
        breadcrumb="PUBLIC PORTAL / VERIFIED FACILITIES"
      />

      {/* Control Filters */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)', gap: '1.25rem', alignItems: 'center' }}>
          <div>
            <label className="form-label" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
            <label className="form-label" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Filter by Facility Classification
            </label>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setTypeFilter('ALL')}
                style={{ borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)' }}
              >
                All (5)
              </button>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'Hospital' ? 'active' : ''}`}
                onClick={() => setTypeFilter('Hospital')}
                style={{ borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)' }}
              >
                Hospital (IND-HSP-001)
              </button>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'Shelter Network' ? 'active' : ''}`}
                onClick={() => setTypeFilter('Shelter Network')}
                style={{ borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)' }}
              >
                Shelter Network (IND-SHL-002, 003, 004)
              </button>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'Response Force' ? 'active' : ''}`}
                onClick={() => setTypeFilter('Response Force')}
                style={{ borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)' }}
              >
                Response Force (IND-DRM-005)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      {filteredShelters.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No verified national facilities match your search"
          description="Try clearing your search query or selecting 'All (5)'."
          action={
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('ALL');
              }}
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

            const occupancyPct = Math.round((shelter.occupancy / shelter.capacity) * 100);

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
                  {/* Card Header with Exact Monospace ID Badge */}
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
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: '0.5rem' }}>
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
                          <strong>{isHospital ? 'Trauma Bed Load:' : isResponseForce ? 'Personnel Readiness:' : 'Shelter Intake Load:'}</strong> {shelter.occupancy.toLocaleString()} / {shelter.capacity.toLocaleString()}
                        </span>
                        <span style={{ fontWeight: 800 }}>{occupancyPct}%</span>
                      </div>
                      <div className="occupancy-bar-bg" style={{ height: 7 }}>
                        <div 
                          className="occupancy-bar-fill occupancy-normal"
                          style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Amenities List */}
                    {shelter.amenities && (
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

                {/* Card Footer: Emergency Contact Link */}
                <div 
                  style={{ 
                    padding: '1rem 1.5rem', 
                    borderTop: '1px solid var(--color-border)', 
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <a 
                    href={`tel:${(shelter.emergencyContact || shelter.phone || '112').split('/')[0].trim()}`} 
                    className="btn btn-outline btn-sm"
                    style={{ borderRadius: 'var(--radius-pill)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Phone size={14} />
                    <span>Contact: {shelter.emergencyContact || shelter.phone}</span>
                  </a>

                  <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={13} />
                    <span>24/7 Verified</span>
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
