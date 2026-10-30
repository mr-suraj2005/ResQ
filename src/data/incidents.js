// ResQ Initial Incident Dataset — India National Disaster Response Network
export const initialIncidents = [
  {
    id: "IND-INC-101",
    title: "Odisha Coastal Cyclone Surge & Marine Inundation",
    category: "FLOOD",
    severity: "CRITICAL",
    status: "ON_SCENE",
    latitude: 20.2961,
    longitude: 85.8245,
    address: "Marine Drive & Puri Coastal Sector, Odisha",
    reportedBy: "Coastal Early Warning Radar Officer",
    assignedUnit: "NDRF 3rd Battalion & ODRAF Coastal Unit",
    verified: true,
    peopleAffected: 1250,
    createdAt: "2026-10-30T04:15:00Z",
    description: "Deep cyclonic depression in the Bay of Bengal triggered 2.4m storm surges. Overwash breached coastal dykes; evacuating vulnerable hamlets into 316 cyclone shelters.",
    notes: [
      {
        id: "NOTE-1",
        author: "Duty Commander (NDMA)",
        role: "ADMIN",
        timestamp: "2026-10-30T04:22:00Z",
        text: "Confirmed via IMD Doppler Radar telemetry. 6 NDRF inflatable boats deployed for water extraction."
      },
      {
        id: "NOTE-2",
        author: "Inspector Pradhan (NDRF 3)",
        role: "RESPONDER",
        timestamp: "2026-10-30T04:45:00Z",
        text: "On scene with motorized zodiacs. First wave of 140 villagers shifted safely to Cyclone Shelter IND-SHL-002."
      }
    ]
  },
  {
    id: "IND-INC-102",
    title: "Yamuna River Basin Flood Surge & Substation Inundation",
    category: "FLOOD",
    severity: "CRITICAL",
    status: "ON_SCENE",
    latitude: 28.6139,
    longitude: 77.2090,
    address: "Ring Road & Kashmere Gate, New Delhi - 110006",
    reportedBy: "Delhi Flood Control Room (1077)",
    assignedUnit: "NDRF 8th Battalion & Delhi Fire Service",
    verified: true,
    peopleAffected: 420,
    createdAt: "2026-10-30T05:30:00Z",
    description: "Hathnikund barrage outflow caused Yamuna river levels to cross danger mark (208.5m). Backflow entering subterranean underpasses and grid distribution sub-stations.",
    notes: [
      {
        id: "NOTE-3",
        author: "DDMA Control",
        role: "ADMIN",
        timestamp: "2026-10-30T05:35:00Z",
        text: "Authorized traffic diversion on Ring Road. Dewatering pumps mobilized with NDRF 8th Battalion."
      }
    ]
  },
  {
    id: "IND-INC-103",
    title: "Visakhapatnam Industrial Corridor Chemical Gas Plume",
    category: "HAZMAT",
    severity: "HIGH",
    status: "EN_ROUTE",
    latitude: 17.6868,
    longitude: 83.2185,
    address: "Autonagar Industrial Zone, Visakhapatnam, Andhra Pradesh",
    reportedBy: "Industrial Plant Safety Officer",
    assignedUnit: "SDRF HazMat Unit 2",
    verified: true,
    peopleAffected: 180,
    createdAt: "2026-10-30T06:10:00Z",
    description: "Storage tank valve failure released anhydrous ammonia vapor plume. Downwind coastal sector cordoned off with 1km perimeter. Evacuation underway to Cyclone Shelter IND-SHL-003.",
    notes: [
      {
        id: "NOTE-4",
        author: "HazMat Coordinator Rao",
        role: "RESPONDER",
        timestamp: "2026-10-30T06:18:00Z",
        text: "En route with vapor mist neutralizer and level-A biohazard equipment. Shelter-in-place alert broadcasted."
      }
    ]
  },
  {
    id: "IND-INC-104",
    title: "Sundarbans Embankment Breach & Village Inundation",
    category: "FLOOD",
    severity: "CRITICAL",
    status: "DISPATCHED",
    latitude: 22.5726,
    longitude: 88.3639,
    address: "Gosaba Island, South 24 Parganas, West Bengal",
    reportedBy: "Civil Defence Volunteer (Subhash Bose)",
    assignedUnit: "NDRF 2nd Battalion (Haringhata)",
    verified: true,
    peopleAffected: 850,
    createdAt: "2026-10-30T06:45:00Z",
    description: "Earthen tidal embankment breached by spring tide surge. Saline water submerged primary paddy lands and 3 interior villages. Evacuation directed to West Bengal Cyclone Shelters.",
    notes: [
      {
        id: "NOTE-5",
        author: "State Disaster Management Authority",
        role: "ADMIN",
        timestamp: "2026-10-30T06:50:00Z",
        text: "NDRF 2nd battalion dispatched via high-speed amphibious watercraft from Diamond Harbour staging area."
      }
    ]
  },
  {
    id: "IND-INC-105",
    title: "AIIMS JPN Apex Trauma Power Grid Stabilization",
    category: "MEDICAL",
    severity: "HIGH",
    status: "VERIFIED",
    latitude: 28.5672,
    longitude: 77.2100,
    address: "JPN Apex Trauma Centre, Ring Road, Ansari Nagar, New Delhi",
    reportedBy: "Medical Superintendent Duty Desk",
    assignedUnit: "AIIMS Emergency Engineering Unit",
    verified: true,
    peopleAffected: 95,
    createdAt: "2026-10-30T07:20:00Z",
    description: "Localized grid voltage fluctuation caused standby diesel generators to engage. Intensive care life-support units switched seamlessly; secondary fuel supply replenished.",
    notes: [
      {
        id: "NOTE-6",
        author: "Chief Medical Officer",
        role: "ADMIN",
        timestamp: "2026-10-30T07:25:00Z",
        text: "Critical trauma bays fully operational. Liquid medical oxygen tanks at 98% capacity."
      }
    ]
  },
  {
    id: "IND-INC-106",
    title: "Kailasagiri Hill Road Mudslide & Debris Obstruction",
    category: "INFRASTRUCTURE",
    severity: "HIGH",
    status: "PENDING_REVIEW",
    latitude: 17.7120,
    longitude: 83.3150,
    address: "Beach Road & Kailasagiri Approach, Visakhapatnam, Andhra Pradesh",
    reportedBy: "Citizen (Ravi Teja)",
    assignedUnit: null,
    verified: false,
    peopleAffected: 30,
    createdAt: "2026-10-30T07:50:00Z",
    description: "Heavy continuous rains caused slope slippage. Mud and large boulders blocking northern beach road arterial toward IT SEZ. Power transmission pole tilting.",
    notes: []
  }
];
