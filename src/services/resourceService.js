// Spring Boot REST API Adapter: Resource & Logistics Service
// Simulates Spring Boot /api/v1/shelters and /api/v1/inventory endpoints

const SIMULATED_LATENCY_MS = 250;
const sleep = (ms = SIMULATED_LATENCY_MS) => new Promise(resolve => setTimeout(resolve, ms));

export const resourceService = {
  async getShelters(currentShelters) {
    await sleep();
    return [...currentShelters];
  },

  async updateShelterOccupancy(shelterId, newOccupancy) {
    await sleep();
    return {
      shelterId,
      occupancy: Number(newOccupancy)
    };
  },

  async updateShelterStatus(shelterId, newStatus) {
    await sleep();
    return {
      shelterId,
      status: newStatus
    };
  },

  async getInventory(currentInventory) {
    await sleep();
    return [...currentInventory];
  },

  async updateInventoryQuantity(itemId, newQuantity) {
    await sleep();
    return {
      itemId,
      quantity: Number(newQuantity)
    };
  }
};

