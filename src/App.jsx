import { useEffect, useMemo, useRef, useState } from "react";
import { HatPreview, INTENT_IMAGES } from "./components/HatPreview.jsx";
import { calibrationIsComplete, HOLE_OPTIONS_MM, pinFitCouponScad, xyScaleSuggestion } from "./domain/calibration.js";
import { createOpenCrownMesh, validateMesh } from "./domain/geometry.js";
import { createDefaultProject, parseProjectFile, touchProject } from "./domain/project.js";
import { displayHatSize, formatMeasurement, getProfile, HAT_SIZE_OPTIONS, MM_PER_INCH, openingForProject, PROFILE_CATALOG } from "./domain/profiles.js";
import { downloadText, meshToAsciiStl } from "./domain/stl.js";

const STORAGE_KEY = "blocksmith.project.v0.1";
const WORKFLOW = ["Capture", "Design", "Prepare", "Print", "Use", "Verify", "Save Project"];
const FINISHED_INTENTS = [
  ["open-crown", "Open Crown"],
  ["cattleman", "Cattleman Crease"],
  ["pinch-front", "Pinch Front"],
  ["teardrop", "Teardrop"],
  ["center-dent", "Center Dent"],
];

function loadInitialProject() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseProjectFile(stored) : createDefaultProject();
  } catch {
    return createDefaultProject();
  }
}

function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

function StatusPill({ tone = "neutral", children }) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}

function ReadinessRow({ ok, label, detail }) {
  return (
    <div className="readiness-row">
      <span className={`readiness-mark ${ok ? "is-ready" : "is-pending"}`} aria-hidden="true">{ok ? "✓" : "—"}</span>
      <span><strong>{label}</strong><small>{detail}</small></span>
    </div>
  );
}

function safeFilename(value) {
  return String(value || "blocksmith-project").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "blocksmith-project";
}

