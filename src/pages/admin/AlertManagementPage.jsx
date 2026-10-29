import React, { useState } from 'react';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { 
  BellRing, 
  Send, 
  Archive, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
  Tag
} from 'lucide-react';

export const AlertManagementPage = () => {
  const { alerts, createAlert, deactivateAlert, isSubmitting } = useEmergencyData();
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    title: '',
    severity: 'WARNING',
    category: 'FLOOD',
    affectedZones: 'Downtown Waterfront, Harbor Island, Interbay',
    instructions: 'Evacuate subterranean and ground level floors.\nDo not drive through standing water.\nMonitor official local radio frequencies.',
    author: currentUser?.department || 'Seattle Unified Emergency Operations Command'
  });

  const [successBanner, setSuccessBanner] = useState(false);
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    await createAlert(form);
    setSuccessBanner(true);
    setTimeout(() => setSuccessBanner(false), 5000);

    // Reset with reasonable defaults
    setForm({
      title: '',
      severity: 'WARNING',
      category: 'FLOOD',
      affectedZones: 'Downtown Waterfront',
      instructions: 'Comply with instructions from field emergency responders.',
      author: currentUser?.department || 'Seattle Unified Emergency Operations Command'
    });
  };

  const displayedAlerts = filterActiveOnly 
    ? alerts.filter(a => a.active) 
    : alerts;

  return (
    <div>
      <PageHeader
        title="Official Broadcast Command"
        subtitle="Issue high-priority civic emergency directives. Broadcasts synchronize immediately with the public banner, citizen portal, and sirens."
        breadcrumb="ADMINISTRATION / ALERT BROADCASTS"
      />

      {successBanner && (
        <div 
          style={{
            backgroundColor: 'var(--color-success-50)',
            border: '1px solid var(--color-success-200)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--color-success-800)',
            fontSize: 'var(--text-sm)'
          }}
          role="status"
        >
          <CheckCircle2 size={20} color="var(--color-success-600)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Broadcast Successfully Dispatched:</strong> This alert is actively broadcasting across the top public banner and citizen notification channels.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Broadcast Publisher Form */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div className="card-header" style={{ padding: '0 0 1rem 0', borderBottom: '1px solid var(--color-border)', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="card-title">
                <Send size={18} color="var(--color-primary-600)" />
                <span>Publish Official Directive</span>
              </h3>
              <div className="card-subtitle">Authorize emergency broadcast across public channels</div>
            </div>
          </div>

          <form onSubmit={handlePublish}>
            <div className="form-group">
              <label className="form-label" htmlFor="alert-title">
                Alert Headline / Subject <span className="required">*</span>
              </label>
              <input
                id="alert-title"
                name="title"
                type="text"
                className="form-input"
                required
                placeholder="e.g. Flash Flood Emergency: Seawall Breach Detected"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="alert-severity">
                  Severity Rating <span className="required">*</span>
                </label>
                <select
                  id="alert-severity"
                  name="severity"
                  className="form-select"
                  value={form.severity}
                  onChange={handleChange}
                >
                  <option value="CRITICAL">Critical (Immediate Danger to Life)</option>
                  <option value="WARNING">Warning (Severe Disruption Threat)</option>
                  <option value="ADVISORY">Advisory (Cautionary Advisory)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="alert-category">
                  Hazard Classification <span className="required">*</span>
                </label>
                <select
                  id="alert-category"
                  name="category"
                  className="form-select"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="FLOOD">Flooding &amp; Inundation</option>
                  <option value="WEATHER">Severe Gale / Winter Storm</option>
                  <option value="HAZMAT">Chemical / HazMat Plume</option>
                  <option value="INFRASTRUCTURE">Bridge / Arterial Closure</option>
                  <option value="CIVIL">Civil Protection &amp; Curfew</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="alert-zones">
                Affected Zones (Comma-separated)
              </label>
              <input
                id="alert-zones"
                name="affectedZones"
                type="text"
                className="form-input"
                placeholder="e.g. Downtown Waterfront, Pioneer Square, SoDo"
                value={form.affectedZones}
                onChange={handleChange}
              />
              <div className="form-help">
                Specifying zones aids citizens and emergency responders in identifying localized boundaries.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="alert-instructions">
                Mandatory Citizen Directives (One step per line)
              </label>
              <textarea
                id="alert-instructions"
                name="instructions"
                className="form-textarea"
                rows="4"
                placeholder="Enter mandatory steps..."
                value={form.instructions}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="alert-author">
                Authoring Public Authority
              </label>
              <input
                id="alert-author"
                name="author"
                type="text"
                className="form-input"
                value={form.author}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-emergency btn-block btn-lg"
              disabled={isSubmitting}
              style={{ marginTop: '0.75rem' }}
            >
              <BellRing size={18} strokeWidth={2.2} />
              <span>Broadcast Official Directive Now</span>
            </button>
          </form>
        </div>

        {/* Right: Existing Broadcasts Directory */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Emergency Broadcast History ({displayedAlerts.length})
            </h3>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: 'var(--text-xs)', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={filterActiveOnly}
                onChange={(e) => setFilterActiveOnly(e.target.checked)}
              />
              <span>Active Only</span>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {displayedAlerts.map((alert) => (
              <article
                key={alert.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  opacity: alert.active ? 1 : 0.65,
                  borderLeft: alert.active 
                    ? (alert.severity === 'CRITICAL' ? '4px solid var(--color-emergency-600)' : '4px solid var(--color-warning-600)')
                    : '4px solid var(--color-neutral-400)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <span className="mono-id">{alert.id}</span>
                      <SeverityBadge severity={alert.severity} />
                      {alert.active ? (
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', fontWeight: 700, backgroundColor: 'var(--color-success-50)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-xs)' }}>
                          BROADCASTING
                        </span>
                      ) : (
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', fontWeight: 600, backgroundColor: 'var(--color-neutral-100)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-xs)' }}>
                          RESOLVED / ARCHIVED
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)' }}>
                      {alert.title}
                    </h4>
                  </div>

                  {alert.active && (
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      onClick={() => deactivateAlert(alert.id)}
                      title="Deactivate and archive this broadcast"
                    >
                      <Archive size={12} />
                      <span>Archive</span>
                    </button>
                  )}
                </div>

                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', marginBottom: '0.5rem' }}>
                  <strong>Affected Zones:</strong> {alert.affectedZones.join(', ')}
                </div>

                <div className="timestamp" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={11} />
                  <span>Issued: {new Date(alert.issuedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} &bull; {alert.author}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
