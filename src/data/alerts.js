// ResQ Official Broadcast Alerts Dataset — National Disaster Management Authority (India)
export const initialAlerts = [
  {
    id: "IND-ALT-2026-001",
    title: "Bay of Bengal Severe Cyclonic Storm & Surge Warning",
    severity: "CRITICAL",
    category: "FLOOD",
    affectedZones: ["Odisha Coastal Districts (Puri, Jagatsinghpur)", "Andhra Pradesh (Srikakulam, Visakhapatnam)", "West Bengal Sundarbans Delta"],
    instructions: [
      "Total suspension of fishing operations along Odisha, AP, and West Bengal coastline.",
      "Move to designated Cyclone Shelters (IND-SHL-002, 003, 004) immediately.",
      "Keep 72-hour emergency go-bag ready with drinking water, dry rations, torch, and medicines.",
      "Toll-free National Disaster Helpline: 112 | NDMA: 1078."
    ],
    issuedAt: "2026-10-30T04:00:00Z",
    expiresAt: "2026-10-31T12:00:00Z",
    active: true,
    author: "India Meteorological Department (IMD) & NDMA"
  },
  {
    id: "IND-ALT-2026-002",
    title: "Yamuna River Water Level Crosses Evacuation Danger Mark",
    severity: "CRITICAL",
    category: "FLOOD",
    affectedZones: ["Yamuna Bazar", "Old Railway Bridge (Loha Pul)", "Kashmere Gate Lowlands", "Mayur Vihar Extension"],
    instructions: [
      "Residents within 500m of riverbanks must vacate to DDMA relief camps.",
      "Do NOT venture near submerged underpasses or ghat embankments.",
      "Disconnection of electrical lines in flood-prone basements in progress.",
      "Delhi Disaster Control Helpline: 1077 | Central Control: 112."
    ],
    issuedAt: "2026-10-30T05:15:00Z",
    expiresAt: "2026-10-31T06:00:00Z",
    active: true,
    author: "Central Water Commission (CWC) & DDMA"
  },
  {
    id: "IND-ALT-2026-003",
    title: "NDRF Multi-Battalion Coastal Pre-Positioning Notice",
    severity: "HIGH",
    category: "INFRASTRUCTURE",
    affectedZones: ["East Coast Railway Arterials", "National Highway NH-16 & NH-5 Corridors"],
    instructions: [
      "Heavy commercial transit restricted along coastal expressways.",
      "NDRF 2nd, 3rd, and 10th battalions on active patrol with amphibious watercraft.",
      "Direct medical trauma cases to AIIMS New Delhi JPN Apex Trauma Centre (IND-HSP-001) or State Medical Colleges."
    ],
    issuedAt: "2026-10-30T06:00:00Z",
    expiresAt: "2026-10-31T18:00:00Z",
    active: true,
    author: "National Disaster Response Force (NDRF HQ New Delhi)"
  }
];
