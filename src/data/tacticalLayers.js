// ResQ Tactical Map Layers Dataset
// Supports the 5 tactical marker layers (Critical, High, Unverified, Response Resources, Blocked Roads)

export const initialBlockedRoads = [
  {
    id: "BLK-301",
    name: "Alaskan Way Coastal Corridor (Pier 52 to 57)",
    type: "BLOCKED_ROAD",
    latitude: 47.6048,
    longitude: -122.3398,
    reason: "Submerged under 2.8ft seawall overflow and storm debris. Impassable for all civilian & light response traffic.",
    severity: "CRITICAL",
    blockedSince: "2026-10-29T16:20:00Z",
    detourAdvice: "Reroute north-south transit via 4th Ave / 5th Ave elevated arterials."
  },
  {
    id: "BLK-302",
    name: "Magnolia Blvd W Arterial at W Galer St",
    type: "BLOCKED_ROAD",
    latitude: 47.6325,
    longitude: -122.3688,
    reason: "Bluff mudslide with multiple downed pine trees & sagging high-voltage power lines.",
    severity: "HIGH",
    blockedSince: "2026-10-29T18:15:00Z",
    detourAdvice: "Use 28th Ave W and Gilman Ave W bypass."
  },
  {
    id: "BLK-303",
    name: "Fremont Ave Bridge Canal Northbound Access",
    type: "BLOCKED_ROAD",
    latitude: 47.6530,
    longitude: -122.3508,
    reason: "Bridge approaches cordoned off following pedestrian footbridge structural collapse.",
    severity: "HIGH",
    blockedSince: "2026-10-29T19:20:00Z",
    detourAdvice: "Utilize Aurora Bridge (Hwy 99) as primary north-south canal crossing."
  }
];

export const initialResponseResources = [
  {
    id: "RES-NDRF-01",
    name: "NDRF Multi-Hazard Rescue Battalion Unit 4",
    type: "RESPONSE_RESOURCE",
    resourceType: "RESCUE_UNIT",
    latitude: 47.6110,
    longitude: -122.3410,
    status: "AVAILABLE",
    capacity: 65,
    equipment: ["2x Flood Rescue Zodiacs", "High-Volume Dewatering Pumps", "Heavy Structural Saws", "Thermal Drones"],
    contact: "NDRF Tactical Dispatch: 09711077372"
  },
  {
    id: "RES-AMB-02",
    name: "Emergency Mobile Triage & Paramedic Task Force",
    type: "RESPONSE_RESOURCE",
    resourceType: "MEDICAL_UNIT",
    latitude: 47.6075,
    longitude: -122.3275,
    status: "AVAILABLE",
    capacity: 40,
    equipment: ["4x Critical Care Ambulances", "Mobile Oxygen Staging", "Automated Defibrillators", "Emergency Triage Tent"],
    contact: "EMS Command: 112"
  },
  {
    id: "RES-HAZMAT-03",
    name: "Regional HazMat Containment & Decon Tender",
    type: "RESPONSE_RESOURCE",
    resourceType: "HAZMAT_UNIT",
    latitude: 47.5840,
    longitude: -122.3360,
    status: "AVAILABLE",
    capacity: 30,
    equipment: ["Vapor Scrubbing Fans", "Gas Plume Spectrometers", "Chemical Neutralizer Barrels", "Level-A Enclosed Suits"],
    contact: "HazMat Operations: 011-26701700"
  }
];
