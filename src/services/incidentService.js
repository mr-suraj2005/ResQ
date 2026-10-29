// Spring Boot REST API Adapter: Incident Service
// Simulates Spring Boot /api/v1/incidents controller responses with DTO validation and 250ms latency

const SIMULATED_LATENCY_MS = 250;
const sleep = (ms = SIMULATED_LATENCY_MS) => new Promise(resolve => setTimeout(resolve, ms));

export const incidentService = {
  /**
   * Fetch all incidents with optional query filters (simulating GET /api/v1/incidents)
   */
  async getAll(currentList) {
    await sleep();
    return [...currentList];
  },

  /**
   * Fetch incident by ID (simulating GET /api/v1/incidents/{id})
   */
  async getById(currentList, id) {
    await sleep();
    const incident = currentList.find(inc => inc.id === id);
    if (!incident) throw new Error(`Incident with ID ${id} not found.`);
    return { ...incident };
  },

  /**
   * Create new citizen incident report (simulating POST /api/v1/incidents)
   * Returns newly minted Spring Boot DTO with INC-2026-XXX
   */
  async create(reportDto) {
    await sleep();
    const newId = `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident = {
      id: newId,
      title: reportDto.title?.trim() || "Unspecified Emergency Incident",
      category: reportDto.category || "GENERAL",
      severity: reportDto.severity || "MODERATE",
      status: "PENDING_REVIEW",
      latitude: Number(reportDto.latitude) || 47.6062,
      longitude: Number(reportDto.longitude) || -122.3321,
      address: reportDto.address?.trim() || "Seattle Metro Area",
      reportedBy: reportDto.reportedBy?.trim() || "Citizen Report",
      assignedUnit: null,
      verified: false,
      createdAt: new Date().toISOString(),
      description: reportDto.description?.trim() || "",
      imageUrl: reportDto.imageUrl || null,
      notes: [
        {
          id: `NOTE-${Date.now()}`,
          author: "ResQ Ingestion Service",
          role: "SYSTEM",
          timestamp: new Date().toISOString(),
          text: "Incident logged via Citizen Portal. Queued for Emergency Dispatch verification."
        }
      ]
    };
    return newIncident;
  },

  /**
   * Verify an incident (simulating POST /api/v1/incidents/{id}/verify)
   */
  async verify(incidentId, adminName = "EOC Commander") {
    await sleep();
    return {
      incidentId,
      verified: true,
      status: "VERIFIED",
      note: {
        id: `NOTE-${Date.now()}`,
        author: adminName,
        role: "ADMIN",
        timestamp: new Date().toISOString(),
        text: "Incident triaged and verified by Emergency Operations Command."
      }
    };
  },

  /**
   * Reject an incident (simulating POST /api/v1/incidents/{id}/reject)
   */
  async reject(incidentId, reason = "Duplicate or non-emergency report", adminName = "EOC Commander") {
    await sleep();
    return {
      incidentId,
      verified: false,
      status: "REJECTED",
      note: {
        id: `NOTE-${Date.now()}`,
        author: adminName,
        role: "ADMIN",
        timestamp: new Date().toISOString(),
        text: `Incident flagged as rejected. Reason: ${reason}`
      }
    };
  },

  /**
   * Assign responder unit (simulating PUT /api/v1/incidents/{id}/assign)
   */
  async assignUnit(incidentId, unitName, adminName = "EOC Dispatch") {
    await sleep();
    return {
      incidentId,
      assignedUnit: unitName,
      status: "DISPATCHED",
      note: {
        id: `NOTE-${Date.now()}`,
        author: adminName,
        role: "ADMIN",
        timestamp: new Date().toISOString(),
        text: `Unit dispatched: ${unitName}. Tactical telemetry connected.`
      }
    };
  },

  /**
   * Update responder tactical status & field note (simulating PATCH /api/v1/incidents/{id}/status)
   */
  async updateStatus(incidentId, newStatus, fieldNoteText, responderName = "Field Responder") {
    await sleep();
    const newNote = fieldNoteText ? {
      id: `NOTE-${Date.now()}`,
      author: responderName,
      role: "RESPONDER",
      timestamp: new Date().toISOString(),
      text: fieldNoteText
    } : null;

    return {
      incidentId,
      status: newStatus,
      note: newNote
    };
  }
};

