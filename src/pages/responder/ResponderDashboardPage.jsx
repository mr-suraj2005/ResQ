import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  Radio, 
  MapPin, 
  Send, 
  CheckCircle, 
  Navigation, 
  Flame, 
  ShieldCheck, 
  MessageSquare,
  Clock,
  AlertTriangle,
  Truck,
  ArrowRight,
  CheckCircle2,
  Phone
} from 'lucide-react';

const tacticalPinIcon = L.divIcon({
  className: 'resq-map-marker marker-critical',
  html: `
    <div class="marker-pin" style="background-color: #DC2626;">
      <span class="marker-glyph" style="font-weight: 800; font-size: 13px;">!</span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// Helper component for smooth panning
function MapRecenter({ coords }) {
  const map = useMap();
  React.useEffect(() => {
    if (coords) {
      map.flyTo(coords, 14, { animate: true });
      map.invalidateSize();
    }
  }, [coords, map]);
  return null;
}

function InvalidateMapSize() {
  const map = useMap();
  React.useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

const LIFECYCLE_STEPS = [
  { key: 'DISPATCHED', label: 'Dispatched', icon: Truck },
  { key: 'EN_ROUTE', label: 'En Route', icon: Navigation },
  { key: 'ON_SCENE', label: 'On Scene', icon: Flame },
  { key: 'RESOLVED', label: 'Resolved', icon: ShieldCheck }
];

export const ResponderDashboardPage = () => {
  const { incidents, updateIncidentTacticalStatus, isSubmitting } = useEmergencyData();
  const { currentUser } = useAuth();

  const [filterMode, setFilterMode] = useState('ALL_DISPATCHED'); // 'ALL_DISPATCHED' | 'MY_UNIT'
  const [fieldNoteText, setFieldNoteText] = useState('');
  const [noteSentFeedback, setNoteSentFeedback] = useState(false);

  // Active missions
  const activeMissions = useMemo(() => {
    return incidents.filter(inc => {
      if (inc.status === 'REJECTED') return false;

      if (filterMode === 'MY_UNIT') {
        const unitName = currentUser.unit || 'Marine Rescue Unit 1';
        return inc.assignedUnit && inc.assignedUnit.includes(unitName);
      }

      // Default: show any incident assigned or actively in progress
      return Boolean(inc.assignedUnit) || inc.status === 'DISPATCHED' || inc.status === 'EN_ROUTE' || inc.status === 'ON_SCENE';
    });
  }, [incidents, filterMode, currentUser.unit]);

  const [selectedIncidentId, setSelectedIncidentId] = useState(
    activeMissions[0]?.id || incidents[0]?.id
  );

  const selectedIncident = useMemo(() => {
    return incidents.find(i => i.id === selectedIncidentId) || activeMissions[0] || incidents[0];
  }, [incidents, selectedIncidentId, activeMissions]);

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedIncident) return;
    const responderTitle = `${currentUser.name} (${currentUser.unit || 'Field Responder'})`;
    const auditNote = `CAD telemetry update: Unit transitioned incident state to ${newStatus}.`;

    await updateIncidentTacticalStatus(
      selectedIncident.id,
      newStatus,
      auditNote,
      currentUser.name
    );
  };

  const handleTransmitFieldNote = async (e) => {
    e.preventDefault();
    if (!fieldNoteText.trim() || !selectedIncident) return;

    await updateIncidentTacticalStatus(
      selectedIncident.id,
      selectedIncident.status,
      fieldNoteText.trim(),
      currentUser.name
    );

    setFieldNoteText('');
    setNoteSentFeedback(true);
    setTimeout(() => setNoteSentFeedback(false), 3000);
  };

  // Find index in lifecycle
  const currentStepIndex = LIFECYCLE_STEPS.findIndex(
    s => s.key === selectedIncident?.status
  );

  return (
    <div>
      <PageHeader
        title="Tactical Incident Response Terminal"
        subtitle={`Mobile Data Terminal (MDT) for CAD unit: ${currentUser.unit || 'Marine Rescue Unit 1'} &bull; Commander Operator: ${currentUser.name}`}
        breadcrumb="RESPONDER / MOBILE DATA TERMINAL"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.75rem', alignItems: 'start' }}>
        {/* Left Pane: Incident Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', letterSpacing: '0.04em' }}>
              Active Unit Queue ({activeMissions.length})
            </span>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                className={`filter-pill ${filterMode === 'ALL_DISPATCHED' ? 'active' : ''}`}
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                onClick={() => setFilterMode('ALL_DISPATCHED')}
              >
                All Dispatched
              </button>
              <button
                type="button"
                className={`filter-pill ${filterMode === 'MY_UNIT' ? 'active' : ''}`}
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                onClick={() => setFilterMode('MY_UNIT')}
              >
                My Unit Only
              </button>
            </div>
          </div>

          {activeMissions.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="No missions currently dispatched"
              description="Your unit queue is clear. Incidents dispatched by EOC Command will instantly alert this terminal."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeMissions.map((mission) => {
                const isSelected = selectedIncident?.id === mission.id;

                return (
                  <article
                    key={mission.id}
                    className="card"
                    style={{
                      padding: '1.1rem',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '4px solid var(--color-primary-600)' : '4px solid var(--color-border)',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                      backgroundColor: isSelected ? 'var(--color-neutral-50)' : 'var(--color-bg-surface)'
                    }}
                    onClick={() => setSelectedIncidentId(mission.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span className="mono-id">{mission.id}</span>
                      <SeverityBadge severity={mission.severity} />
                    </div>

                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.3rem' }}>
                      {mission.title}
                    </h3>

                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.65rem' }}>
                      <MapPin size={12} color="var(--color-primary-600)" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mission.address}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                      <StatusBadge status={mission.status} />
                      <span className="timestamp">
                        {new Date(mission.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Incident Action Workspace */}
        {selectedIncident ? (
          <div className="card" style={{ padding: '1.75rem' }}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="mono-id">{selectedIncident.id}</span>
                  <SeverityBadge severity={selectedIncident.severity} />
                  <StatusBadge status={selectedIncident.status} />
                  {selectedIncident.verified && (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', fontWeight: 700, backgroundColor: 'var(--color-success-50)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-xs)' }}>
                      EOC CLEARANCE
                    </span>
                  )}
                </div>

                <div className="timestamp">
                  Reported: {new Date(selectedIncident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </div>
              </div>

              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: '0.35rem' }}>
                {selectedIncident.title}
              </h2>

              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} color="var(--color-primary-600)" />
                <span><strong>Target Location:</strong> {selectedIncident.address} &bull; Coordinates: <code>{selectedIncident.latitude.toFixed(4)}° N, {selectedIncident.longitude.toFixed(4)}° W</code></span>
              </div>
            </div>

            {/* Tactical Status Step Progression */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                CAD Mission Lifecycle Progression
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isCurrent = selectedIncident.status === step.key;
                  const isPast = currentStepIndex > idx;

                  let btnStyle = 'btn-outline';
                  let customBg = undefined;

                  if (isCurrent) {
                    btnStyle = step.key === 'ON_SCENE' ? 'btn-emergency' : step.key === 'RESOLVED' ? 'btn-navy' : 'btn-primary';
                  }

                  return (
                    <button
                      key={step.key}
                      type="button"
                      className={`btn ${btnStyle}`}
                      style={{
                        padding: '0.65rem 0.45rem',
                        fontSize: 'var(--text-xs)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.3rem',
                        borderWidth: isCurrent ? '2px' : '1px',
                        backgroundColor: customBg
                      }}
                      onClick={() => handleUpdateStatus(step.key)}
                      disabled={isSubmitting}
                      title={`Transition incident to ${step.label}`}
                    >
                      <StepIcon size={16} strokeWidth={2} />
                      <span style={{ fontWeight: 700 }}>{step.label}</span>
                      {isPast && <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>✓ Passed</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tactical Mini Map */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                Live GPS Vector
              </div>
              <div className="map-picker-wrapper" style={{ height: '220px', width: '100%' }}>
                <MapContainer
                  center={[selectedIncident.latitude, selectedIncident.longitude]}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <InvalidateMapSize />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />
                  <MapRecenter coords={[selectedIncident.latitude, selectedIncident.longitude]} />
                  <Marker
                    position={[selectedIncident.latitude, selectedIncident.longitude]}
                    icon={tacticalPinIcon}
                  />
                </MapContainer>
              </div>
            </div>

            {/* Citizen Scene Narrative */}
            <div style={{ backgroundColor: 'var(--color-neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.35rem' }}>
                Citizen Witness Narrative
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-800)', margin: 0, lineHeight: 1.5 }}>
                {selectedIncident.description}
              </p>
            </div>

            {/* Timestamped Tactical Field Log History */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MessageSquare size={13} />
                <span>Field Activity &amp; Ingestion Log ({selectedIncident.notes?.length || 0})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '200px', overflowY: 'auto' }}>
                {selectedIncident.notes?.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      backgroundColor: 'var(--color-neutral-50)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                        {note.author} <span style={{ opacity: 0.6 }}>({note.role})</span>
                      </span>
                      <span className="timestamp">
                        {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ color: 'var(--color-neutral-700)', lineHeight: 1.4 }}>
                      {note.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Note Input */}
            <form onSubmit={handleTransmitFieldNote} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
              <label className="form-label" htmlFor="tactical-field-note">
                Transmit Field Observation / SitRep Note
              </label>

              {noteSentFeedback && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={13} />
                  <span>Field note broadcast to EOC dispatch and citizen portal timeline.</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <input
                  id="tactical-field-note"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Primary fire extinguished, overhaul underway, 0 civilian injuries..."
                  value={fieldNoteText}
                  onChange={(e) => setFieldNoteText(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !fieldNoteText.trim()}
                >
                  <Send size={15} />
                  <span>Transmit</span>
                </button>
              </div>
              <div className="form-help">
                Appended field notes update instantly in real time for citizen tracking and administrative review.
              </div>
            </form>
          </div>
        ) : (
          <EmptyState
            icon={Radio}
            title="Select an incident from the queue"
            description="Choose an incident on the left to review telemetry and take tactical CAD actions."
          />
        )}
      </div>
    </div>
  );
};
