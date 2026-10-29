import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { DisasterLeafletMap } from '../../components/map/DisasterLeafletMap';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchBar } from '../../components/common/SearchBar';
import { 
  Layers, 
  Filter, 
  MapPin, 
  AlertTriangle, 
  Building2, 
  Flame, 
  Droplets, 
  Zap, 
  HeartPulse, 
  ChevronRight, 
  ShieldAlert, 
  Crosshair,
  SlidersHorizontal,
  X
} from 'lucide-react';

export const DisasterMapPage = () => {
  const { incidents, shelters } = useEmergencyData();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('ALL'); // 'ALL' | 'INCIDENTS' | 'SHELTERS'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    if (selectedLayer === 'SHELTERS') return [];

    return incidents.filter((inc) => {
      // Exclude rejected reports from general public map
      if (inc.status === 'REJECTED') return false;

      // Severity Filter
      if (selectedSeverity !== 'ALL' && inc.severity !== selectedSeverity) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== 'ALL' && inc.category !== selectedCategory) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = inc.id.toLowerCase().includes(q);
        const matchesTitle = inc.title.toLowerCase().includes(q);
        const matchesAddress = inc.address.toLowerCase().includes(q);
        const matchesDesc = inc.description.toLowerCase().includes(q);
        return matchesId || matchesTitle || matchesAddress || matchesDesc;
      }

      return true;
    });
  }, [incidents, selectedLayer, selectedSeverity, selectedCategory, searchQuery]);

  // Filtered Shelters
  const filteredShelters = useMemo(() => {
    if (selectedLayer === 'INCIDENTS') return [];

    return shelters.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [shelters, selectedLayer, searchQuery]);

  const handleSelectIncident = (item) => {
    setSelectedTarget(item);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedLayer('ALL');
    setSelectedCategory('ALL');
    setSelectedSeverity('ALL');
  };

  const hasActiveFilters = 
    selectedLayer !== 'ALL' || 
    selectedCategory !== 'ALL' || 
    selectedSeverity !== 'ALL' || 
    searchQuery.trim() !== '';

  return (
    <div className="map-layout-container">
      {/* Side Filter & Incident List Panel */}
      <aside 
        className="map-sidebar" 
        style={{ display: isSidebarOpen ? 'flex' : 'none' }}
        aria-label="Map Controls and Incident Stream"
      >
        <div className="map-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={16} color="var(--color-primary-600)" />
            <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: 0 }}>
              Tactical Threat Intelligence
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {hasActiveFilters && (
              <button 
                type="button" 
                onClick={resetAllFilters}
                className="btn btn-ghost btn-xs"
                style={{ color: 'var(--color-primary-600)', padding: '0.2rem 0.4rem' }}
                title="Reset all filters"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Hide panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="map-sidebar-content">
          {/* Quick Search */}
          <div>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Filter by keyword, street, ID..."
              onClear={() => setSearchQuery('')}
            />
          </div>

          {/* Layer Filter Buttons */}
          <div>
            <label className="form-label" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Layers
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
              <button
                type="button"
                className={`filter-pill ${selectedLayer === 'ALL' ? 'active' : ''}`}
                style={{ textAlign: 'center', justifyContent: 'center' }}
                onClick={() => setSelectedLayer('ALL')}
              >
                All ({incidents.length + shelters.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${selectedLayer === 'INCIDENTS' ? 'active' : ''}`}
                style={{ textAlign: 'center', justifyContent: 'center' }}
                onClick={() => setSelectedLayer('INCIDENTS')}
              >
                Hazards ({incidents.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${selectedLayer === 'SHELTERS' ? 'active' : ''}`}
                style={{ textAlign: 'center', justifyContent: 'center' }}
                onClick={() => setSelectedLayer('SHELTERS')}
              >
                Shelters ({shelters.length})
              </button>
            </div>
          </div>

          {/* Severity Filter */}
          {selectedLayer !== 'SHELTERS' && (
            <div>
              <label className="form-label" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Threat Severity
              </label>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    className={`filter-pill ${selectedSeverity === sev ? 'active' : ''}`}
                    onClick={() => setSelectedSeverity(sev)}
                  >
                    {sev === 'ALL' ? 'All Severities' : sev}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          {selectedLayer !== 'SHELTERS' && (
            <div>
              <label className="form-label" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Disaster Category
              </label>
              <select
                className="form-select"
                style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.65rem' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="FLOOD">Flooding &amp; Seawall Inundation</option>
                <option value="FIRE">Structural &amp; Wildfire</option>
                <option value="HAZMAT">Chemical &amp; HazMat</option>
                <option value="INFRASTRUCTURE">Bridge &amp; Road Infrastructure</option>
                <option value="POWER">Power Grid Outage</option>
                <option value="MEDICAL">Medical &amp; Mass Trauma</option>
              </select>
            </div>
          )}

          {/* Center-On-Incident List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
                Target Incidents ({filteredIncidents.length})
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>
                Click to pan map
              </span>
            </div>

            <div className="incident-quick-list" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {filteredIncidents.length === 0 ? (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', padding: '1rem', textAlign: 'center' }}>
                  No hazards match active filters.
                </div>
              ) : (
                filteredIncidents.map((inc) => {
                  const isSelected = selectedTarget?.id === inc.id;

                  return (
                    <div
                      key={inc.id}
                      className={`incident-quick-item ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectIncident(inc)}
                      role="button"
                      tabIndex={0}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span className="mono-id">{inc.id}</span>
                        <SeverityBadge severity={inc.severity} />
                      </div>

                      <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--color-neutral-900)', marginBottom: '0.2rem' }}>
                        {inc.title}
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={11} color="var(--color-primary-600)" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inc.address}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Action Footer inside sidebar */}
          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
            <Link to="/report" className="btn btn-emergency btn-sm btn-block">
              <AlertTriangle size={14} />
              <span>Report An Incident Here</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Map Canvas */}
      <main className="map-canvas-wrapper" role="region" aria-label="Interactive Leaflet Map">
        {/* Toggle button to reopen sidebar when collapsed */}
        {!isSidebarOpen && (
          <button
            type="button"
            className="btn btn-navy btn-sm"
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              zIndex: 1000,
              boxShadow: 'var(--shadow-md)'
            }}
            onClick={() => setIsSidebarOpen(true)}
          >
            <SlidersHorizontal size={14} />
            <span>Show Filters &amp; Incidents ({filteredIncidents.length})</span>
          </button>
        )}

        {/* Live Leaflet Map Component */}
        <DisasterLeafletMap
          incidents={filteredIncidents}
          shelters={filteredShelters}
          selectedTarget={selectedTarget}
          onMarkerClick={handleSelectIncident}
        />
      </main>
    </div>
  );
};
