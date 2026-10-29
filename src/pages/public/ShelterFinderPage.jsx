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
  AlertCircle, 
  Accessibility, 
  Dog, 
  ShieldCheck,
  Filter
} from 'lucide-react';

export const ShelterFinderPage = () => {
  const { shelters } = useEmergencyData();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [petFriendlyOnly, setPetFriendlyOnly] = useState(false);

  const filteredShelters = useMemo(() => {
    return shelters.filter(shelter => {
      // Type filter
      if (typeFilter !== 'ALL' && shelter.type !== typeFilter) {
        return false;
      }
      // Accessibility flags
      if (accessibleOnly && !shelter.wheelchairAccessible) {
        return false;
      }
      if (petFriendlyOnly && !shelter.petFriendly) {
        return false;
      }
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = shelter.name.toLowerCase().includes(query);
        const matchesAddress = shelter.address.toLowerCase().includes(query);
        const matchesDistrict = shelter.district.toLowerCase().includes(query);
        const matchesAmenities = shelter.amenities.some(a => a.toLowerCase().includes(query));
        return matchesName || matchesAddress || matchesDistrict || matchesAmenities;
      }
      return true;
    });
  }, [shelters, typeFilter, accessibleOnly, petFriendlyOnly, searchQuery]);

  return (
    <div className="container page-container">
      <PageHeader
        title="Emergency Shelters &amp; Medical Centers"
        subtitle="Real-time capacity tracking, medical readiness, and intake protocols across municipal facilities."
        breadcrumb="PUBLIC PORTAL / SHELTER FINDER"
      />

      {/* Control Filters */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem', alignItems: 'center' }}>
          <div>
            <label className="form-label">Search Facilities</label>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by facility name, district (e.g., First Hill, Queen Anne)..."
              onClear={() => setSearchQuery('')}
            />
          </div>

          <div>
            <label className="form-label">Facility Classification</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setTypeFilter('ALL')}
              >
                All Facilities ({shelters.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'SHELTER' ? 'active' : ''}`}
                onClick={() => setTypeFilter('SHELTER')}
              >
                Shelters
              </button>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'HOSPITAL' ? 'active' : ''}`}
                onClick={() => setTypeFilter('HOSPITAL')}
              >
                Hospitals &amp; Trauma
              </button>
            </div>
          </div>
        </div>

        {/* Checkbox toggles for accessibility */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem', 
          marginTop: '1rem', 
          paddingTop: '0.85rem', 
          borderTop: '1px solid var(--color-border)',
          fontSize: 'var(--text-xs)'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={accessibleOnly}
              onChange={(e) => setAccessibleOnly(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontWeight: 600, color: 'var(--color-neutral-800)' }}>
              ADA Wheelchair Accessible Only
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={petFriendlyOnly}
              onChange={(e) => setPetFriendlyOnly(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontWeight: 600, color: 'var(--color-neutral-800)' }}>
              Pet Co-Sheltering Allowed
            </span>
          </label>
        </div>
      </div>

      {/* Facilities Grid */}
      {filteredShelters.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No shelters or medical centers match your search"
          description="Try disabling the ADA or pet filters, or broadening your district keyword."
          action={
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('ALL');
                setAccessibleOnly(false);
                setPetFriendlyOnly(false);
              }}
            >
              Reset All Filters
            </button>
          }
        />
      ) : (
        <div className="grid-2">
          {filteredShelters.map((shelter) => {
            const occupancyPct = Math.round((shelter.occupancy / shelter.capacity) * 100);
            const isNearFull = occupancyPct >= 85 && occupancyPct < 100;
            const isFull = occupancyPct >= 100;

            const progressBarClass = isFull 
              ? 'occupancy-critical' 
              : isNearFull 
                ? 'occupancy-warning' 
                : 'occupancy-normal';

            const statusBadgeClass = shelter.status === 'OPEN'
              ? 'severity-low'
              : shelter.status === 'NEAR_CAPACITY'
                ? 'severity-high'
                : 'severity-critical';

            const isHospital = shelter.type === 'HOSPITAL';

            return (
              <article key={shelter.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="card-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="mono-id">{shelter.id}</span>
                      <span style={{ 
                        fontSize: 'var(--text-xs)', 
                        fontWeight: 700, 
                        color: isHospital ? '#1E40AF' : '#065F46',
                        backgroundColor: isHospital ? '#EFF6FF' : '#ECFDF5',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-xs)'
                      }}>
                        {shelter.type}
                      </span>
                    </div>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                      {shelter.name}
                    </h2>
                  </div>

                  <span className={`badge ${statusBadgeClass}`}>
                    {shelter.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Location & District */}
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <MapPin size={16} color="var(--color-primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong>{shelter.address}</strong>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                          District: {shelter.district} &bull; Coordinates: {shelter.latitude}, {shelter.longitude}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="occupancy-wrapper">
                    <div className="occupancy-label">
                      <span><strong>Bed Occupancy:</strong> {shelter.occupancy} / {shelter.capacity} beds</span>
                      <span style={{ fontWeight: 700 }}>{occupancyPct}%</span>
                    </div>
                    <div className="occupancy-bar-bg">
                      <div 
                        className={`occupancy-bar-fill ${progressBarClass}`}
                        style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                        role="progressbar"
                        aria-valuenow={shelter.occupancy}
                        aria-valuemin="0"
                        aria-valuemax={shelter.capacity}
                      />
                    </div>
                  </div>

                  {/* Operational Tags: ADA, Pets, Medical Supplies */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', fontSize: 'var(--text-xs)' }}>
                    {shelter.wheelchairAccessible && (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        color: 'var(--color-success-700)',
                        backgroundColor: 'var(--color-success-50)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                        fontWeight: 600
                      }}>
                        <Accessibility size={13} />
                        <span>ADA Accessible</span>
                      </span>
                    )}

                    {shelter.petFriendly && (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        color: '#6366F1',
                        backgroundColor: '#EEF2FF',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                        fontWeight: 600
                      }}>
                        <Dog size={13} />
                        <span>Pets Permitted</span>
                      </span>
                    )}

                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      color: shelter.medicalSupplies === 'FULL' ? 'var(--color-success-700)' : 'var(--color-warning-800)',
                      backgroundColor: shelter.medicalSupplies === 'FULL' ? 'var(--color-success-50)' : 'var(--color-warning-50)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      fontWeight: 600
                    }}>
                      <HeartPulse size={13} />
                      <span>Medical Supplies: {shelter.medicalSupplies}</span>
                    </span>
                  </div>

                  {/* Amenities List */}
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-neutral-500)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      Provided Amenities:
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {shelter.amenities.map((item, idx) => (
                        <span 
                          key={idx}
                          style={{
                            fontSize: '0.72rem',
                            backgroundColor: 'var(--color-neutral-100)',
                            color: 'var(--color-neutral-700)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-xs)'
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <a 
                    href={`tel:${shelter.phone.replace(/[^0-9]/g, '')}`} 
                    className="btn btn-outline btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    <Phone size={14} />
                    <span>Intake Line: {shelter.phone}</span>
                  </a>

                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                    Intake Hours: 24/7 Active
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

