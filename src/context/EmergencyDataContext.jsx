import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialIncidents } from '../data/incidents';
import { initialAlerts } from '../data/alerts';
import { initialShelters } from '../data/shelters';
import { initialInventory } from '../data/inventory';
import { initialBlockedRoads, initialResponseResources } from '../data/tacticalLayers';
import { incidentService } from '../services/incidentService';
import { alertService } from '../services/alertService';
import { resourceService } from '../services/resourceService';
import { 
  testSupabaseConnection,
  fetchRemoteIncidents,
  insertRemoteIncident,
  updateRemoteIncident,
  fetchRemoteAlerts,
  insertRemoteAlert,
  fetchRemoteShelters,
  updateRemoteShelter,
  fetchRemoteBlockedRoads,
  fetchRemoteResponseResources,
  invokeAICrisisAnalysis,
  supabaseConfig
} from '../services/supabaseClient';

const EmergencyDataContext = createContext(null);

const STORAGE_KEYS = {
  INCIDENTS: 'resq_incidents_v2',
  ALERTS: 'resq_alerts_v2',
  SHELTERS: 'resq_shelters_v2',
  INVENTORY: 'resq_inventory_v2',
  BLOCKED_ROADS: 'resq_blocked_roads_v2',
  RESOURCES: 'resq_resources_v2'
};

