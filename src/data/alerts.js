// ResQ Official Broadcast Alerts Dataset
export const initialAlerts = [
  {
    id: "ALT-2026-001",
    title: "Flash Flood & Coastal Seawall Inundation Emergency",
    severity: "CRITICAL",
    category: "FLOOD",
    affectedZones: ["Downtown Waterfront", "Pioneer Square", "Harbor Island", "Interbay Lowlands"],
    instructions: [
      "Avoid travel along Alaskan Way and low-lying coastal arterials.",
      "Do NOT attempt to drive through standing water of unknown depth.",
      "Residents in ground-floor and subterranean basements should relocate to upper floors immediately.",
      "Monitor local emergency broadcasts and emergency SMS alerts."
    ],
    issuedAt: "2026-10-29T16:00:00Z",
    expiresAt: "2026-10-30T04:00:00Z",
    active: true,
    author: "National Weather Service & Seattle EOC"
  },
  {
    id: "ALT-2026-002",
    title: "Shelter-in-Place Warning: Chemical Vapor Containment",
    severity: "WARNING",
    category: "HAZMAT",
    affectedZones: ["SoDo Industrial Area", "4th Ave S Corridor (Between Holgate & Spokane St)"],
    instructions: [
      "Remain indoors with doors and windows tightly closed.",
      "Shut off all HVAC, exterior air vents, and air conditioning units.",
      "Keep pets indoors and seal exterior door thresholds with damp towels if odor is detected.",
      "Emergency crews are on site containing the vapor release."
    ],
    issuedAt: "2026-10-29T17:50:00Z",
    expiresAt: "2026-10-29T22:00:00Z",
    active: true,
    author: "King County HazMat Interagency Task Force"
  },
  {
    id: "ALT-2026-003",
    title: "Precautionary Boil Water Advisory for Central District",
    severity: "ADVISORY",
    category: "INFRASTRUCTURE",
    affectedZones: ["Central District", "First Hill (East of Broadway)", "Squire Park"],
    instructions: [
      "Bring all municipal tap water to a rolling boil for at least 1 full minute prior to drinking, cooking, or brushing teeth.",
      "Emergency bottled water distribution point opened at Garfield Community Center.",
      "Water pressure testing is underway across pressure zones 4 and 5."
    ],
    issuedAt: "2026-10-29T15:30:00Z",
    expiresAt: "2026-10-30T18:00:00Z",
    active: true,
    author: "Seattle Public Utilities Drinking Water Division"
  },
  {
    id: "ALT-2026-004",
    title: "High Wind Gale Advisory & Downed Power Lines Warning",
    severity: "ADVISORY",
    category: "WEATHER",
    affectedZones: ["Magnolia", "Queen Anne", "West Seattle Bluffs"],
    instructions: [
      "Expect sustained winds of 35-45 mph with gusts reaching 60 mph.",
      "Treat all downed power lines as actively energized; maintain at least a 30-foot perimeter.",
      "Secure outdoor furniture, trash bins, and loose objects."
    ],
    issuedAt: "2026-10-29T13:00:00Z",
    expiresAt: "2026-10-30T02:00:00Z",
    active: true,
    author: "Emergency Management Division"
  }
];

