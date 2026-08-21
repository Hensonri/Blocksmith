export const MM_PER_INCH = 25.4;
export const BMFS_REFERENCE_HAT_SIZE = 7.125;
export const BMFS_REFERENCE_CIRCUMFERENCE_MM = 570;
export const BMFS_MM_PER_EIGHTH_SIZE = 10;

export const PROFILE_CATALOG = Object.freeze({
  RO: {
    id: "RO",
    name: "Round Oval",
    ratio: 1.1,
    status: "provisional",
    note: "Built-in preview profile; physical reference validation is still required.",
  },
  R: {
    id: "R",
    name: "Regular Oval",
    ratio: 193.9 / 168.53,
    status: "reference-calibrated",
    note: "Scales from the BMFS v0.2 reference opening: 193.900 × 168.530 mm at 570 mm circumference.",
  },
  LO: {
    id: "LO",
    name: "Long Oval",
    ratio: 1.2,
    status: "provisional",
    note: "Built-in preview profile; pending comparison with measured reference blocks.",
  },
  XLO: {
    id: "XLO",
    name: "Extra-Long Oval",
    ratio: 1.25,
    status: "provisional",
    note: "Experimental profile for fit studies; full-scale export remains guarded.",
  },
});

export const HAT_SIZE_OPTIONS = Object.freeze(
  Array.from({ length: 13 }, (_, index) => 6.5 + index * 0.125),
);

const FRACTIONS = [
  { value: 0, label: "" },
  { value: 0.125, label: "⅛" },
  { value: 0.25, label: "¼" },
  { value: 0.375, label: "⅜" },
  { value: 0.5, label: "½" },
  { value: 0.625, label: "⅝" },
  { value: 0.75, label: "¾" },
  { value: 0.875, label: "⅞" },
];

export function displayHatSize(size) {
  const whole = Math.floor(Number(size));
  const fraction = Math.round((Number(size) - whole) * 8) / 8;
  const match = FRACTIONS.find((item) => Math.abs(item.value - fraction) < 0.001);
  return `${whole}${match?.label ? ` ${match.label}` : ""}`;
}

export function hatSizeToCircumferenceMm(size) {
  return Number(size) * Math.PI * MM_PER_INCH;
}

export function hatSizeToToolingCircumferenceMm(size) {
  const eighthSteps = (Number(size) - BMFS_REFERENCE_HAT_SIZE) / 0.125;
  return BMFS_REFERENCE_CIRCUMFERENCE_MM + eighthSteps * BMFS_MM_PER_EIGHTH_SIZE;
}

export function circumferenceMmToHatSize(circumferenceMm) {
  return Number(circumferenceMm) / (Math.PI * MM_PER_INCH);
}

export function ellipseCircumference(semiMajor, semiMinor) {
  const a = Number(semiMajor);
  const b = Number(semiMinor);
  const h = ((a - b) ** 2) / ((a + b) ** 2);
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

export function ellipseAxesForCircumference(circumferenceMm, ratio) {
  const safeRatio = Math.max(1, Number(ratio));
  const unitPerimeter = ellipseCircumference(safeRatio, 1);
  const scale = Number(circumferenceMm) / unitPerimeter;
  return {
    lengthMm: 2 * safeRatio * scale,
    widthMm: 2 * scale,
  };
}

export function getProfile(profileId) {
  return PROFILE_CATALOG[profileId] ?? PROFILE_CATALOG.R;
}

export function openingForProject(project) {
  const profile = getProfile(project.profileId);
  const finishedCircumferenceMm = project.measurementMode === "circumference"
    ? Number(project.circumferenceMm)
    : hatSizeToCircumferenceMm(project.hatSize);
  const inferredHatSize = circumferenceMmToHatSize(finishedCircumferenceMm);
  const circumferenceMm = hatSizeToToolingCircumferenceMm(inferredHatSize);
  return {
    ...ellipseAxesForCircumference(circumferenceMm, profile.ratio),
    circumferenceMm,
    finishedCircumferenceMm,
    profile,
  };
}

export function formatMeasurement(mm, unit = "metric", digits = 1) {
  if (unit === "imperial") {
    return `${(Number(mm) / MM_PER_INCH).toFixed(2)} in`;
  }
  return `${Number(mm).toFixed(digits)} mm`;
}
