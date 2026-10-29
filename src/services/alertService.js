// Spring Boot REST API Adapter: Alert Service
// Simulates Spring Boot /api/v1/alerts controller endpoints

const SIMULATED_LATENCY_MS = 250;
const sleep = (ms = SIMULATED_LATENCY_MS) => new Promise(resolve => setTimeout(resolve, ms));

export const alertService = {
  async getAll(currentAlerts) {
    await sleep();
    return [...currentAlerts];
  },

  async create(alertDto) {
    await sleep();
    const newId = `ALT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const instructionsList = Array.isArray(alertDto.instructions)
      ? alertDto.instructions
      : (alertDto.instructions || "").split("\n").filter(Boolean);

    const zonesList = Array.isArray(alertDto.affectedZones)
      ? alertDto.affectedZones
      : (alertDto.affectedZones || "").split(",").map(z => z.trim()).filter(Boolean);

    const newAlert = {
      id: newId,
      title: alertDto.title?.trim() || "Official Emergency Broadcast",
      severity: alertDto.severity || "WARNING",
      category: alertDto.category || "GENERAL",
      affectedZones: zonesList.length > 0 ? zonesList : ["Metro Region"],
      instructions: instructionsList.length > 0 ? instructionsList : ["Heed local authority instructions immediately."],
      issuedAt: new Date().toISOString(),
      expiresAt: alertDto.expiresAt || new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      active: true,
      author: alertDto.author?.trim() || "Seattle Emergency Operations Center"
    };

    return newAlert;
  },

  async deactivate(alertId) {
    await sleep();
    return {
      alertId,
      active: false
    };
  }
};

