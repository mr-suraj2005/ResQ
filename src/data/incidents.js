// ResQ Initial Incident Dataset — Centered around Seattle Metro (47.6062, -122.3321)
export const initialIncidents = [
  {
    id: "INC-2026-101",
    title: "Storm Surge & Rapid Inundation at Waterfront Promenade",
    category: "FLOOD",
    severity: "CRITICAL",
    status: "ON_SCENE",
    latitude: 47.6038,
    longitude: -122.3392,
    address: "Pier 55 & Alaskan Way, Seattle, WA 98101",
    reportedBy: "Harbor Operations Officer",
    assignedUnit: "Marine Rescue Unit 1 (Seattle FD)",
    verified: true,
    peopleAffected: 45,
    createdAt: "2026-10-29T16:15:00Z",
    description: "King tide combined with 55 mph gale-force gusts caused seawall overflow. Water level is 2.8 ft above street grade with basement flooding in commercial retail shops.",
    notes: [
      {
        id: "NOTE-1",
        author: "Chief E. Martinez",
        role: "ADMIN",
        timestamp: "2026-10-29T16:22:00Z",
        text: "Verified via Harbor sensor telemetry. Dispatched Marine Rescue Unit 1 for sandbag deployment and perimeter evacuation."
      },
      {
        id: "NOTE-2",
        author: "Lt. Davis (Marine 1)",
        role: "RESPONDER",
        timestamp: "2026-10-29T16:38:00Z",
        text: "Arrived on scene. Power shutoffs initiated along Alaskan Way corridor. 4 citizens assisted to elevated dry pavement."
      }
    ]
  },
  {
    id: "INC-2026-102",
    title: "Multi-Storey Commercial Structural Fire",
    category: "FIRE",
    severity: "CRITICAL",
    status: "DISPATCHED",
    latitude: 47.6185,
    longitude: -122.3352,
    address: "2100 Westlake Ave, South Lake Union, Seattle, WA 98121",
    reportedBy: "Building Security (Carl Jensen)",
    assignedUnit: "Engine 22 & Ladder 4 (SLU Battalion)",
    verified: true,
    peopleAffected: 120,
    createdAt: "2026-10-29T17:04:00Z",
    description: "Heavy black smoke rising from 3rd floor HVAC electrical room with rapid spread toward eastern stairwell. Fire alarm actively sounding, evacuation in progress.",
    notes: [
      {
        id: "NOTE-3",
        author: "Dispatch EOC",
        role: "ADMIN",
        timestamp: "2026-10-29T17:06:00Z",
        text: "Confirmed second-alarm structural fire. Traffic diversion requested for Westlake Ave."
      }
    ]
  },
  {
    id: "INC-2026-103",
    title: "Ammonia Refrigeration Line Rupture",
    category: "HAZMAT",
    severity: "HIGH",
    status: "EN_ROUTE",
    latitude: 47.5891,
    longitude: -122.3421,
    address: "1720 4th Ave S, Industrial District, Seattle, WA 98134",
    reportedBy: "Warehouse Supervisor",
    assignedUnit: "HazMat Task Force 1",
    verified: true,
    peopleAffected: 35,
    createdAt: "2026-10-29T17:45:00Z",
    description: "Forklift collision ruptured a secondary cooling pipe releasing anhydrous ammonia fumes. 35 warehouse workers evacuated to assembly zone A; slight downwind vapor plume.",
    notes: [
      {
        id: "NOTE-4",
        author: "HazMat Lead Chang",
        role: "RESPONDER",
        timestamp: "2026-10-29T17:52:00Z",
        text: "En route with gas detection meters and vapor containment shrouds. Requested 500m downwind shelter-in-place advisory."
      }
    ]
  },
  {
    id: "INC-2026-104",
    title: "Major Landslide Blocking Arterial Transit",
    category: "INFRASTRUCTURE",
    severity: "HIGH",
    status: "PENDING_REVIEW",
    latitude: 47.6322,
    longitude: -122.3684,
    address: "Magnolia Blvd W & W Galer St, Seattle, WA 98199",
    reportedBy: "Citizen (David Rossi)",
    assignedUnit: null,
    verified: false,
    peopleAffected: 12,
    createdAt: "2026-10-29T18:10:00Z",
    description: "Bluff slope failure after heavy rainfall. Substantial mud and fallen pine trees completely blocking both lanes of Magnolia Blvd. Power lines sagging.",
    notes: []
  },
  {
    id: "INC-2026-105",
    title: "Substation Transformer Overload & Blackout",
    category: "POWER",
    severity: "MODERATE",
    status: "VERIFIED",
    latitude: 47.6148,
    longitude: -122.3195,
    address: "E Pine St & 12th Ave, Capitol Hill, Seattle, WA 98122",
    reportedBy: "Automated Grid Telemetry",
    assignedUnit: "City Light Grid Crew 7",
    verified: true,
    peopleAffected: 420,
    createdAt: "2026-10-29T18:25:00Z",
    description: "Grid fault caused localized outage affecting approximately 4,200 households and four key traffic signals on Pine and Pike corridors.",
    notes: [
      {
        id: "NOTE-5",
        author: "EOC Operations",
        role: "ADMIN",
        timestamp: "2026-10-29T18:30:00Z",
        text: "Verified with Seattle City Light. Grid technicians on site; estimated restoration time 90 minutes."
      }
    ]
  },
  {
    id: "INC-2026-106",
    title: "Senior Care Facility Heat Pump Failure in Deep Freeze",
    category: "MEDICAL",
    severity: "HIGH",
    status: "ON_SCENE",
    latitude: 47.6685,
    longitude: -122.3845,
    address: "5430 Leary Ave NW, Ballard, Seattle, WA 98107",
    reportedBy: "Facility Nurse Administrator",
    assignedUnit: "Medic Unit 18 & Red Cross Logistics",
    verified: true,
    peopleAffected: 80,
    createdAt: "2026-10-29T18:40:00Z",
    description: "Primary boiler failure inside 80-bed residential facility. Ambient indoor temperature dropped to 48°F. 14 residents require portable oxygen and warm blankets.",
    notes: [
      {
        id: "NOTE-6",
        author: "Capt. Reynolds (Medic 18)",
        role: "RESPONDER",
        timestamp: "2026-10-29T19:02:00Z",
        text: "On scene with emergency warming blowers and auxiliary thermal blankets. All vital signs stable; shelter transfer prepared if heat is not restored within 1 hr."
      }
    ]
  },
  {
    id: "INC-2026-107",
    title: "Collapsed Pedestrian Footbridge Over Canal",
    category: "INFRASTRUCTURE",
    severity: "CRITICAL",
    status: "DISPATCHED",
    latitude: 47.6534,
    longitude: -122.3512,
    address: "Fremont Ave N & N 34th St, Fremont, Seattle, WA 98103",
    reportedBy: "Citizen (Maya Lin)",
    assignedUnit: "Heavy Rescue 1 & Dive Team",
    verified: true,
    peopleAffected: 14,
    createdAt: "2026-10-29T19:15:00Z",
    description: "Wooden structural supports collapsed into the canal under storm pressure. Witnesses observed 2 individuals on the bridge deck prior to failure.",
    notes: [
      {
        id: "NOTE-7",
        author: "Operations Commander",
        role: "ADMIN",
        timestamp: "2026-10-29T19:18:00Z",
        text: "Direct dispatch of canal rescue and marine dive unit. Canal vessel traffic suspended."
      }
    ]
  },
  {
    id: "INC-2026-108",
    title: "Basement Gas Leak & Citizen Trapped",
    category: "HAZMAT",
    severity: "HIGH",
    status: "PENDING_REVIEW",
    latitude: 47.5612,
    longitude: -122.3862,
    address: "4100 California Ave SW, West Seattle, WA 98116",
    reportedBy: "Citizen (Robert Vance)",
    assignedUnit: null,
    verified: false,
    peopleAffected: 6,
    createdAt: "2026-10-29T19:40:00Z",
    description: "Pungent mercaptan odor reported inside two-story multi-family duplex. Occupants report dizziness and blocked basement egress door.",
    notes: []
  }
];
