import React from 'react';
import { AlertCircle, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

const SEVERITY_CONFIG = {
  CRITICAL: {
    label: 'Critical',
    className: 'severity-critical',
    icon: AlertOctagon
  },
  HIGH: {
    label: 'High',
    className: 'severity-high',
    icon: AlertTriangle
  },
  MODERATE: {
    label: 'Moderate',
    className: 'severity-moderate',
    icon: AlertCircle
  },
  LOW: {
    label: 'Low',
    className: 'severity-low',
    icon: Info
  }
};

export const SeverityBadge = ({ severity }) => {
  const normalized = severity ? severity.toUpperCase() : 'MODERATE';
  const config = SEVERITY_CONFIG[normalized] || {
    label: severity || 'Moderate',
    className: 'severity-moderate',
    icon: AlertCircle
  };

  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon size={12} strokeWidth={2} />
      <span>{config.label}</span>
    </span>
  );
};

