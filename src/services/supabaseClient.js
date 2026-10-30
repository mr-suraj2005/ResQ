import { createClient } from '@supabase/supabase-js';
import { initialShelters } from '../data/shelters';
import { initialResponseResources } from '../data/tacticalLayers';

// Default configuration with safe fallback to user-provided credentials
const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) || 'https://vgwpwhgltnrjzfclmzlw.supabase.co';
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_R2WCM18W43X1eVZ7wzbl8A_F0sphTkf';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const supabaseConfig = {
  url: SUPABASE_URL,
  keyMasked: SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.slice(0, 14)}...` : 'Not Set'
};

/**
 * Tests live connectivity to the Supabase PostgreSQL backend
 * Returns { connected: boolean, tablesFound: boolean, message?: string }
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('incidents').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return {
          connected: true,
          tablesFound: false,
          message: 'Supabase project connected. Tables pending SQL migration.'
        };
      }
      return { connected: false, tablesFound: false, message: error.message };
    }
    return { connected: true, tablesFound: true, message: 'Supabase Database & Tables Online' };
  } catch (err) {
    return { connected: false, tablesFound: false, message: err.message };
  }
}

// =============================================================================
// INCIDENTS DATA ACCESS
// =============================================================================

export async function fetchRemoteIncidents() {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return null;

    // Convert snake_case from Postgres to frontend camelCase with full compatibility
    return data.map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      severity: row.severity,
      status: row.status,
      address: row.address,
      latitude: Number(row.latitude) || 28.6139,
      longitude: Number(row.longitude) || 77.2090,
      peopleAffected: Number(row.people_affected) || 0,
      description: row.description || '',
      imageUrl: row.image_url || null,
      reportedBy: row.reported_by || 'Citizen Reporter',
      assignedUnit: row.assigned_unit || null,
      isVerified: Boolean(row.is_verified),
      verified: Boolean(row.is_verified),
      fieldNotes: Array.isArray(row.field_notes) ? row.field_notes : [],
      notes: Array.isArray(row.field_notes) ? row.field_notes : [],
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString()
    }));
  } catch (err) {
    console.warn('Supabase fetchRemoteIncidents fallback:', err.message);
    return null;
  }
}

export async function insertRemoteIncident(incident) {
  try {
    const row = {
      id: incident.id,
      title: incident.title,
      category: incident.category,
      severity: incident.severity,
      status: incident.status || 'PENDING_REVIEW',
      address: incident.address,
      latitude: incident.latitude,
      longitude: incident.longitude,
      people_affected: Number(incident.peopleAffected) || 1,
      description: incident.description,
      image_url: incident.imageUrl,
      reported_by: incident.reportedBy,
      assigned_unit: incident.assignedUnit,
      is_verified: Boolean(incident.isVerified),
      field_notes: incident.notes || incident.fieldNotes || []
    };

    const { data, error } = await supabase
      .from('incidents')
      .insert([row])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase insertRemoteIncident error:', err.message);
    return null;
  }
}

export async function updateRemoteIncident(id, updates) {
  try {
    const rowUpdates = {
      updated_at: new Date().toISOString()
    };
    if (updates.status !== undefined) rowUpdates.status = updates.status;
    if (updates.isVerified !== undefined) rowUpdates.is_verified = updates.isVerified;
    if (updates.assignedUnit !== undefined) rowUpdates.assigned_unit = updates.assignedUnit;
    if (updates.notes !== undefined) rowUpdates.field_notes = updates.notes;
    if (updates.fieldNotes !== undefined) rowUpdates.field_notes = updates.fieldNotes;
    if (updates.severity !== undefined) rowUpdates.severity = updates.severity;
    if (updates.peopleAffected !== undefined) rowUpdates.people_affected = Number(updates.peopleAffected);

    const { data, error } = await supabase
      .from('incidents')
      .update(rowUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase updateRemoteIncident error:', err.message);
    return null;
  }
}

// =============================================================================
// SHELTERS & RESOURCES DATA ACCESS
// =============================================================================

export async function fetchRemoteShelters() {
  try {
    const { data, error } = await supabase.from('shelters').select('*');
    if (error) throw error;
    if (!data || data.length === 0) return null;

    const initialMap = new Map(initialShelters.map(s => [s.id, s]));

    const remoteMapped = data.map(row => {
      const initial = initialMap.get(row.id) || {};
      const cap = Number(row.capacity) || initial.capacity || 500;
      const occ = Number(row.occupancy) || initial.occupancy || 0;

      return {
        ...initial,
        id: row.id,
        facility: initial.facility || row.name,
        name: row.name || initial.name,
        type: initial.type || (row.type === 'HOSPITAL' ? 'Hospital' : 'Shelter Network'),
        location: initial.location || row.district || 'India',
        district: row.district || initial.district,
        address: row.address || initial.address,
        verifiedDetails: initial.verifiedDetails || `${cap} capacity`,
        latitude: Number(row.latitude) || initial.latitude || 28.5672,
        longitude: Number(row.longitude) || initial.longitude || 77.2100,
        status: (row.status === 'OPEN' || row.status === 'OPERATIONAL') ? 'OPERATIONAL' : (initial.status || row.status || 'OPERATIONAL'),
        emergencyContact: row.phone || initial.emergencyContact || '112 / 011-26701700',
        phone: row.phone || initial.phone || '112',
        activeUnits: initial.activeUnits || `${cap} Units`,
        capacity: cap,
        occupancy: occ,
        medicalSupplies: initial.medicalSupplies || 'FULL',
        wheelchairAccessible: initial.wheelchairAccessible ?? true,
        petFriendly: initial.petFriendly ?? false,
        amenities: initial.amenities || [
          'Emergency Care & First Aid',
          'Clean Potable Water & Rations',
          'Emergency Power Backup'
        ]
      };
    });

    // Ensure all 5 verified facilities are present (including NDRF IND-DRM-005)
    initialShelters.forEach(init => {
      if (!remoteMapped.some(r => r.id === init.id)) {
        remoteMapped.push(init);
      }
    });

    return remoteMapped;
  } catch (err) {
    console.warn('Supabase fetchRemoteShelters fallback:', err.message);
    return null;
  }
}

export async function updateRemoteShelter(id, updates) {
  try {
    const { data, error } = await supabase
      .from('shelters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase updateRemoteShelter error:', err.message);
    return null;
  }
}

// =============================================================================
// ALERTS DATA ACCESS
// =============================================================================

export async function fetchRemoteAlerts() {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return null;

    return data.map(row => {
      // Robust normalization of affected zones
      const rawZones = row.affected_areas || row.affectedZones || '';
      const zonesList = Array.isArray(rawZones)
        ? rawZones
        : typeof rawZones === 'string' && rawZones.trim()
          ? rawZones.split(',').map(s => s.trim()).filter(Boolean)
          : ['National Capital Region & Coastal Zones'];

      // Robust normalization of instructions
      const rawMsg = row.message || row.instructions || '';
      const instList = Array.isArray(rawMsg)
        ? rawMsg
        : typeof rawMsg === 'string' && rawMsg.trim()
          ? rawMsg.split(/\.\s+|\n+/).map(s => s.trim()).filter(Boolean)
          : ['Comply with directives from field emergency responders.'];

      const isActive = row.is_active !== undefined ? Boolean(row.is_active) : (row.active !== undefined ? Boolean(row.active) : true);

      return {
        id: row.id,
        title: row.title || 'Official Emergency Broadcast',
        severity: row.severity || 'WARNING',
        category: row.category || 'FLOOD',
        author: row.issued_by || row.author || 'NDMA & NDRF Unified Command',
        issuedAt: row.created_at || row.issued_at || new Date().toISOString(),
        expiresAt: row.expires_at || new Date(Date.now() + 86400000).toISOString(),
        active: isActive,
        affectedZones: zonesList,
        instructions: instList
      };
    });
  } catch (err) {
    console.warn('Supabase fetchRemoteAlerts fallback:', err.message);
    return null;
  }
}

export async function insertRemoteAlert(alert) {
  try {
    const row = {
      id: alert.id,
      title: alert.title,
      severity: alert.severity,
      category: alert.category,
      message: Array.isArray(alert.instructions) ? alert.instructions.join('. ') : (alert.instructions || alert.message || ''),
      issued_by: alert.author || alert.issuedBy || 'EOC Command',
      affected_areas: Array.isArray(alert.affectedZones) ? alert.affectedZones.join(', ') : (alert.affectedZones || alert.affectedAreas || ''),
      is_active: alert.active !== undefined ? Boolean(alert.active) : true
    };

    const { data, error } = await supabase.from('alerts').insert([row]).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase insertRemoteAlert error:', err.message);
    return null;
  }
}

export async function fetchRemoteBlockedRoads() {
  try {
    const { data, error } = await supabase.from('blocked_roads').select('*');
    if (error) throw error;
    if (!data) return null;

    return data.map(r => ({
      id: r.id,
      name: r.name,
      reason: r.reason,
      latitude: Number(r.latitude) || 28.6139,
      longitude: Number(r.longitude) || 77.2090,
      status: r.status,
      bypassAdvice: r.bypass_advice,
      reportedAt: r.reported_at
    }));
  } catch (err) {
    return null;
  }
}

export async function fetchRemoteResponseResources() {
  try {
    const { data, error } = await supabase.from('response_resources').select('*');
    if (error) throw error;
    if (!data || data.length === 0) return initialResponseResources;

    const initialMap = new Map(initialResponseResources.map(r => [r.id, r]));

    const remoteMapped = data.map(row => {
      const initial = initialMap.get(row.id) || {};
      return {
        ...initial,
        id: row.id,
        name: row.name || initial.name,
        facility: initial.facility || row.name,
        type: 'Response Force',
        location: initial.location || row.location || 'India',
        state: initial.state || row.state || 'India',
        district: row.district || initial.district,
        address: initial.address || row.address,
        verifiedDetails: initial.verifiedDetails || row.equipment || 'National rescue force command',
        status: row.status || initial.status || 'ACTIVE FORCE',
        latitude: Number(row.latitude) || initial.latitude || 28.6139,
        longitude: Number(row.longitude) || initial.longitude || 77.2090,
        personnel: Number(row.personnel) || initial.personnel || 1149,
        equipment: row.equipment || initial.equipment,
        contact: row.contact || initial.contact || '112 / 011-24363260'
      };
    });

    // Ensure all 10 official NDRF battalions are present
    initialResponseResources.forEach(init => {
      if (!remoteMapped.some(r => r.id === init.id)) {
        remoteMapped.push(init);
      }
    });

    return remoteMapped;
  } catch (err) {
    return initialResponseResources;
  }
}

// =============================================================================
// AI API & CRISIS ANALYSIS EDGE FUNCTION INTEGRATION
// =============================================================================

export async function invokeAICrisisAnalysis(contextPayload) {
  try {
    const { data, error } = await supabase.functions.invoke('crisis-analysis', {
      body: contextPayload
    });

    if (error) throw error;
    return { success: true, analysis: data, source: 'Supabase Edge AI Function' };
  } catch (err) {
    return {
      success: false,
      message: err.message,
      source: 'Client Neural Fallback'
    };
  }
}

// =============================================================================
// SUPABASE AUTH UTILITIES & COUNTRY CODE DEFINITIONS
// =============================================================================

export const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', maxDigits: 10 },
  { code: '+1', country: 'US / Canada', flag: '🇺🇸', maxDigits: 10 },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', maxDigits: 10 },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', maxDigits: 9 },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', maxDigits: 8 },
  { code: '+61', country: 'Australia', flag: '🇦🇺', maxDigits: 9 },
  { code: '+49', country: 'Germany', flag: '🇩🇪', maxDigits: 11 },
  { code: '+33', country: 'France', flag: '🇫🇷', maxDigits: 9 },
  { code: '+81', country: 'Japan', flag: '🇯🇵', maxDigits: 10 },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', maxDigits: 9 }
];

export function formatE164Phone(countryCode, nationalNumber) {
  const digits = (nationalNumber || '').replace(/\D/g, '');
  const prefix = (countryCode || '+91').replace(/\D/g, '');
  return `+${prefix}${digits}`;
}

export const supabaseAuth = {
  async signInWithEmail(email, password) {
    return await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
  },

  async sendPhoneOtp(formattedPhone) {
    return await supabase.auth.signInWithOtp({
      phone: formattedPhone
    });
  },

  async verifyPhoneOtp(formattedPhone, token) {
    return await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: token.trim(),
      type: 'sms'
    });
  },

  async signUpWithEmail(email, password, metadata = {}) {
    return await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: metadata
      }
    });
  },

  async signUpWithPhone(formattedPhone, metadata = {}) {
    return await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        data: metadata
      }
    });
  },

  async resetPasswordForEmail(email) {
    return await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  }
};

