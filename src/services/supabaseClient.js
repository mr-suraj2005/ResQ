import { createClient } from '@supabase/supabase-js';

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
 * Returns { connected: boolean, tablesFound: boolean, error?: string }
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

    // Convert snake_case from Postgres to frontend camelCase
    return data.map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      severity: row.severity,
      status: row.status,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      peopleAffected: row.people_affected,
      description: row.description,
      imageUrl: row.image_url,
      reportedBy: row.reported_by,
      assignedUnit: row.assigned_unit,
      isVerified: row.is_verified,
      fieldNotes: row.field_notes || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
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
      field_notes: incident.fieldNotes || []
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
    return data;
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

export async function fetchRemoteAlerts() {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return null;

    return data.map(row => ({
      id: row.id,
      title: row.title,
      severity: row.severity,
      category: row.category,
      message: row.message,
      issuedBy: row.issued_by,
      affectedAreas: row.affected_areas,
      isActive: row.is_active,
      createdAt: row.created_at
    }));
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
      message: alert.message,
      issued_by: alert.issuedBy,
      affected_areas: alert.affectedAreas,
      is_active: alert.isActive !== undefined ? alert.isActive : true
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
      latitude: r.latitude,
      longitude: r.longitude,
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
    return data;
  } catch (err) {
    return null;
  }
}

// =============================================================================
// AI API & CRISIS ANALYSIS EDGE FUNCTION INTEGRATION
// =============================================================================

export async function invokeAICrisisAnalysis(contextPayload) {
  try {
    // Attempt invoking Supabase Edge Function 'crisis-analysis'
    const { data, error } = await supabase.functions.invoke('crisis-analysis', {
      body: contextPayload
    });

    if (error) throw error;
    return { success: true, analysis: data, source: 'Supabase Edge AI Function' };
  } catch (err) {
    // Graceful fallback to client-side heuristics
    return {
      success: false,
      message: err.message,
      source: 'Client Neural Fallback'
    };
  }
}
