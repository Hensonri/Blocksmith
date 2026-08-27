import test from "node:test";
import assert from "node:assert/strict";
import { calibrationIsComplete, HOLE_OPTIONS_MM, pinFitCouponScad, xyScaleSuggestion } from "../src/domain/calibration.js";
import { createOpenCrownMesh, shoulderStartFraction, TOP_SHOULDER_DEPTH_MM, validateMesh } from "../src/domain/geometry.js";
import { createDefaultProject, parseProjectFile } from "../src/domain/project.js";
import { displayHatSize, ellipseAxesForCircumference, hatSizeToCircumferenceMm, hatSizeToToolingCircumferenceMm, PROFILE_CATALOG } from "../src/domain/profiles.js";
import { meshToAsciiStl } from "../src/domain/stl.js";
import { detectPlatform } from "../src/domain/analytics.js";

test("platform detection groups current desktop and mobile systems", () => {
  assert.equal(detectPlatform({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }), "Windows");
  assert.equal(detectPlatform({ userAgent: "Mozilla/5.0 (X11; CrOS x86_64 16093.71.0)" }), "ChromeOS");
  assert.equal(detectPlatform({ userAgent: "Mozilla/5.0 (Linux; Android 15)" }), "Android");
  assert.equal(detectPlatform({ platform: "MacIntel", userAgent: "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) Mobile" }), "iOS/iPadOS");
  assert.equal(detectPlatform({ platform: "Linux x86_64" }), "Linux");
});

test("R profile reproduces the BMFS v0.2 570 mm reference opening", () => {
  const axes = ellipseAxesForCircumference(570, PROFILE_CATALOG.R.ratio);
  assert.ok(Math.abs(axes.lengthMm - 193.9) < 0.002);
  assert.ok(Math.abs(axes.widthMm - 168.53) < 0.002);
});

test("TR profile produces a true circular opening", () => {
  const axes = ellipseAxesForCircumference(620, PROFILE_CATALOG.TR.ratio);
  assert.equal(PROFILE_CATALOG.TR.ratio, 1);
  assert.ok(Math.abs(axes.lengthMm - axes.widthMm) < 1e-9);
  assert.ok(Math.abs(axes.lengthMm - 620 / Math.PI) < 1e-9);
});

test("US hat size conversion follows circumference = size × pi inches", () => {
  assert.ok(Math.abs(hatSizeToCircumferenceMm(7.25) - 578.5243) < 0.002);
  assert.equal(displayHatSize(7.25), "7 ¼");
  assert.equal(displayHatSize(7.125), "7 ⅛");
});

test("tooling circumference follows the validated BMFS ten-millimeter size steps", () => {
  assert.equal(hatSizeToToolingCircumferenceMm(7.125), 570);
  assert.equal(hatSizeToToolingCircumferenceMm(7.25), 580);
});

test("open-crown generator returns a closed manifold mesh", () => {
  const mesh = createOpenCrownMesh({ circumferenceMm: 570, profileRatio: PROFILE_CATALOG.R.ratio, crownHeightMm: 152.4, taperDeg: 2 });
  const report = validateMesh(mesh);
  assert.equal(report.valid, true, report.errors.join("\n"));
  assert.equal(report.nonManifoldEdges, 0);
  assert.ok(report.triangleCount > 5_000);
  assert.ok(Math.abs(report.bounds.size[0] - 193.9) < 0.002);
  assert.ok(Math.abs(report.bounds.size[2] - 152.4) < 0.001);
});

test("quarter-scale proof mesh scales all dimensions uniformly", () => {
  const full = validateMesh(createOpenCrownMesh({ circumferenceMm: 570, profileRatio: PROFILE_CATALOG.R.ratio, crownHeightMm: 152.4, scale: 1 }));
  const proof = validateMesh(createOpenCrownMesh({ circumferenceMm: 570, profileRatio: PROFILE_CATALOG.R.ratio, crownHeightMm: 152.4, scale: 0.25 }));
  full.bounds.size.forEach((value, axis) => assert.ok(Math.abs(proof.bounds.size[axis] - value * 0.25) < 0.001));
});

test("top shoulder begins a fixed two inches below the crown top", () => {
  for (const heightMm of [127, 152.4, 203.2]) {
    const startHeightMm = shoulderStartFraction(heightMm) * heightMm;
    assert.ok(Math.abs((heightMm - startHeightMm) - TOP_SHOULDER_DEPTH_MM) < 0.0001);
  }
});

test("STL export contains one facet per mesh triangle", () => {
  const mesh = createOpenCrownMesh({ circumferenceMm: 570, profileRatio: PROFILE_CATALOG.R.ratio, crownHeightMm: 152.4, radialSegments: 24, heightSegments: 8 });
  const stl = meshToAsciiStl(mesh, "test_block");
  assert.match(stl, /^solid test_block/);
  assert.match(stl, /endsolid test_block\n$/);
  assert.equal((stl.match(/facet normal/g) ?? []).length, mesh.faces.length);
});

test("calibration needs measured dimensions and explicit fit confirmation", () => {
  const calibration = { pinDiameterMm: 3, selectedHoleMm: 3.15, measuredReferenceMm: 60, fitConfirmed: false };
  assert.equal(calibrationIsComplete(calibration), false);
  assert.equal(calibrationIsComplete({ ...calibration, fitConfirmed: true }), true);
  assert.equal(xyScaleSuggestion({ measuredReferenceMm: 59.7 }).toFixed(5), (60 / 59.7).toFixed(5));
  assert.deepEqual(HOLE_OPTIONS_MM, [3, 3.05, 3.1, 3.15, 3.2, 3.25, 3.3, 3.35, 3.4, 3.45, 3.5]);
});

test("coupon source preserves the empirical horizontal-hole series", () => {
  const scad = pinFitCouponScad();
  assert.match(scad, /3\.00, 3\.05, 3\.10, 3\.15/);
  assert.match(scad, /rotate\(\[-90, 0, 0\]\)/);
});

test("Hat Project records round-trip through open JSON", () => {
  const project = createDefaultProject();
  const parsed = parseProjectFile(JSON.stringify(project));
  assert.equal(parsed.projectId, project.projectId);
  assert.equal(parsed.toolingCrown, "open-crown");
  assert.equal(parsed.profileId, "R");
  assert.equal(parsed.taperDeg, 2);
  assert.equal("finishedIntent" in parsed, false);
  assert.equal("material" in parsed, false);
  assert.equal("brimWidthMm" in parsed, false);
  assert.equal(PROFILE_CATALOG.XLO.name, "Extra-Long Oval");
});

test("legacy projects adopt the governed two-degree taper", () => {
  const legacy = { ...createDefaultProject(), schemaVersion: "0.1.0", taperPct: 5 };
  delete legacy.taperDeg;
  const parsed = parseProjectFile(JSON.stringify(legacy));
  assert.equal(parsed.taperDeg, 2);
  assert.equal("taperPct" in parsed, false);
});
