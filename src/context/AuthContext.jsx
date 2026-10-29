import React, { createContext, useContext, useState, useEffect } from 'react';

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
    zone: "Downtown Waterfront",
    avatarInitials: "SJ",
    phone: "(206) 555-0192"
  },
  [ROLES.ADMIN]: {
    id: "ADM-9011",
    name: "Commander Edward Vance",
    email: "e.vance@eoc.seattle.gov",
    role: ROLES.ADMIN,
    department: "Seattle Emergency Operations Center",
    avatarInitials: "EV",
    badgeNumber: "EOC-DIR-04"
  },
  [ROLES.RESPONDER]: {
    id: "RSP-4022",
    name: "Lt. Marcus Chen",
    email: "m.chen@fire.seattle.gov",
    role: ROLES.RESPONDER,
    unit: "Marine Rescue Unit 1 (Seattle FD)",
    avatarInitials: "MC",
    badgeNumber: "SFD-4091"
  }
};

export const AuthProvider = ({ children }) => {
  // Read initial role from localStorage if available, default to CITIZEN
  const [currentRole, setCurrentRoleState] = useState(() => {
    const saved = localStorage.getItem('resq_role');
    return saved && ROLES[saved] ? saved : ROLES.CITIZEN;
  });

  const [currentUser, setCurrentUser] = useState(() => DEMO_PROFILES[currentRole]);

  useEffect(() => {
    localStorage.setItem('resq_role', currentRole);
    setCurrentUser(DEMO_PROFILES[currentRole]);
  }, [currentRole]);

  /**
   * Fast Demo Role Switcher hook
   */
  const switchRole = (newRole) => {
    if (ROLES[newRole]) {
      setCurrentRoleState(newRole);
    }
  };

  /**
   * Standard Login method (supports authenticating directly as a selected role)
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
   * Citizen registration simulation
   */
  const register = (userData) => {
    const newCitizen = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: userData.name || "Citizen User",
      email: userData.email,
      role: ROLES.CITIZEN,
      zone: userData.zone || "Metro Seattle",
      phone: userData.phone || "(206) 555-0100",
      avatarInitials: (userData.name || "CU").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    };
    setCurrentRoleState(ROLES.CITIZEN);
    setCurrentUser(newCitizen);
    return newCitizen;
  };

  const logout = () => {
    // In simulation mode, logout resets to Citizen guest profile
    setCurrentRoleState(ROLES.CITIZEN);
    setCurrentUser(DEMO_PROFILES[ROLES.CITIZEN]);
  };

  const value = {
    currentRole,
    currentUser,
    switchRole,
    login,
    register,
    logout,
    isAdmin: currentRole === ROLES.ADMIN,
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

