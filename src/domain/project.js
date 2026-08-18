export const PROJECT_SCHEMA_VERSION = "0.1.0";

export function createDefaultProject() {
  const now = new Date().toISOString();
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    projectId: globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}`,
    projectName: "First Open-Crown Block",
    customerName: "",
    createdAt: now,
    updatedAt: now,
    units: "metric",
    measurementMode: "hat-size",
    hatSize: 7.25,
    circumferenceMm: 580,
    profileId: "R",
    toolingCrown: "open-crown",
    finishedIntent: "open-crown",
    material: "felt",
    brimWidthMm: 63.5,
    crownHeightMm: 152.4,
    taperPct: 5,
    printer: {
      model: "Bambu P1S",
      nozzleMm: 0.4,
      layerHeightMm: 0.2,
      walls: 5,
      infillPct: 35,
    },
    filament: {
      brand: "",
      name: "",
      material: "PLA",
      color: "",
    },
    calibration: {
      pinDiameterMm: 3,
      selectedHoleMm: 3.15,
      measuredReferenceMm: 60,
      fitConfirmed: false,
      completedAt: null,
    },
    printResult: {
      status: "not-recorded",
      notes: "",
      recordedAt: null,
    },
    notes: "",
    history: [{ at: now, event: "Project created" }],
  };
}

export function touchProject(project, event) {
  const now = new Date().toISOString();
  return {
    ...project,
    updatedAt: now,
    history: event
      ? [...(project.history ?? []), { at: now, event }]
      : project.history,
  };
}

export function parseProjectFile(text) {
  const candidate = JSON.parse(text);
  if (!candidate || typeof candidate !== "object") {
    throw new Error("The selected file does not contain a Blocksmith project.");
  }
  if (!candidate.schemaVersion || !candidate.projectId) {
    throw new Error("The project is missing its schema version or project identifier.");
  }
  return candidate;
}

