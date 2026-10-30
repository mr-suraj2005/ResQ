import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { DisasterLeafletMap } from '../../components/map/DisasterLeafletMap';
import { AIAnalysisPanel } from '../../components/ai/AIAnalysisPanel';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchBar } from '../../components/common/SearchBar';
import { 
  Layers, 
  MapPin, 
  AlertTriangle, 
  Building2, 
  Truck,
  Construction,
  Sparkles,
  SlidersHorizontal,
  X,
  Users,
  Eye,
  EyeOff,
  Radio,
  CheckSquare,
  Square
} from 'lucide-react';

export const DisasterMapPage = () => {
  const { incidents, shelters, blockedRoads, responseResources } = useEmergencyData();

  // Sidebar Tab: 'LAYERS' | 'AI_ENGINE'
  const [activeTab, setActiveTab] = useState('LAYERS');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // URL query parameter support (e.g. from /shelters View on Live Map)
  const [searchParams] = useSearchParams();
  const paramLat = searchParams.get('lat');
  const paramLng = searchParams.get('lng');
  const paramZoom = searchParams.get('zoom');

  useEffect(() => {
    if (paramLat && paramLng) {
      const lat = parseFloat(paramLat);
      const lng = parseFloat(paramLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const match = [...(shelters || []), ...(responseResources || [])].find(
          item => Math.abs(item.latitude - lat) < 0.02 && Math.abs(item.longitude - lng) < 0.02
        );
        if (match) {
          setSelectedTarget(match);
        } else {
          setSelectedTarget({
            id: 'NAV-TARGET',
            latitude: lat,
            longitude: lng,
            title: 'Selected Facility'
          });
        }
      }
    }
  }, [paramLat, paramLng, shelters, responseResources]);

  const mapCenter = useMemo(() => {
    if (paramLat && paramLng) {
      const lat = parseFloat(paramLat);
      const lng = parseFloat(paramLng);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    return [21.1458, 79.0882];
  }, [paramLat, paramLng]);

  const mapZoom = useMemo(() => {
    if (paramZoom) {
      const z = parseInt(paramZoom);
      if (!isNaN(z)) return z;
    }
    return (paramLat && paramLng) ? 10 : 5;
  }, [paramZoom, paramLat, paramLng]);

  // 5 Tactical Layer Toggles
  const [layerVisibility, setLayerVisibility] = useState({
    critical: true,
    high: true,
    unverified: true,
    resources: true,
    blockedRoads: true,
    shelters: true
  });

  const toggleLayer = (key) => {
    setLayerVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Exclude rejected reports from public map
      if (inc.status === 'REJECTED') return false;

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
  }, [incidents, selectedCategory, searchQuery]);

  const handleSelectIncident = (item) => {
    setSelectedTarget(item);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setLayerVisibility({
      critical: true,
      high: true,
      unverified: true,
      resources: true,
      blockedRoads: true,
      shelters: true
    });
  };

  return (
    <div className="map-layout-container">
      {/* Side Filter & Incident List Panel */}
      <aside 
        className="map-sidebar" 
        style={{ 
          display: isSidebarOpen ? 'flex' : 'none', 
          width: '380px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 10
        }}
        aria-label="Tactical Map Operations Panel"
      >
        {/* Sidebar Header & Tab Switcher */}
        <div style={{ borderBottom: '1px solid var(--color-border)', padding: '0.85rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--color-primary-600)" />
              <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, margin: 0, color: 'var(--color-neutral-900)' }}>
                Tactical GIS Operations
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button 
                type="button" 
                onClick={resetAllFilters}
                className="btn btn-ghost btn-xs"
                style={{ color: 'var(--color-primary-600)', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                title="Reset all filters"
              >
                Reset
              </button>
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

          {/* Tab Selector: Layers vs AI Engine */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: 'var(--color-neutral-100)', padding: '3px', borderRadius: 'var(--radius-pill)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('LAYERS')}
              style={{
                padding: '0.45rem 0.75rem',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: activeTab === 'LAYERS' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'LAYERS' ? 'var(--color-primary-800)' : 'var(--color-neutral-600)',
                fontWeight: 700,
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                boxShadow: activeTab === 'LAYERS' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <SlidersHorizontal size={13} />
              <span>5 Tactical Layers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('AI_ENGINE')}
              style={{
                padding: '0.45rem 0.75rem',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: activeTab === 'AI_ENGINE' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'AI_ENGINE' ? '#4F46E5' : 'var(--color-neutral-600)',
                fontWeight: 700,
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                boxShadow: activeTab === 'AI_ENGINE' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <Sparkles size={13} color="#4F46E5" />
              <span>AI Situation Engine</span>
            </button>
          </div>
        </div>

        {/* Sidebar Body */}
        <div className="map-sidebar-content" style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
          {activeTab === 'AI_ENGINE' ? (
            <div>
              <AIAnalysisPanel compact={true} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Search */}
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search incidents, streets, units..."
                onClear={() => setSearchQuery('')}
              />

              {/* 5 Tactical Layer Checkboxes */}
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-neutral-600)', marginBottom: '0.5rem' }}>
                  5 Tactical Display Layers
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {/* Layer 1: Critical */}
                  <div 
                    onClick={() => toggleLayer('critical')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: layerVisibility.critical ? '#FEF2F2' : 'var(--color-neutral-50)',
                      border: layerVisibility.critical ? '1px solid #FECACA' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#DC2626' }}></span>
                      <span style={{ fontWeight: 600, color: '#991B1B' }}>1. Critical Incidents</span>
                    </div>
                    {layerVisibility.critical ? <CheckSquare size={16} color="#DC2626" /> : <Square size={16} color="#94A3B8" />}
                  </div>

                  {/* Layer 2: High */}
                  <div 
                    onClick={() => toggleLayer('high')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: layerVisibility.high ? '#FFFBEB' : 'var(--color-neutral-50)',
                      border: layerVisibility.high ? '1px solid #FDE68A' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#D97706' }}></span>
                      <span style={{ fontWeight: 600, color: '#92400E' }}>2. High Priority Hazards</span>
                    </div>
                    {layerVisibility.high ? <CheckSquare size={16} color="#D97706" /> : <Square size={16} color="#94A3B8" />}
                  </div>

                  {/* Layer 3: Unverified */}
                  <div 
                    onClick={() => toggleLayer('unverified')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: layerVisibility.unverified ? '#EEF2FF' : 'var(--color-neutral-50)',
                      border: layerVisibility.unverified ? '1px solid #C7D2FE' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#6366F1', border: '1px dashed #FFFFFF' }}></span>
                      <span style={{ fontWeight: 600, color: '#4338CA' }}>3. Unverified Reports (?)</span>
                    </div>
                    {layerVisibility.unverified ? <CheckSquare size={16} color="#4F46E5" /> : <Square size={16} color="#94A3B8" />}
                  </div>

                  {/* Layer 4: Resources */}
                  <div 
                    onClick={() => toggleLayer('resources')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: layerVisibility.resources ? '#ECFDF5' : 'var(--color-neutral-50)',
                      border: layerVisibility.resources ? '1px solid #A7F3D0' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#15803D' }}></span>
                      <span style={{ fontWeight: 600, color: '#065F46' }}>4. Units &amp; Resources</span>
                    </div>
                    {layerVisibility.resources ? <CheckSquare size={16} color="#059669" /> : <Square size={16} color="#94A3B8" />}
                  </div>

                  {/* Layer 5: Blocked Routes */}
                  <div 
                    onClick={() => toggleLayer('blockedRoads')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: layerVisibility.blockedRoads ? '#F1F5F9' : 'var(--color-neutral-50)',
                      border: layerVisibility.blockedRoads ? '1px solid #CBD5E1' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#1E293B', border: '1px solid #DC2626' }}></span>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>5. Blocked Routes (✕)</span>
                    </div>
                    {layerVisibility.blockedRoads ? <CheckSquare size={16} color="#0F172A" /> : <Square size={16} color="#94A3B8" />}
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-neutral-600)' }}>
                  Disaster Category
                </label>
                <select
                  className="form-select"
                  style={{ fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-md)' }}
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

              {/* Interactive Target List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>
                    Mapped Targets ({filteredIncidents.length})
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>
                    Click to center &amp; zoom
                  </span>
                </div>

                <div className="incident-quick-list" style={{ maxHeight: '240px', overflowY: 'auto' }}>
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
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                            backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                            cursor: 'pointer',
                            marginBottom: '0.45rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                            <span className="mono-id" style={{ fontSize: '0.72rem' }}>{inc.id}</span>
                            <SeverityBadge severity={inc.severity} />
                          </div>

                          <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--color-neutral-900)', marginBottom: '0.2rem' }}>
                            {inc.title}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-neutral-500)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <MapPin size={11} color="var(--color-primary-600)" />
                              <span>{inc.address}</span>
                            </div>

                            {inc.peopleAffected && (
                              <span style={{ fontWeight: 700, color: '#B91C1C' }}>
                                ~{inc.peopleAffected}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Footer inside sidebar */}
          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
            <Link 
              to="/report" 
              className="btn btn-emergency btn-sm btn-block"
              style={{ borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
            >
              <AlertTriangle size={15} strokeWidth={2.2} />
              <span>Report An Emergency SOS</span>
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
              borderRadius: 'var(--radius-pill)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setIsSidebarOpen(true)}
          >
            <SlidersHorizontal size={14} />
            <span>Show Tactical Controls</span>
          </button>
        )}

        {/* Live Leaflet Map Component with 5 Tactical Layers */}
        <DisasterLeafletMap
          incidents={filteredIncidents}
          shelters={shelters}
          blockedRoads={blockedRoads}
          responseResources={responseResources}
          visibleLayers={layerVisibility}
          selectedTarget={selectedTarget}
          center={mapCenter}
          zoom={mapZoom}
          onMarkerClick={handleSelectIncident}
        />
      </main>
    </div>
  );
};