export const EmergencyDataProvider = ({ children }) => {
  // Supabase Backend Status: 'CONNECTING' | 'CONNECTED' | 'CONNECTED_PENDING_SCHEMA' | 'OFFLINE'
  const [supabaseStatus, setSupabaseStatus] = useState('CONNECTING');
  const [supabaseMessage, setSupabaseMessage] = useState('Initializing Supabase client...');

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

  const [blockedRoads, setBlockedRoads] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLOCKED_ROADS);
      return saved ? JSON.parse(saved) : initialBlockedRoads;
    } catch {
      return initialBlockedRoads;
    }
  });

  const [responseResources, setResponseResources] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      return saved ? JSON.parse(saved) : initialResponseResources;
    } catch {
      return initialResponseResources;
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize and synchronise Supabase remote state on startup
  useEffect(() => {
    let isMounted = true;
    const initSupabase = async () => {
      try {
        const res = await testSupabaseConnection();
        if (!isMounted) return;

        if (res.connected && res.tablesFound) {
          setSupabaseStatus('CONNECTED');
          setSupabaseMessage('Connected to Supabase PostgreSQL & Real-time Layer');

          // Fetch remote records
          const [remoteInc, remoteAlt, remoteShl, remoteRds, remoteRes] = await Promise.all([
            fetchRemoteIncidents(),
            fetchRemoteAlerts(),
            fetchRemoteShelters(),
            fetchRemoteBlockedRoads(),
            fetchRemoteResponseResources()
          ]);

          if (!isMounted) return;
          if (remoteInc && remoteInc.length > 0) setIncidents(remoteInc);
          if (remoteAlt && remoteAlt.length > 0) setAlerts(remoteAlt);
          if (remoteShl && remoteShl.length > 0) setShelters(remoteShl);
          if (remoteRds && remoteRds.length > 0) setBlockedRoads(remoteRds);
          if (remoteRes && remoteRes.length > 0) setResponseResources(remoteRes);
        } else if (res.connected) {
          setSupabaseStatus('CONNECTED_PENDING_SCHEMA');
          setSupabaseMessage('Connected to Supabase project vgwpwhgltnrjzfclmzlw. Tables pending SQL migration.');
        } else {
          setSupabaseStatus('OFFLINE');
          setSupabaseMessage('Supabase offline or unreachable. Using local cache.');
        }
      } catch (err) {
        if (!isMounted) return;
        setSupabaseStatus('OFFLINE');
        setSupabaseMessage('Local reactive fallback active.');
      }
    };

    initSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to localStorage as fail-safe cache
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLOCKED_ROADS, JSON.stringify(blockedRoads));
  }, [blockedRoads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(responseResources));
  }, [responseResources]);

  /* =========================================================================
     CROSS-ROLE REACTIVE MUTATIONS (HYBRID LOCAL + SUPABASE BACKEND)
     ========================================================================= */

  /**
   * 1. Citizen submits emergency report
   */
  const reportIncident = async (reportDto) => {
    setIsSubmitting(true);
    try {
      const created = await incidentService.create(reportDto);
      setIncidents(prev => [created, ...prev]);

      // Synchronise to Supabase in background
      insertRemoteIncident(created).catch(() => {});

      return created;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 2. Admin verifies an incident
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
            isVerified: true,
            status: inc.status === 'PENDING_REVIEW' ? 'VERIFIED' : inc.status,
            notes: [...(inc.notes || []), result.note]
          };
        }
        return inc;
      }));

      // Synchronise to Supabase
      updateRemoteIncident(incidentId, { isVerified: true, status: 'VERIFIED' }).catch(() => {});

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
            isVerified: false,
            status: 'REJECTED',
            notes: [...(inc.notes || []), result.note]
          };
        }
        return inc;
      }));

      // Synchronise to Supabase
      updateRemoteIncident(incidentId, { isVerified: false, status: 'REJECTED' }).catch(() => {});

      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 4. Admin assigns responder unit
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
            notes: [...(inc.notes || []), result.note]
          };
        }
        return inc;
      }));

      // Synchronise to Supabase
      updateRemoteIncident(incidentId, { assignedUnit: unitName, status: 'DISPATCHED' }).catch(() => {});

      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 5. Responder updates tactical status and field notes
   */
  const updateIncidentTacticalStatus = async (incidentId, newStatus, fieldNote, responderName) => {
    setIsSubmitting(true);
    try {
      const result = await incidentService.updateStatus(incidentId, newStatus, fieldNote, responderName);
      let updatedNotes = [];
      setIncidents(prev => prev.map(inc => {
        if (inc.id === incidentId) {
          updatedNotes = result.note ? [...(inc.notes || []), result.note] : (inc.notes || []);
          return {
            ...inc,
            status: result.status,
            notes: updatedNotes
          };
        }
        return inc;
      }));

      // Synchronise to Supabase
      updateRemoteIncident(incidentId, { status: newStatus, fieldNotes: updatedNotes }).catch(() => {});

      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 6. Admin publishes an official alert
   */
  const createAlert = async (alertDto) => {
    setIsSubmitting(true);
    try {
      const newAlert = await alertService.create(alertDto);
      setAlerts(prev => [newAlert, ...prev]);

      // Synchronise to Supabase
      insertRemoteAlert(newAlert).catch(() => {});

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
        // Synchronise to Supabase
        updateRemoteShelter(shelterId, { occupancy: occ, status: stat }).catch(() => {});
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
    setBlockedRoads(initialBlockedRoads);
    setResponseResources(initialResponseResources);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.SHELTERS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.BLOCKED_ROADS);
    localStorage.removeItem(STORAGE_KEYS.RESOURCES);
    // Legacy cleanup
    ['resq_incidents_v1', 'resq_alerts_v1', 'resq_shelters_v1', 'resq_inventory_v1', 'resq_blocked_roads_v1', 'resq_resources_v1'].forEach(k => localStorage.removeItem(k));
  };

  // Precomputed Executive KPI metrics
  const activeAlerts = alerts.filter(a => a.active !== false);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'CRITICAL');
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED');
  const pendingIncidents = incidents.filter(i => i.status === 'PENDING_REVIEW' || !i.isVerified);
  const openShelters = shelters.filter(s => 
    s.status === 'OPEN' || 
    s.status === 'NEAR_CAPACITY' || 
    s.status === 'OPERATIONAL' || 
    s.status === 'ACTIVE NETWORK'
  );
  const deployedUnits = incidents.filter(i => i.assignedUnit && i.status !== 'RESOLVED').length;

  const value = {
    incidents,
    alerts,
    shelters,
    inventory,
    blockedRoads,
    responseResources,
    isSubmitting,
    // Supabase Backend Status & Utilities
    supabaseStatus,
    supabaseMessage,
    supabaseConfig,
    invokeAICrisisAnalysis,
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
