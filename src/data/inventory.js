// ResQ Emergency Logistics & Inventory Dataset
export const initialInventory = [
  {
    id: "INV-1001",
    item: "Trauma Care Emergency Medical Kits",
    category: "MEDICAL",
    quantity: 420,
    minThreshold: 200,
    unit: "Kits",
    warehouse: "Central Logistics Depot (SoDo)",
    status: "SUFFICIENT",
    lastAudited: "2026-10-29T12:00:00Z"
  },
  {
    id: "INV-1002",
    item: "Purified Emergency Drinking Water (1L)",
    category: "WATER",
    quantity: 840,
    minThreshold: 1000,
    unit: "Cases (24 btls/case)",
    warehouse: "North Outpost (Bitter Lake)",
    status: "WARNING",
    lastAudited: "2026-10-29T14:30:00Z"
  },
  {
    id: "INV-1003",
    item: "High-Calorie MRE Emergency Rations",
    category: "FOOD",
    quantity: 1250,
    minThreshold: 500,
    unit: "Cases (12 meals/case)",
    warehouse: "Central Logistics Depot (SoDo)",
    status: "SUFFICIENT",
    lastAudited: "2026-10-29T10:15:00Z"
  },
  {
    id: "INV-1004",
    item: "Hypothermia Foil Space Blankets",
    category: "SHELTER_EQUIPMENT",
    quantity: 310,
    minThreshold: 600,
    unit: "Packs (10/pack)",
    warehouse: "West Seattle Auxiliary Station",
    status: "CRITICAL",
    lastAudited: "2026-10-29T15:00:00Z"
  },
  {
    id: "INV-1005",
    item: "Commercial Grade Heavy-Duty Cots",
    category: "SHELTER_EQUIPMENT",
    quantity: 650,
    minThreshold: 300,
    unit: "Cots",
    warehouse: "Central Logistics Depot (SoDo)",
    status: "SUFFICIENT",
    lastAudited: "2026-10-28T18:00:00Z"
  },
  {
    id: "INV-1006",
    item: "Portable Diesel Backup Generators (15kW)",
    category: "ENERGY",
    quantity: 14,
    minThreshold: 20,
    unit: "Units",
    warehouse: "Port Operations Yard",
    status: "WARNING",
    lastAudited: "2026-10-29T11:45:00Z"
  }
];

