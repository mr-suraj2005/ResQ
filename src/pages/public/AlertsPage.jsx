import React, { useState, useMemo } from 'react';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  Bell, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2,
  Share2
} from 'lucide-react';

export const AlertsPage = () => {
  const { alerts } = useEmergencyData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Severity filter
      if (selectedSeverity !== 'ALL' && alert.severity !== selectedSeverity) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = alert.title.toLowerCase().includes(query);
        const matchesCategory = alert.category.toLowerCase().includes(query);
        const matchesAuthor = alert.author.toLowerCase().includes(query);
        const matchesZones = alert.affectedZones.some(z => z.toLowerCase().includes(query));
        const matchesInstructions = alert.instructions.some(i => i.toLowerCase().includes(query));
        return matchesTitle || matchesCategory || matchesAuthor || matchesZones || matchesInstructions;
      }
      return true;
    });
  }, [alerts, selectedSeverity, searchQuery]);

  return (
    <div className="container page-container">
      <PageHeader
        title="Official Emergency Broadcasts"
        subtitle="Direct alerts issued by the Emergency Operations Center, National Weather Service, and regional public safety agencies."
        breadcrumb="PUBLIC PORTAL / ALERTS"
      />

      {/* Filter and Search Bar Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', maxWidth: '480px' }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Filter by zone, hazard type, or instructions..."
              onClear={() => setSearchQuery('')}
            />
          </div>

          {/* Severity Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['ALL', 'CRITICAL', 'WARNING', 'ADVISORY'].map((sev) => {
              const isActive = selectedSeverity === sev;
              return (
                <button
                  key={sev}
                  type="button"
                  className={`filter-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedSeverity(sev)}
                >
                  {sev === 'ALL' ? 'All Broadcasts' : sev}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Alerts List */}
      {filteredAlerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No active alerts match your criteria"
          description="Try selecting a different severity pill or clearing your search term."
          action={
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedSeverity('ALL');
              }}
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            const borderAccent = isCritical 
              ? 'var(--color-emergency-600)' 
              : isWarning 
                ? 'var(--color-warning-600)' 
                : 'var(--color-primary-600)';

            const Icon = isCritical ? AlertCircle : isWarning ? AlertTriangle : Info;

            return (
              <article 
                key={alert.id} 
                className="card"
                style={{ 
                  borderLeft: `4px solid ${borderAccent}`,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span className="mono-id">{alert.id}</span>
                    <span className={`badge ${
                      isCritical ? 'severity-critical' : isWarning ? 'severity-high' : 'severity-moderate'
                    }`}>
                      <Icon size={12} strokeWidth={2} />
                      <span>{alert.severity}</span>
                    </span>
                    <span style={{ 
                      fontSize: 'var(--text-xs)', 
                      fontWeight: 600, 
                      color: 'var(--color-neutral-600)',
                      backgroundColor: 'var(--color-neutral-100)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-xs)'
                    }}>
                      {alert.category}
                    </span>
                  </div>

                  <div className="timestamp" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={12} />
                    <span>Issued: {new Date(alert.issuedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>

                <div className="card-body">
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.75rem' }}>
                    {alert.title}
                  </h2>

                  {/* Affected Zones */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                      Affected Geographic Zones:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      {alert.affectedZones.map((zone, idx) => (
                        <span 
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 500,
                            color: 'var(--color-neutral-800)',
                            backgroundColor: 'var(--color-neutral-100)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <MapPin size={11} color="var(--color-primary-600)" />
                          <span>{zone}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mandatory Action Directives */}
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                      Civic Directives &amp; Safety Instructions:
                    </div>
                    <ul style={{ 
                      paddingLeft: '1.25rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.35rem',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-neutral-800)' 
                    }}>
                      {alert.instructions.map((step, idx) => (
                        <li key={idx} style={{ lineHeight: 1.5 }}>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="card-footer" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={14} color="var(--color-success-700)" />
                    <span>Authorized By: <strong>{alert.author}</strong></span>
                  </div>

                  <div>
                    Valid until: {new Date(alert.expiresAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

