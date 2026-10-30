import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Info, X, ChevronRight } from 'lucide-react';
import { useEmergencyData } from '../../context/EmergencyDataContext';

export const AlertBanner = () => {
  const { criticalAlerts = [], activeAlerts = [] } = useEmergencyData() || {};
  const [dismissed, setDismissed] = useState(false);

  // Focus on top critical alert if active, or top active warning
  const alert = (criticalAlerts && criticalAlerts[0]) || (activeAlerts && activeAlerts[0]);

  if (!alert || dismissed) return null;

  const isCritical = alert.severity === 'CRITICAL';
  const isWarning = alert.severity === 'WARNING';

  const bannerClass = isCritical 
    ? 'alert-banner-critical' 
    : isWarning 
      ? 'alert-banner-warning' 
      : 'alert-banner-info';

  const Icon = isCritical ? AlertCircle : isWarning ? AlertTriangle : Info;

  const zones = Array.isArray(alert.affectedZones)
    ? alert.affectedZones
    : typeof alert.affectedZones === 'string' && alert.affectedZones.trim()
      ? [alert.affectedZones]
      : [];

  return (
    <div className={`alert-banner ${bannerClass}`} role="region" aria-label="Official Emergency Broadcast">
      <div className="alert-banner-content">
        <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <span className="alert-banner-tag">{alert.severity || 'NOTICE'}</span>
          <span className="alert-banner-title" style={{ marginLeft: '0.5rem', wordBreak: 'break-word' }}>
            {alert.title || 'Official Civic Directive'}
          </span>
          {zones.length > 0 && (
            <span style={{ fontSize: 'var(--text-xs)', marginLeft: '0.5rem', opacity: 0.9 }}>
              — Affected: {zones.slice(0, 2).join(', ')}
            </span>
          )}
        </div>
        <Link to="/alerts" className="alert-banner-link" style={{ flexShrink: 0 }}>
          View Directives <ChevronRight size={12} style={{ display: 'inline', verticalAlign: '-1px' }} />
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="btn-ghost btn-xs"
        aria-label="Dismiss Alert Banner"
        style={{ padding: '0.2rem', color: 'inherit', opacity: 0.7, flexShrink: 0 }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
