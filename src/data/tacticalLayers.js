// ResQ Tactical Map Layers Dataset — Indian National Disaster Corridors
// Supports the 5 tactical marker layers (Critical, High, Unverified, Response Resources, Blocked Roads)

export const initialBlockedRoads = [
  {
    id: "IND-BLK-001",
    name: "NH-16 Coastal Highway (Puri-Konark Marine Drive, Odisha)",
    type: "BLOCKED_ROAD",
    latitude: 19.8135,
    longitude: 85.8312,
    reason: "Coastal storm surge overwash & 1.4m tidal sand debris. Closed for light civilian transit.",
    severity: "CRITICAL",
    blockedSince: "2026-10-30T04:30:00Z",
    bypassAdvice: "Divert via NH-316 inland highway towards Bhubaneswar."
  },
  {
    id: "IND-BLK-002",
    name: "Vikas Marg & ITO Chawk Corridor, New Delhi",
    type: "BLOCKED_ROAD",
    latitude: 28.6304,
    longitude: 77.2410,
    reason: "Yamuna river surge overflow & urban underpass waterlogging. Heavy vehicle access only.",
    severity: "HIGH",
    blockedSince: "2026-10-30T06:15:00Z",
    bypassAdvice: "Use Barapullah elevated arterial or Ring Road bypass."
  },
  {
    id: "IND-BLK-003",
    name: "NH-5 Visakhapatnam Beach Road Corridor, Andhra Pradesh",
    type: "BLOCKED_ROAD",
    latitude: 17.7120,
    longitude: 83.3150,
    reason: "High swell tidal surge debris and fallen casuarina trees on arterial highway.",
    severity: "HIGH",
    blockedSince: "2026-10-30T07:20:00Z",
    bypassAdvice: "Reroute transit via Anandapuram highway junction."
  },
  {
    id: "IND-BLK-004",
    name: "SH-3 Kakdwip-Namkhana Embankment Road, Sundarbans, West Bengal",
    type: "BLOCKED_ROAD",
    latitude: 21.7650,
    longitude: 88.2350,
    reason: "River embankment breach after monsoonal rainfall; 1.1m water over pavement.",
    severity: "CRITICAL",
    blockedSince: "2026-10-30T08:10:00Z",
    bypassAdvice: "Utilize Kulpi-Diamond Harbour inland bypass or river ferry."
  }
];

export const initialResponseResources = [
  {
    id: "IND-DRM-005",
    name: "NDRF — National Rescue Force HQ",
    facility: "NDRF",
    type: "Response Force",
    location: "India-wide",
    verifiedDetails: "National rescue force",
    latitude: 28.6139,
    longitude: 77.2090,
    status: "DEPLOYED INDIA-WIDE",
    personnel: 18000,
    equipment: "16 Battalions, 28x Inflatable Motorized Zodiacs, USAR Acoustic Sensors, Thermal Imaging Drones",
    contact: "09711077372 / 011-24363260"
  },
  {
    id: "IND-HSP-001",
    name: "AIIMS New Delhi — JPN Apex Trauma Centre",
    facility: "AIIMS New Delhi",
    type: "Hospital",
    location: "New Delhi",
    verifiedDetails: "JPN Apex Trauma Centre",
    latitude: 28.5672,
    longitude: 77.2100,
    status: "OPERATIONAL",
    personnel: 450,
    equipment: "Apex Trauma Bays, Emergency Blood Bank, Decontamination Units, Disaster Surgical Suites",
    contact: "112 / 011-26701700"
  },
  {
    id: "IND-SHL-002",
    name: "Cyclone Shelters (Odisha Coastal Network Hub)",
    facility: "Cyclone Shelters",
    type: "Shelter Network",
    location: "Odisha",
    verifiedDetails: "316 shelters",
    latitude: 20.2961,
    longitude: 85.8245,
    status: "ACTIVE NETWORK",
    personnel: 316,
    equipment: "316 Reinforced Shelters, Community Kitchens, Solar Battery Banks, High-Capacity Water Handpumps",
    contact: "1078 / 1070"
  },
  {
    id: "IND-SHL-003",
    name: "Cyclone Shelters (Andhra Pradesh Coastal Hub)",
    facility: "Cyclone Shelters",
    type: "Shelter Network",
    location: "Andhra Pradesh",
    verifiedDetails: "219 shelters",
    latitude: 17.6868,
    longitude: 83.2185,
    status: "ACTIVE NETWORK",
    personnel: 219,
    equipment: "219 Elevated Storm Shelters, Satellite Comms, First Aid Kits, Dry Food Stockpiles",
    contact: "1078 / 112"
  },
  {
    id: "IND-SHL-004",
    name: "Cyclone Shelters (West Bengal Coastal Hub)",
    facility: "Cyclone Shelters",
    type: "Shelter Network",
    location: "West Bengal",
    verifiedDetails: "State disaster shelters",
    latitude: 22.5726,
    longitude: 88.3639,
    status: "ACTIVE NETWORK",
    personnel: 185,
    equipment: "State Disaster Shelters, Speedboat Evacuation Docks, Water Purification Plants, Emergency Generators",
    contact: "1078 / 112"
  }
];
