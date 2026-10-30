import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, supabaseAuth } from '../services/supabaseClient';

const AuthContext = createContext(null);

export const ROLES = {
  CITIZEN: 'CITIZEN',
  ADMIN: 'ADMIN',
  RESPONDER: 'RESPONDER'
};

const DEMO_PROFILES = {
  [ROLES.CITIZEN]: {
    id: "USR-7701",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@citizen.wa.gov",
    role: ROLES.CITIZEN,
    zone: "Connaught Place / Central Delhi",
    avatarInitials: "SJ",
    phone: "+91 98765 43210"
  },
  [ROLES.ADMIN]: {
    id: "ADM-9011",
    name: "Commander Edward Vance",
    email: "e.vance@eoc.resq.gov",
    role: ROLES.ADMIN,
    department: "National Disaster Management Authority (NDMA EOC)",
    avatarInitials: "EV",
    badgeNumber: "EOC-DIR-04"
  },
  [ROLES.RESPONDER]: {
    id: "RSP-4022",
    name: "Lt. Marcus Chen",
    email: "m.chen@ndrf.resq.gov",
    role: ROLES.RESPONDER,
    unit: "8th Battalion NDRF (NCR Tactical Unit)",
    avatarInitials: "MC",
    badgeNumber: "NDRF-8091"
  }
};

export const AuthProvider = ({ children }) => {
  // Read initial role from localStorage if available, default to CITIZEN
  const [currentRole, setCurrentRoleState] = useState(() => {
    const saved = localStorage.getItem('resq_role');
    if (saved === 'ADMIN' || saved === ROLES.ADMIN) return ROLES.CITIZEN;
    return saved && ROLES[saved] ? saved : ROLES.CITIZEN;
  });

  const [currentUser, setCurrentUser] = useState(() => DEMO_PROFILES[currentRole]);
  const [supabaseSession, setSupabaseSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Sync Supabase active session on mount
  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session && session.user) {
          setSupabaseSession(session);
          const meta = session.user.user_metadata || {};
          const detectedRole = meta.role && ROLES[meta.role] ? meta.role : currentRole;
          setCurrentRoleState(detectedRole);
          setCurrentUser({
            id: session.user.id,
            name: meta.full_name || session.user.phone || 'Citizen User',
            phone: session.user.phone || meta.phone || '',
            role: detectedRole,
            zone: meta.zone || 'National Capital Region',
            avatarInitials: (meta.full_name || session.user.phone || 'CU').slice(0, 2).toUpperCase()
          });
        }
      } catch (err) {
        console.warn('Supabase auth session sync notice:', err.message);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };

    initSession();

    // Listen to Supabase Auth State changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      setSupabaseSession(session);

      if (session && session.user) {
        const meta = session.user.user_metadata || {};
        const detectedRole = meta.role && ROLES[meta.role] ? meta.role : ROLES.CITIZEN;
        setCurrentRoleState(detectedRole);
        setCurrentUser({
          id: session.user.id,
          name: meta.full_name || session.user.phone || 'Citizen User',
          phone: session.user.phone || meta.phone || '',
          role: detectedRole,
          zone: meta.zone || 'National Capital Region',
          avatarInitials: (meta.full_name || session.user.phone || 'CU').slice(0, 2).toUpperCase()
        });
      } else if (event === 'SIGNED_OUT') {
        setCurrentRoleState(ROLES.CITIZEN);
        setCurrentUser(DEMO_PROFILES[ROLES.CITIZEN]);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('resq_role', currentRole);
    if (!supabaseSession) {
      setCurrentUser(DEMO_PROFILES[currentRole]);
    }
  }, [currentRole, supabaseSession]);

  /**
   * Fast Demo Role Switcher hook
   */
  const switchRole = (newRole) => {
    if (newRole !== ROLES.CITIZEN && newRole !== ROLES.RESPONDER) return;
    setCurrentRoleState(newRole);
    setCurrentUser(DEMO_PROFILES[newRole] || DEMO_PROFILES[ROLES.CITIZEN]);
  };

  /**
   * Standard Demo Login method (preserves instant evaluator & role testing)
   */
  const login = (email, password, role = ROLES.CITIZEN) => {
    const targetRole = ROLES[role] || ROLES.CITIZEN;
    setCurrentRoleState(targetRole);
    setCurrentUser({
      ...DEMO_PROFILES[targetRole],
      email: email || DEMO_PROFILES[targetRole].email
    });
    return true;
  };

  /**
   * Supabase Native: Send Phone OTP via Vonage
   */
  const signInWithPhone = async (formattedPhone) => {
    try {
      const { data, error } = await supabaseAuth.sendPhoneOtp(formattedPhone);
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to dispatch verification OTP' };
    }
  };

  /**
   * Supabase Native: Verify Phone OTP
   */
  const verifyPhoneOtp = async (formattedPhone, otpCode) => {
    try {
      const { data, error } = await supabaseAuth.verifyPhoneOtp(formattedPhone, otpCode);
      if (error) throw error;

      if (data?.session?.user) {
        setSupabaseSession(data.session);
        const meta = data.session.user.user_metadata || {};
        const detectedRole = meta.role && ROLES[meta.role] ? meta.role : ROLES.CITIZEN;
        setCurrentRoleState(detectedRole);
        const userObj = {
          id: data.session.user.id,
          name: meta.full_name || formattedPhone || 'User',
          phone: data.session.user.phone || formattedPhone,
          role: detectedRole,
          zone: meta.zone || 'National Capital Region',
          avatarInitials: (meta.full_name || formattedPhone || 'CU').slice(0, 2).toUpperCase()
        };
        setCurrentUser(userObj);
        localStorage.setItem('resq_role', detectedRole);
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid or expired 6-digit OTP' };
    }
  };

  /**
   * Supabase Native: Sign Up / Sign In With Phone & Role Metadata
   */
  const signUpWithPhone = async (formattedPhone, metadata = {}) => {
    try {
      const { data, error } = await supabaseAuth.signUpWithPhone(formattedPhone, {
        ...metadata,
        role: metadata.role || ROLES.CITIZEN
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Phone registration failed' };
    }
  };

  /**
   * Profile synchronization helper
   */
  const register = (userData) => {
    const assignedRole = userData.role && ROLES[userData.role] ? userData.role : ROLES.CITIZEN;
    const newProfile = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: userData.name || "Mobile Citizen",
      phone: userData.phone || "+91 98765 00000",
      role: assignedRole,
      zone: userData.zone || "National Capital Region",
      avatarInitials: (userData.name || "MC").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    };
    setCurrentRoleState(assignedRole);
    setCurrentUser(newProfile);
    localStorage.setItem('resq_role', assignedRole);
    return newProfile;
  };

  const logout = async () => {
    try {
      await supabaseAuth.signOut();
    } catch (err) {
      // Ignored
    }
    setSupabaseSession(null);
    setCurrentRoleState(ROLES.CITIZEN);
    setCurrentUser(DEMO_PROFILES[ROLES.CITIZEN]);
    localStorage.removeItem('resq_role');
  };

  const value = {
    currentRole,
    currentUser,
    supabaseSession,
    authLoading,
    switchRole,
    login,
    register,
    logout,
    // Mobile Authentication Methods
    signInWithPhone,
    verifyPhoneOtp,
    signUpWithPhone,
    isAdmin: false,
    isResponder: currentRole === ROLES.RESPONDER,
    isCitizen: currentRole === ROLES.CITIZEN
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
