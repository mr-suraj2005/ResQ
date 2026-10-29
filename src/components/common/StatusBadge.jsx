import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Navigation, 
  Flame, 
  ShieldCheck, 
  XCircle 
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING_REVIEW: {
    label: 'Pending Review',
    className: 'status-pending',
    icon: Clock
  },
  VERIFIED: {
    label: 'Verified',
    className: 'status-verified',
    icon: CheckCircle
  },
  DISPATCHED: {
    label: 'Dispatched',
    className: 'status-dispatched',
    icon: Truck
  },
  EN_ROUTE: {
    label: 'En Route',
    className: 'status-en-route',
    icon: Navigation
  },
  ON_SCENE: {
    label: 'On Scene',
    className: 'status-on-scene',
    icon: Flame
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'status-resolved',
    icon: ShieldCheck
  },
  REJECTED: {
    label: 'Rejected',
    className: 'status-rejected',
    icon: XCircle
  }
};

export const StatusBadge = ({ status }) => {
  const normalized = status ? status.toUpperCase().replace(/\s+/g, '_') : 'PENDING_REVIEW';
  const config = STATUS_CONFIG[normalized] || {
    label: status || 'Unknown',
    className: 'status-pending',
    icon: Clock
  };

  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon size={12} strokeWidth={2} />
      <span>{config.label}</span>
    </span>
  );
};

