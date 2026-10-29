import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialIncidents } from '../data/incidents';
import { initialAlerts } from '../data/alerts';
import { initialShelters } from '../data/shelters';
import { initialInventory } from '../data/inventory';
import { incidentService } from '../services/incidentService';
import { alertService } from '../services/alertService';
import { resourceService } from '../services/resourceService';

const EmergencyDataContext = createContext(null);

const STORAGE_KEYS = {
  INCIDENTS: 'resq_incidents_v1',
  ALERTS: 'resq_alerts_v1',
  SHELTERS: 'resq_shelters_v1',
  INVENTORY: 'resq_inventory_v1'
};

export const EmergencyDataProvider = ({ children }) => {
  // Load state from localStorage or initial seed
  const [incidents, setIncidents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      return saved ? JSON.parse(saved) : initialIncidents;
    } catch {
      return initialIncidents;
    }
  });

  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return saved ? JSON.parse(saved) : initialAlerts;
    } catch {
      return initialAlerts;
    }
  });

  const [shelters, setShelters] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHELTERS);
      return saved ? JSON.parse(saved) : initialShelters;
    } catch {
      return initialShelters;
    }
  });

  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      return saved ? JSON.parse(saved) : initialInventory;
    } catch {
      return initialInventory;
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(shelters));
  }, [shelters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  /* =========================================================================
     CROSS-ROLE REACTIVE MUTATIONS (VIA SERVICE ADAPTERS)
     ========================================================================= */

  /**
   * 1. Citizen submits emergency report
   * Reactivity: Immediately reflects in /my-reports and /admin/incidents as PENDING_REVIEW
   */
  const reportIncident = async (reportDto) => {
    setIsSubmitting(true);
    try {
      const created = await incidentService.create(reportDto);
      setIncidents(prev => [created, ...prev]);
      return created;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 2. Admin verifies an incident
   * Reactivity: Updates status to VERIFIED, adds note, immediately shows on map and feeds
   */
  const verifyIncident = async (incidentId, adminName) => {
    setIsSubmitting(true);
    try {
      const result = await incidentService.verify(incidentId, adminName);
      setIncidents(prev => prev.map(inc => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            verified: true,
            status: inc.status === 'PENDING_REVIEW' ? 'VERIFIED' : inc.status,
            notes: [...inc.notes, result.note]
          };
        }
        return inc;
      }));
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 3. Admin rejects an incident
   */
  const rejectIncident = async (incidentId, reason, adminName) => {
    setIsSubmitting(true);
    try {
      const result = await incidentService.reject(incidentId, reason, adminName);
      setIncidents(prev => prev.map(inc => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            verified: false,
            status: 'REJECTED',
            notes: [...inc.notes, result.note]
          };
        }
        return inc;
      }));
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 4. Admin assigns responder unit
   * Reactivity: Status becomes DISPATCHED, populates in /responder portal for that unit
   */
  const assignUnit = async (incidentId, unitName, adminName) => {
    setIsSubmitting(true);
    try {
      const result = await incidentService.assignUnit(incidentId, unitName, adminName);
      setIncidents(prev => prev.map(inc => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            assignedUnit: result.assignedUnit,
            status: 'DISPATCHED',
            notes: [...inc.notes, result.note]
          };
        }
        return inc;
      }));
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 5. Responder updates tactical status and field notes
   * Reactivity: Immediately updates status in /my-reports and /admin timeline
   */
  const updateIncidentTacticalStatus = async (incidentId, newStatus, fieldNote, responderName) => {
    setIsSubmitting(true);
    try {
      const result = await incidentService.updateStatus(incidentId, newStatus, fieldNote, responderName);
      setIncidents(prev => prev.map(inc => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: result.status,
            notes: result.note ? [...inc.notes, result.note] : inc.notes
          };
        }
        return inc;
      }));
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 6. Admin publishes an official alert
   * Reactivity: Immediately appears in /alerts and top AlertBanner across public portal
   */
  const createAlert = async (alertDto) => {
    setIsSubmitting(true);
    try {
      const newAlert = await alertService.create(alertDto);
      setAlerts(prev => [newAlert, ...prev]);
      return newAlert;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 7. Admin archives/deactivates an alert
   */
  const deactivateAlert = async (alertId) => {
    setIsSubmitting(true);
    try {
      await alertService.deactivate(alertId);
      setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, active: false } : a)));
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 8. Update shelter capacity / occupancy
   */
  const updateShelter = async (shelterId, newOccupancy, newStatus) => {
    setShelters(prev => prev.map(s => {
      if (s.id === shelterId) {
        const occ = newOccupancy !== undefined ? Number(newOccupancy) : s.occupancy;
        const stat = newStatus || (occ >= s.capacity ? 'FULL' : occ >= s.capacity * 0.85 ? 'NEAR_CAPACITY' : 'OPEN');
        return { ...s, occupancy: occ, status: stat };
      }
      return s;
    }));
  };

  /**
   * 9. Update relief inventory quantity
   */
  const updateInventory = async (itemId, newQuantity) => {
    setInventory(prev => prev.map(inv => {
      if (inv.id === itemId) {
        const q = Number(newQuantity);
        const status = q <= 0 ? 'CRITICAL' : q <= inv.minThreshold ? 'WARNING' : 'SUFFICIENT';
        return { ...inv, quantity: q, status, lastAudited: new Date().toISOString() };
      }
      return inv;
    }));
  };

  /**
   * Reset all mock data back to factory seeds
   */
  const resetToFactoryData = () => {
    setIncidents(initialIncidents);
    setAlerts(initialAlerts);
    setShelters(initialShelters);
    setInventory(initialInventory);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.SHELTERS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
  };

  // Precomputed Executive KPI metrics
  const activeAlerts = alerts.filter(a => a.active);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'CRITICAL');
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED');
  const pendingIncidents = incidents.filter(i => i.status === 'PENDING_REVIEW');
  const openShelters = shelters.filter(s => s.status === 'OPEN' || s.status === 'NEAR_CAPACITY');
  const deployedUnits = incidents.filter(i => i.assignedUnit && i.status !== 'RESOLVED').length;

  const value = {
    incidents,
    alerts,
    shelters,
    inventory,
    isSubmitting,
    // Actions
    reportIncident,
    verifyIncident,
    rejectIncident,
    assignUnit,
    updateIncidentTacticalStatus,
    createAlert,
    deactivateAlert,
    updateShelter,
    updateInventory,
    resetToFactoryData,
    // Metrics
    activeAlerts,
    criticalAlerts,
    activeIncidents,
    pendingIncidents,
    openShelters,
    deployedUnits
  };

  return (
    <EmergencyDataContext.Provider value={value}>
      {children}
    </EmergencyDataContext.Provider>
  );
};

export const useEmergencyData = () => {
  const context = useContext(EmergencyDataContext);
  if (!context) {
    throw new Error('useEmergencyData must be used within an EmergencyDataProvider');
  }
  return context;
};

