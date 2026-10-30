import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  FileText, 
  Clock, 
  MapPin, 
  PlusCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Truck, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  Compass,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

export const CitizenReportsPage = () => {
  const { incidents } = useEmergencyData();
  const { currentUser } = useAuth();

  const [expandedIds, setExpandedIds] = useState(() => {
    // Expand the first incident by default
    return incidents.length > 0 ? { [incidents[0].id]: true } : {};
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredReports = incidents.filter(inc => {
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.address.toLowerCase().includes(q) ||
        inc.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="container-narrow page-container">
      <PageHeader
        title="Citizen Incident Tracking"
        subtitle="Live tracking console for submitted emergency reports. View validation credentials, CAD unit dispatches, and tactical responder field logs."
        breadcrumb="CITIZEN PORTAL / MY REPORTS"
        actions={
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link to="/map" className="btn btn-outline btn-sm">
              <Compass size={15} />
              <span>View On Live Map</span>
            </Link>
            <Link to="/report" className="btn btn-emergency btn-sm">
              <PlusCircle size={15} />
              <span>Report New Incident</span>
            </Link>
          </div>
        }
      />

      {/* Control Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem', alignItems: 'center' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search reports by ID, headline, or location..."
            onClear={() => setSearchQuery('')}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>
              Filter:
            </span>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: 'var(--text-xs)', padding: '0.35rem 0.65rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses ({incidents.length})</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="EN_ROUTE">En Route</option>
              <option value="ON_SCENE">On Scene</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident List */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No incident reports match your query"
          description="Try adjusting your status filter or clearing the search query to see your submitted incidents."
          action={
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredReports.map((incident) => {
            const isExpanded = Boolean(expandedIds[incident.id]);

            const isPending = incident.status === 'PENDING_REVIEW';
            const isResolved = incident.status === 'RESOLVED';
            const isRejected = incident.status === 'REJECTED';

            const borderHighlight = isResolved
              ? '4px solid var(--color-success-600)'
              : isPending
                ? '4px solid var(--color-warning-600)'
                : isRejected
                  ? '4px solid var(--color-neutral-400)'
                  : '4px solid var(--color-primary-600)';

            return (
              <article
                key={incident.id}
                className="card"
                style={{
                  borderLeft: borderHighlight,
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <header
                  className="card-header"
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleExpand(incident.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span className="mono-id">{incident.id}</span>
                      <SeverityBadge severity={incident.severity} />
                      <StatusBadge status={incident.status} />

                      {/* Verification Status Pill */}
                      {incident.verified ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          color: 'var(--color-success-700)',
                          backgroundColor: 'var(--color-success-50)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--color-success-200)'
                        }}>
                          <ShieldCheck size={12} />
                          <span>EOC Verified</span>
                        </span>
                      ) : isRejected ? (
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          color: 'var(--color-neutral-600)',
                          backgroundColor: 'var(--color-neutral-100)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-xs)'
                        }}>
                          Flagged Duplicate / Rejected
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          color: 'var(--color-warning-800)',
                          backgroundColor: 'var(--color-warning-50)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--color-warning-200)'
                        }}>
                          Awaiting EOC Dispatch Triage
                        </span>
                      )}
                    </div>

                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                      {incident.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="btn-ghost btn-xs"
                    aria-label={isExpanded ? 'Collapse report' : 'Expand report'}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </header>

                <div className="card-body">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-neutral-600)',
                    marginBottom: '0.85rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} color="var(--color-primary-600)" />
                      <span>{incident.address}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} />
                      <span>Reported: {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                    </div>

                    {incident.assignedUnit && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-neutral-800)', fontWeight: 600 }}>
                        <Truck size={13} />
                        <span>Unit Dispatched: {incident.assignedUnit}</span>
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                    {incident.description}
                  </p>

                  {/* Attached photo thumbnail if available */}
                  {incident.imageUrl && (
                    <div style={{ margin: '0.75rem 0' }}>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ImageIcon size={12} />
                        <span>Attached Photo Telemetry:</span>
                      </div>
                      <img
                        src={incident.imageUrl}
                        alt="Citizen Scene Capture"
                        style={{
                          width: '120px',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)'
                        }}
                      />
                    </div>
                  )}

                  {/* Expandable Field Notes & Tactical Log Timeline */}
                  {isExpanded && (
                    <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--color-neutral-500)',
                        marginBottom: '0.75rem',
                        letterSpacing: '0.04em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <MessageSquare size={13} />
                        <span>CAD Dispatch &amp; Tactical Responder Log ({incident.notes?.length || 0})</span>
                      </div>

                      {incident.notes && incident.notes.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {incident.notes.map((note) => {
                            const isSystem = note.role === 'SYSTEM';
                            const isAdmin = note.role === 'ADMIN';
                            const isResponder = note.role === 'RESPONDER';

                            const noteBadgeBg = isSystem
                              ? 'var(--color-neutral-200)'
                              : isAdmin
                                ? '#DBEAFE'
                                : '#DCFCE7';

                            const noteBadgeColor = isSystem
                              ? 'var(--color-neutral-700)'
                              : isAdmin
                                ? '#1D4ED8'
                                : '#15803D';

                            return (
                              <div
                                key={note.id}
                                style={{
                                  backgroundColor: 'var(--color-neutral-50)',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: 'var(--radius-md)',
                                  padding: '0.75rem 1rem'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                    <span style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      padding: '0.1rem 0.4rem',
                                      borderRadius: 'var(--radius-xs)',
                                      backgroundColor: noteBadgeBg,
                                      color: noteBadgeColor,
                                      textTransform: 'uppercase'
                                    }}>
                                      {note.role}
                                    </span>
                                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                                      {note.author}
                                    </span>
                                  </div>

                                  <span className="timestamp">
                                    {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>

                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-700)', margin: 0, lineHeight: 1.5 }}>
                                  {note.text}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', fontStyle: 'italic' }}>
                          No responder field notes logged yet. Notes appear automatically as responders provide status updates.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <footer className="card-footer" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Compass size={13} color="var(--color-primary-600)" />
                    <span>Coordinates: <code>{incident.latitude.toFixed(4)}° N, {incident.longitude.toFixed(4)}° W</code></span>
                  </div>

                  <Link to="/map" className="btn btn-outline btn-xs">
                    <span>Inspect On Threat Map</span>
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
