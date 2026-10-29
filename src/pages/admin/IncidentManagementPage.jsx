import React, { useState, useMemo } from 'react';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { 
  AlertOctagon, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Filter,
  Eye,
  MessageSquare,
  ArrowRight,
  User
} from 'lucide-react';

const AVAILABLE_RESPONDER_UNITS = [
  "Marine Rescue Unit 1 (Seattle FD)",
  "Engine 22 & Ladder 4 (SLU Battalion)",
  "HazMat Task Force 1",
  "Medic Unit 18 & Red Cross Logistics",
  "City Light Grid Crew 7",
  "Heavy Rescue 1 & Dive Team",
  "Engine 29 (West Seattle)",
  "Disaster Medical Assistance Team (DMAT-WA1)"
];

export const IncidentManagementPage = () => {
  const { 
    incidents, 
    verifyIncident, 
    rejectIncident, 
    assignUnit,
    isSubmitting
  } = useEmergencyData();

  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal States
  const [assignModalIncident, setAssignModalIncident] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(AVAILABLE_RESPONDER_UNITS[0]);

  const [rejectModalIncident, setRejectModalIncident] = useState(null);
  const [rejectReason, setRejectReason] = useState('Duplicate or non-emergency report');

  const [detailModalIncident, setDetailModalIncident] = useState(null);

  // Filter Logic
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      if (selectedStatus !== 'ALL' && inc.status !== selectedStatus) return false;
      if (selectedSeverity !== 'ALL' && inc.severity !== selectedSeverity) return false;
      if (selectedCategory !== 'ALL' && inc.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          inc.id.toLowerCase().includes(q) ||
          inc.title.toLowerCase().includes(q) ||
          inc.address.toLowerCase().includes(q) ||
          inc.reportedBy.toLowerCase().includes(q) ||
          (inc.assignedUnit && inc.assignedUnit.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [incidents, selectedStatus, selectedSeverity, selectedCategory, searchQuery]);

  // Assign Unit Handler
  const handleOpenAssign = (incident) => {
    setAssignModalIncident(incident);
    setSelectedUnit(incident.assignedUnit || AVAILABLE_RESPONDER_UNITS[0]);
  };

  const handleConfirmAssign = async () => {
    if (!assignModalIncident) return;
    await assignUnit(assignModalIncident.id, selectedUnit, currentUser.name);
    setAssignModalIncident(null);
  };

  // Reject Handler
  const handleOpenReject = (incident) => {
    setRejectModalIncident(incident);
    setRejectReason('Duplicate report or resolved via telephone callback.');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalIncident) return;
    await rejectIncident(rejectModalIncident.id, rejectReason, currentUser.name);
    setRejectModalIncident(null);
  };

  return (
    <div>
      <PageHeader
        title="Incident Queue &amp; Dispatch Console"
        subtitle="Operational triage console: Validate citizen submissions, dispatch CAD responder units, and monitor lifecycle progression."
        breadcrumb="ADMINISTRATION / INCIDENT MANAGEMENT"
      />

      {/* Filter and Control Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
          <div>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Filter by ID, keywords, address, reporter, unit..."
              onClear={() => setSearchQuery('')}
            />
          </div>

          <div>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses ({incidents.length})</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="EN_ROUTE">En Route</option>
              <option value="ON_SCENE">On Scene</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <select
              className="form-select"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="FLOOD">Flooding</option>
              <option value="FIRE">Structural Fire</option>
              <option value="HAZMAT">HazMat</option>
              <option value="INFRASTRUCTURE">Infrastructure</option>
              <option value="POWER">Power Grid</option>
              <option value="MEDICAL">Medical Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident Management Table */}
      <div className="table-container">
        <table className="civic-table">
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Incident Details &amp; Address</th>
              <th>Class</th>
              <th>Severity</th>
              <th>Lifecycle Status</th>
              <th>Assigned Unit</th>
              <th style={{ textAlign: 'right' }}>Operational Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-neutral-500)' }}>
                  No incidents match the active search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredIncidents.map((inc) => (
                <tr key={inc.id}>
                  <td>
                    <span className="mono-id">{inc.id}</span>
                  </td>

                  <td style={{ maxWidth: '320px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                      {inc.title}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                      <MapPin size={11} color="var(--color-primary-600)" />
                      <span>{inc.address}</span>
                    </div>
                    <div className="timestamp" style={{ fontSize: '0.7rem', marginTop: '0.15rem' }}>
                      Reported by: {inc.reportedBy} ({new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
                      {inc.category}
                    </span>
                  </td>

                  <td>
                    <SeverityBadge severity={inc.severity} />
                  </td>

                  <td>
                    <StatusBadge status={inc.status} />
                  </td>

                  <td>
                    {inc.assignedUnit ? (
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                        {inc.assignedUnit}
                      </span>
                    ) : (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>
                        None Dispatched
                      </span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      {/* View Details */}
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => setDetailModalIncident(inc)}
                        title="View Incident Telemetry & Field Notes"
                      >
                        <Eye size={12} />
                        <span>Details</span>
                      </button>

                      {/* Verify Action */}
                      {!inc.verified && inc.status === 'PENDING_REVIEW' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          onClick={() => verifyIncident(inc.id, currentUser.name)}
                          title="Authorize and verify this report"
                        >
                          <CheckCircle size={12} />
                          <span>Verify</span>
                        </button>
                      )}

                      {/* Assign Unit Action */}
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        onClick={() => handleOpenAssign(inc)}
                        title="Assign or reassign CAD responder unit"
                      >
                        <Truck size={12} />
                        <span>{inc.assignedUnit ? 'Reassign' : 'Assign Unit'}</span>
                      </button>

                      {/* Reject Action */}
                      {inc.status !== 'REJECTED' && inc.status !== 'RESOLVED' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          style={{ color: 'var(--color-emergency-600)' }}
                          onClick={() => handleOpenReject(inc)}
                          title="Reject report with explanation"
                        >
                          <XCircle size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Unit Modal Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(assignModalIncident)}
        title="Dispatch Tactical CAD Responder Unit"
        confirmText="Confirm Unit Dispatch"
        confirmVariant="primary"
        onConfirm={handleConfirmAssign}
        onCancel={() => setAssignModalIncident(null)}
      >
        {assignModalIncident && (
          <div>
            <div style={{ backgroundColor: 'var(--color-neutral-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-neutral-500)', fontWeight: 700 }}>
                Incident Details:
              </div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)', marginTop: '0.2rem' }}>
                {assignModalIncident.id} — {assignModalIncident.title}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)' }}>
                Location: {assignModalIncident.address}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="unit-selector">
                Select Responding Agency &amp; Unit <span className="required">*</span>
              </label>
              <select
                id="unit-selector"
                className="form-select"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
              >
                {AVAILABLE_RESPONDER_UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <div className="form-help">
                Assigning an operational unit updates the incident status to <code>DISPATCHED</code> and routes tactical telemetry to the responder's Mobile Data Terminal.
              </div>
            </div>
          </div>
        )}
      </ConfirmationDialog>

      {/* Reject Incident Reason Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(rejectModalIncident)}
        title="Reject Incident Report"
        confirmText="Reject &amp; Archive"
        confirmVariant="emergency"
        onConfirm={handleConfirmReject}
        onCancel={() => setRejectModalIncident(null)}
      >
        {rejectModalIncident && (
          <div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)', marginBottom: '1rem' }}>
              Are you sure you want to flag <strong>{rejectModalIncident.id}</strong> as rejected? The reporter will be notified that the incident has been flagged.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="reject-reason">
                Justification / Explanation <span className="required">*</span>
              </label>
              <textarea
                id="reject-reason"
                className="form-textarea"
                rows="3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="State reason for rejection..."
              />
            </div>
          </div>
        )}
      </ConfirmationDialog>

      {/* Detail Inspection Modal Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(detailModalIncident)}
        title={detailModalIncident ? `${detailModalIncident.id} — Operational Telemetry` : 'Incident Details'}
        confirmText="Close"
        confirmVariant="navy"
        onConfirm={() => setDetailModalIncident(null)}
        onCancel={() => setDetailModalIncident(null)}
      >
        {detailModalIncident && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="mono-id">{detailModalIncident.id}</span>
              <SeverityBadge severity={detailModalIncident.severity} />
              <StatusBadge status={detailModalIncident.status} />
              {detailModalIncident.verified && (
                <span className="badge" style={{ backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-700)', borderColor: 'var(--color-success-200)' }}>
                  <ShieldCheck size={12} />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {detailModalIncident.title}
              </h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                {detailModalIncident.description}
              </p>
            </div>

            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: 'var(--color-neutral-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <div><strong>Location:</strong> {detailModalIncident.address}</div>
              <div><strong>GPS:</strong> {detailModalIncident.latitude}° N, {detailModalIncident.longitude}° W</div>
              <div><strong>Reported By:</strong> {detailModalIncident.reportedBy}</div>
              <div><strong>Assigned Unit:</strong> {detailModalIncident.assignedUnit || 'Unassigned'}</div>
            </div>

            {/* Field Notes History */}
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MessageSquare size={13} />
                <span>Field Progress Notes ({detailModalIncident.notes?.length || 0})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
                {detailModalIncident.notes?.map(note => (
                  <div key={note.id} style={{ backgroundColor: 'var(--color-neutral-50)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--text-xs)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--color-neutral-900)', marginBottom: '0.2rem' }}>
                      <span>{note.author} ({note.role})</span>
                      <span className="timestamp">{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ color: 'var(--color-neutral-700)' }}>{note.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};