export function App() {
  const [project, setProject] = useState(loadInitialProject);
  const [activeStep, setActiveStep] = useState(0);
  const [previewMode, setPreviewMode] = useState("tooling");
  const [notice, setNotice] = useState("Project autosaves on this device.");
  const importRef = useRef(null);

  const opening = useMemo(() => openingForProject(project), [project]);
  const profile = getProfile(project.profileId);
  const calibrationComplete = calibrationIsComplete(project.calibration);
  const mesh = useMemo(() => createOpenCrownMesh({
    circumferenceMm: opening.circumferenceMm,
    profileRatio: profile.ratio,
    crownHeightMm: project.crownHeightMm,
    taperPct: project.taperPct,
  }), [opening.circumferenceMm, profile.ratio, project.crownHeightMm, project.taperPct]);
  const meshReport = useMemo(() => validateMesh(mesh), [mesh]);
  const fullExportReady = calibrationComplete && profile.status === "reference-calibrated" && meshReport.valid;

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(project)), [project]);

  function patchProject(patch, event) {
    setProject((current) => touchProject({ ...current, ...patch }, event));
  }

  function patchNested(section, patch, event) {
    setProject((current) => touchProject({ ...current, [section]: { ...current[section], ...patch } }, event));
  }

  function openStep(index) {
    setActiveStep(index);
    setNotice(`${WORKFLOW[index]} bench opened.`);
  }

  function nextStep() {
    openStep(Math.min(WORKFLOW.length - 1, activeStep + 1));
  }

  function startNewProject() {
    if (!window.confirm("Start a new Hat Project? Export the current project first if you want a separate copy.")) return;
    setProject(createDefaultProject());
    setActiveStep(0);
    setNotice("A fresh standard open-crown project is ready.");
  }

  async function importProject(event) {
    const [file] = event.target.files ?? [];
    if (!file) return;
    try {
      const imported = parseProjectFile(await file.text());
      setProject(imported);
      setActiveStep(0);
      setNotice(`Imported ${imported.projectName}.`);
    } catch (error) {
      setNotice(error.message);
    } finally {
      event.target.value = "";
    }
  }

  function exportProject() {
    const filename = `${safeFilename(project.projectName)}.blocksmith.json`;
    downloadText(filename, `${JSON.stringify(project, null, 2)}\n`, "application/json");
    setNotice(`Saved ${filename}.`);
  }

  function exportTraveler() {
    const lines = [
      "BLOCKSMITH SHOP TRAVELER",
      `Project: ${project.projectName}`,
      `Customer: ${project.customerName || "Not recorded"}`,
      "Tooling: Standard Open Crown",
      `Finished intent: ${FINISHED_INTENTS.find(([id]) => id === project.finishedIntent)?.[1]}`,
      `Size: ${displayHatSize(project.hatSize)} / ${opening.finishedCircumferenceMm.toFixed(1)} mm finished circumference`,
      `Governed tooling circumference: ${opening.circumferenceMm.toFixed(1)} mm`,
      `Profile: ${profile.id} — ${profile.name} (${profile.status})`,
      `Opening: ${opening.lengthMm.toFixed(2)} × ${opening.widthMm.toFixed(2)} mm`,
      `Crown height: ${project.crownHeightMm.toFixed(1)} mm`,
      `Brim intent: ${project.brimWidthMm.toFixed(1)} mm`,
      `Printer: ${project.printer.model}`,
      `Filament: ${project.filament.brand} ${project.filament.name} ${project.filament.material}`.trim(),
      `Pin fit: ${project.calibration.pinDiameterMm} mm pin / ${project.calibration.selectedHoleMm} mm selected hole`,
      `Calibration complete: ${calibrationComplete ? "Yes" : "No"}`,
      `Mesh check: ${meshReport.valid ? "Watertight/topologically closed" : meshReport.errors.join("; ")}`,
      `Print result: ${project.printResult.status}`,
      `Notes: ${project.notes || project.printResult.notes || "None"}`,
      "",
      "PRE-PRINT HOLD POINT",
      "Confirm physical profile reference, printer envelope, slicer preview, pin stock measurement, and first-layer setup before a full-scale print.",
    ];
    downloadText(`${safeFilename(project.projectName)}-traveler.txt`, `${lines.join("\n")}\n`);
    setNotice("Shop traveler exported.");
  }

  function exportCrown(scale) {
    const exportMesh = createOpenCrownMesh({ circumferenceMm: opening.circumferenceMm, profileRatio: profile.ratio, crownHeightMm: project.crownHeightMm, taperPct: project.taperPct, scale });
    const report = validateMesh(exportMesh);
    if (!report.valid) {
      setNotice(`Export stopped: ${report.errors.join(" ")}`);
      return;
    }
    const suffix = scale === 1 ? "prototype-full-scale" : "quarter-scale-proof";
    downloadText(`${safeFilename(project.projectName)}-${profile.id.toLowerCase()}-${suffix}.stl`, meshToAsciiStl(exportMesh, `blocksmith_${profile.id.toLowerCase()}_${suffix.replaceAll("-", "_")}`), "model/stl");
    setNotice(scale === 1
      ? "Prototype full-scale crown STL exported; the first physical print remains a validation article."
      : "Quarter-scale proof crown STL exported.");
  }

  function recordPrintResult(status) {
    patchNested("printResult", { status, recordedAt: new Date().toISOString() }, `Print marked ${status}`);
    setNotice(status === "satisfied" ? "Print accepted and recorded." : "Troubleshooting path opened; calibration review recommended.");
  }

  const sizeLabel = project.measurementMode === "hat-size" ? displayHatSize(project.hatSize) : formatMeasurement(project.circumferenceMm, project.units);
  const primaryLabel = activeStep === WORKFLOW.length - 1 ? "Export Project Record" : `Continue to ${WORKFLOW[activeStep + 1]}`;

  function renderLeftPanel() {
    if (activeStep === 0) {
      return (
        <>
          <h2>Start a Hat Project</h2>
          <p className="panel-intro">Standard profiles need no scan or uploaded trace.</p>
          <Field label="Project name"><input value={project.projectName} onChange={(event) => patchProject({ projectName: event.target.value })} /></Field>
          <Field label="Customer or wearer" hint="Optional; saved only on this device."><input value={project.customerName} onChange={(event) => patchProject({ customerName: event.target.value })} placeholder="Name or shop reference" /></Field>
          <fieldset className="segmented-field"><legend>Units</legend><button className={project.units === "metric" ? "is-selected" : ""} onClick={() => patchProject({ units: "metric" })}>Metric</button><button className={project.units === "imperial" ? "is-selected" : ""} onClick={() => patchProject({ units: "imperial" })}>SAE</button></fieldset>
          <fieldset className="segmented-field"><legend>Starting measurement</legend><button className={project.measurementMode === "hat-size" ? "is-selected" : ""} onClick={() => patchProject({ measurementMode: "hat-size" })}>Hat size</button><button className={project.measurementMode === "circumference" ? "is-selected" : ""} onClick={() => patchProject({ measurementMode: "circumference" })}>Circumference</button></fieldset>
          {project.measurementMode === "hat-size" ? (
            <Field label="Finished hat size"><select value={project.hatSize} onChange={(event) => patchProject({ hatSize: Number(event.target.value) }, "Finished size changed")}>{HAT_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{displayHatSize(size)}</option>)}</select></Field>
          ) : (
            <Field label={`Head circumference (${project.units === "metric" ? "mm" : "in"})`}><input type="number" min={project.units === "metric" ? 500 : 19.7} max={project.units === "metric" ? 650 : 25.6} step={project.units === "metric" ? 0.5 : 0.01} value={project.units === "metric" ? project.circumferenceMm : (project.circumferenceMm / MM_PER_INCH).toFixed(2)} onChange={(event) => patchProject({ circumferenceMm: project.units === "metric" ? Number(event.target.value) : Number(event.target.value) * MM_PER_INCH }, "Circumference changed")} /></Field>
          )}
        </>
      );
    }
    if (activeStep === 1) {
      return (
        <>
          <h2>Finished Hat Intent</h2>
          <p className="panel-intro">The printable block remains an open crown. This choice previews later hand-shaping.</p>
          <fieldset className="radio-list"><legend className="sr-only">Finished hat intent</legend>{FINISHED_INTENTS.map(([id, label]) => <label key={id} className={project.finishedIntent === id ? "is-selected" : ""}><input type="radio" name="intent" checked={project.finishedIntent === id} onChange={() => patchProject({ finishedIntent: id }, `Finished intent set to ${label}`)} /><img className="intent-thumb" src={INTENT_IMAGES[id]} alt="" aria-hidden="true" /><span>{label}</span></label>)}</fieldset>
          <div className="tooling-lock"><strong>Tooling geometry</strong><span>Standard Open Crown</span></div>
          <fieldset className="segmented-field"><legend>Hat material</legend>{[["felt", "Felt"], ["straw", "Straw"], ["fabric", "Fabric"]].map(([id, label]) => <button key={id} className={project.material === id ? "is-selected" : ""} onClick={() => patchProject({ material: id })}>{label}</button>)}</fieldset>
        </>
      );
    }
    if (activeStep === 2) {
      return (
        <>
          <h2>Calibration Bench</h2>
          <p className="panel-intro">Measure the actual pins before locking the mating-hole allowance.</p>
          <Field label="Measured pin diameter (mm)"><input type="number" min="2.8" max="3.4" step="0.001" value={project.calibration.pinDiameterMm} onChange={(event) => patchNested("calibration", { pinDiameterMm: Number(event.target.value), fitConfirmed: false })} /></Field>
          <Field label="Smallest clean finger-fit hole"><select value={project.calibration.selectedHoleMm} onChange={(event) => patchNested("calibration", { selectedHoleMm: Number(event.target.value), fitConfirmed: false })}>{HOLE_OPTIONS_MM.map((value) => <option key={value} value={value}>{value.toFixed(2)} mm</option>)}</select></Field>
          <Field label="Measured 60 mm reference"><input type="number" min="58" max="62" step="0.01" value={project.calibration.measuredReferenceMm} onChange={(event) => patchNested("calibration", { measuredReferenceMm: Number(event.target.value), fitConfirmed: false })} /></Field>
          <label className="check-field"><input type="checkbox" checked={project.calibration.fitConfirmed} onChange={(event) => patchNested("calibration", { fitConfirmed: event.target.checked, completedAt: event.target.checked ? new Date().toISOString() : null }, event.target.checked ? "Calibration fit confirmed" : "Calibration reopened")} /><span>Pin inserts with finger pressure and does not rock.</span></label>
          <button className="secondary-button full-width" onClick={() => downloadText("blocksmith-pin-fit-coupon-v0_1.scad", pinFitCouponScad())}>Download Pin-Fit Coupon SCAD</button>
        </>
      );
    }
    if (activeStep === 3) {
      return (
        <>
          <h2>Print Plan</h2>
          <Field label="Printer"><input value={project.printer.model} onChange={(event) => patchNested("printer", { model: event.target.value })} /></Field>
          <div className="field-grid"><Field label="Nozzle (mm)"><input type="number" min="0.2" max="1.2" step="0.1" value={project.printer.nozzleMm} onChange={(event) => patchNested("printer", { nozzleMm: Number(event.target.value) })} /></Field><Field label="Layer (mm)"><input type="number" min="0.08" max="0.4" step="0.01" value={project.printer.layerHeightMm} onChange={(event) => patchNested("printer", { layerHeightMm: Number(event.target.value) })} /></Field><Field label="Walls"><input type="number" min="3" max="12" step="1" value={project.printer.walls} onChange={(event) => patchNested("printer", { walls: Number(event.target.value) })} /></Field><Field label="Infill (%)"><input type="number" min="10" max="100" step="5" value={project.printer.infillPct} onChange={(event) => patchNested("printer", { infillPct: Number(event.target.value) })} /></Field></div>
          <div className="callout"><strong>Baseline</strong><span>0.20 mm layers, at least 5 walls, 30–40% infill, and slicer preview before committing material.</span></div>
        </>
      );
    }
    if (activeStep === 4) {
      return (
        <>
          <h2>Use the Tooling</h2><p className="panel-intro">The open crown supports later hand-shaping without locking the maker into one crease.</p>
          <ol className="instruction-list"><li>Inspect all seams, pin engagement, and surface continuity.</li><li>Protect the felt and warm it gradually with controlled steam.</li><li>Seat the crown evenly; do not force a cold or dry body.</li><li>Allow the hat to cool and dry fully before removal.</li><li>Inspect the felt surface and record the result.</li></ol>
          <div className="warning-callout">Heat, steam, and hot tooling can burn. Follow equipment and material safety guidance.</div>
        </>
      );
    }
    if (activeStep === 5) {
      return (
        <>
          <h2>Verify the Print</h2><p className="panel-intro">Are you satisfied with dimensional fit, seams, and the formed felt surface?</p>
          <div className="result-buttons"><button className={project.printResult.status === "satisfied" ? "is-selected" : ""} onClick={() => recordPrintResult("satisfied")}>Yes — Accept</button><button className={project.printResult.status === "needs-attention" ? "is-selected" : ""} onClick={() => recordPrintResult("needs-attention")}>No — Troubleshoot</button></div>
          <Field label="Inspection notes"><textarea rows="6" value={project.printResult.notes} onChange={(event) => patchNested("printResult", { notes: event.target.value })} placeholder="Surface marks, dimensional observations, pin fit, slicer changes…" /></Field>
          {project.printResult.status === "needs-attention" ? <div className="warning-callout">Rerun the calibration coupon first, confirm the filament record, inspect slicer scaling and seam orientation, then create a revised proof print.</div> : null}
        </>
      );
    }
    return (
      <>
        <h2>Save the Work</h2><p className="panel-intro">Keep the editable Hat Project with the print, inspection, and material history.</p>
        <Field label="Project notes"><textarea rows="7" value={project.notes} onChange={(event) => patchProject({ notes: event.target.value })} placeholder="What should the next maker—or future you—know?" /></Field>
        <button className="primary-button full-width" onClick={exportProject}>Export Project Record</button><button className="secondary-button full-width" onClick={exportTraveler}>Export Shop Traveler</button>
        <div className="privacy-note">No account required. These records stay on this device until you export them.</div>
      </>
    );
  }

  function renderRightPanel() {
    if (activeStep <= 1) {
      return (
        <>
          <h2>Governed Controls</h2><div className="governed-summary"><span>Finished size</span><strong>{sizeLabel}</strong></div>
          <fieldset className="profile-picker"><legend>Standard head profile</legend>{Object.values(PROFILE_CATALOG).map((item) => <button key={item.id} className={project.profileId === item.id ? "is-selected" : ""} onClick={() => patchProject({ profileId: item.id }, `Profile changed to ${item.name}`)} title={item.note}><strong>{item.id}</strong><span>{item.name}</span></button>)}</fieldset>
          <div className="dimension-table"><span>Opening</span><strong>{opening.lengthMm.toFixed(1)} × {opening.widthMm.toFixed(1)} mm</strong><span>Tooling circumference</span><strong>{opening.circumferenceMm.toFixed(1)} mm</strong><span>Profile status</span><StatusPill tone={profile.status === "reference-calibrated" ? "ready" : "warn"}>{profile.status}</StatusPill></div>
          <Field label={`Brim intent (${project.units === "metric" ? "mm" : "in"})`} hint="Finished-hat preview only in v0.1."><input type="number" min={project.units === "metric" ? 38 : 1.5} max={project.units === "metric" ? 127 : 5} step={project.units === "metric" ? 0.5 : 0.05} value={project.units === "metric" ? project.brimWidthMm : (project.brimWidthMm / MM_PER_INCH).toFixed(2)} onChange={(event) => patchProject({ brimWidthMm: project.units === "metric" ? Number(event.target.value) : Number(event.target.value) * MM_PER_INCH })} /></Field>
          <details className="advanced-controls"><summary>Advanced crown geometry</summary><Field label={`Crown height (${project.units === "metric" ? "mm" : "in"})`}><input type="number" min={project.units === "metric" ? 100 : 3.94} max={project.units === "metric" ? 200 : 7.87} step={project.units === "metric" ? 0.5 : 0.01} value={project.units === "metric" ? project.crownHeightMm : (project.crownHeightMm / MM_PER_INCH).toFixed(2)} onChange={(event) => patchProject({ crownHeightMm: project.units === "metric" ? Number(event.target.value) : Number(event.target.value) * MM_PER_INCH })} /></Field><Field label="Crown taper (%)"><input type="range" min="0" max="12" step="0.5" value={project.taperPct} onChange={(event) => patchProject({ taperPct: Number(event.target.value) })} /><output>{project.taperPct.toFixed(1)}%</output></Field></details>
          <p className="governed-note">{profile.status === "reference-calibrated" ? "Reference-linked to the BMFS R baseline." : "Physical validation pending—proof exports only."}</p>
        </>
      );
    }
    if (activeStep === 2) {
      return (
        <>
          <h2>Tooling Readiness</h2><ReadinessRow ok={meshReport.valid} label="Closed STL mesh" detail={`${meshReport.triangleCount.toLocaleString()} triangles`} /><ReadinessRow ok={profile.status === "reference-calibrated"} label="Profile reference" detail={profile.status === "reference-calibrated" ? "BMFS R baseline linked" : "Physical validation pending"} /><ReadinessRow ok={calibrationComplete} label="Pin and XY calibration" detail={calibrationComplete ? `${project.calibration.selectedHoleMm.toFixed(2)} mm selected hole` : "Print and record the coupon"} /><ReadinessRow ok={project.crownHeightMm >= 100 && project.crownHeightMm <= 200} label="Governed dimensions" detail={`${project.crownHeightMm.toFixed(1)} mm crown height`} />
          <div className="callout"><strong>XY scale observation</strong><span>{(xyScaleSuggestion(project.calibration) * 100).toFixed(3)}% reference correction. Record this; do not apply blindly.</span></div>
          <button className="primary-button full-width" onClick={() => exportCrown(0.25)}>Export ¼-Scale Proof STL</button><button className="secondary-button full-width" disabled={!fullExportReady} onClick={() => exportCrown(1)}>Export Prototype Full-Scale STL</button>
          <p className="button-explanation">{fullExportReady
            ? "Export is unlocked for a first physical validation article—not production-certified tooling. Inspect and record the print before use."
            : "Prototype full-scale export unlocks after the R reference profile, closed-mesh check, and calibration record all pass."}</p>
        </>
      );
    }
    if (activeStep === 3) {
      return (
        <>
          <h2>Filament Record</h2><Field label="Brand"><input value={project.filament.brand} onChange={(event) => patchNested("filament", { brand: event.target.value })} placeholder="e.g., Bambu Lab" /></Field><Field label="Product or line"><input value={project.filament.name} onChange={(event) => patchNested("filament", { name: event.target.value })} placeholder="e.g., PLA Basic" /></Field>
          <Field label="Material"><select value={project.filament.material} onChange={(event) => patchNested("filament", { material: event.target.value })}>{["PLA", "PLA+", "PETG", "PETG-CF", "PA-CF", "ABS", "Other"].map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Color or lot"><input value={project.filament.color} onChange={(event) => patchNested("filament", { color: event.target.value })} /></Field><button className="secondary-button full-width" onClick={exportTraveler}>Export Print Traveler</button><div className="privacy-note">Material history travels with this Hat Project and can help diagnose later print issues.</div>
        </>
      );
    }
    if (activeStep === 4) {
      return <><h2>Handling Checks</h2><ReadinessRow ok={calibrationComplete} label="Pins verified" detail={`${project.calibration.pinDiameterMm} mm measured pin stock`} /><ReadinessRow ok={project.printResult.status !== "needs-attention"} label="Surface condition" detail="Inspect before and after forming" /><ReadinessRow ok={Boolean(project.filament.material)} label="Material traceability" detail={`${project.filament.brand || "Unrecorded brand"} ${project.filament.material}`} /><div className="callout"><strong>Felt witness test</strong><span>Photograph the felt before forming, after seating, and after removal—especially across modular seams.</span></div></>;
    }
    if (activeStep === 5) {
      return <><h2>Recovery Path</h2><ReadinessRow ok={project.printResult.status === "satisfied"} label="User acceptance" detail={project.printResult.status === "not-recorded" ? "Awaiting result" : project.printResult.status} /><ReadinessRow ok={calibrationComplete} label="Calibration record" detail={calibrationComplete ? "Available for diagnosis" : "Incomplete—rerun coupon"} /><ReadinessRow ok={Boolean(project.filament.brand && project.filament.material)} label="Filament trace" detail={project.filament.brand ? `${project.filament.brand} ${project.filament.material}` : "Add brand and material"} /><button className="secondary-button full-width" onClick={() => openStep(2)}>Return to Calibration</button><button className="secondary-button full-width" onClick={() => openStep(3)}>Review Print Record</button></>;
    }
    return (
      <>
        <h2>Project Lineage</h2><div className="dimension-table"><span>Schema</span><strong>{project.schemaVersion}</strong><span>Project ID</span><strong className="truncate" title={project.projectId}>{project.projectId}</strong><span>Created</span><strong>{new Date(project.createdAt).toLocaleDateString()}</strong><span>Updated</span><strong>{new Date(project.updatedAt).toLocaleString()}</strong></div>
        <ol className="history-list">{(project.history ?? []).slice(-6).reverse().map((item, index) => <li key={`${item.at}-${index}`}><span>{item.event}</span><time>{new Date(item.at).toLocaleString()}</time></li>)}</ol><div className="attribution">Built by Rich and Codex—because the cost of making a hat was just too damn high.</div>
      </>
    );
  }

  return (
    <main className="studio-shell">
      <div className="studio-backdrop" aria-hidden="true" />
      <section className="workstation" aria-label="Blocksmith Studio workstation">
        <header className="studio-header"><div className="title-plaque"><p>BLOCKSMITH STUDIO</p><span>THE MILLINER'S WORKSTATION</span></div><div className="project-actions"><button onClick={startNewProject}>New Project</button><button onClick={() => importRef.current?.click()}>Import</button><button onClick={exportProject}>Save Copy</button><a className="support-link" href="https://ko-fi.com/blocksmithhatmaker" target="_blank" rel="noreferrer">Support Blocksmith</a><input ref={importRef} className="sr-only" type="file" accept=".json,.blocksmith" onChange={importProject} /></div></header>
        <nav className="workflow-nav" aria-label="Hat Project workflow">{WORKFLOW.map((step, index) => <button key={step} className={activeStep === index ? "is-current" : index < activeStep ? "is-complete" : ""} onClick={() => openStep(index)} aria-current={activeStep === index ? "step" : undefined}><span>{index + 1}</span>{step}</button>)}</nav>
        <div className="workspace-grid"><aside className="work-panel left-panel">{renderLeftPanel()}</aside><section className="drawing-board" aria-label="Interactive hat visualization"><div className="board-heading"><span>{previewMode === "tooling" ? "Manufacturing tooling preview" : "Finished-hat intent · illustrative"}</span><div className="preview-toggle" role="group" aria-label="Preview mode"><button className={previewMode === "tooling" ? "is-selected" : ""} onClick={() => setPreviewMode("tooling")}>Block</button><button className={previewMode === "finished" ? "is-selected" : ""} onClick={() => setPreviewMode("finished")}>Finished Hat</button></div></div><HatPreview project={project} opening={opening} mode={previewMode} /><div className="board-caption">{previewMode === "tooling" ? "Preview follows governed manufacturing parameters." : "Concept view only—creases do not alter the open-crown STL."}</div></section><aside className="work-panel right-panel">{renderRightPanel()}</aside></div>
        <section className="progress-bench" aria-label="Current workflow progress"><div className="progress-title"><span>Hat Project Progression</span><strong>{WORKFLOW[activeStep]}</strong></div><div className="progress-rail">{WORKFLOW.map((step, index) => <button key={step} className={index === activeStep ? "is-current" : index < activeStep ? "is-complete" : ""} onClick={() => openStep(index)}><span aria-hidden="true">{index < activeStep ? "✓" : index + 1}</span>{step}</button>)}</div><button className="primary-button bench-action" onClick={activeStep === WORKFLOW.length - 1 ? exportProject : nextStep}>{primaryLabel}</button></section>
        <footer className="status-bar"><span>STANDARD OPEN CROWN</span><span>{profile.id} · {profile.name}</span><span>{(project.brimWidthMm / MM_PER_INCH).toFixed(2)} in brim intent</span><StatusPill tone={fullExportReady ? "ready" : "warn"}>{fullExportReady ? "PROTOTYPE EXPORT UNLOCKED" : "PROOF MODE"}</StatusPill><output aria-live="polite">{notice}</output></footer>
      </section>
    </main>
  );
}
