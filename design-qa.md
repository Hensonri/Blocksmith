# Blocksmith Studio Design QA

## Comparison target

- Source visual truth: `/workspace/scratch/65687445c81c/upload/C2746FEE-4289-45F1-8061-35B4DE36934E.jpeg`
- Initial browser capture: `audit/screenshots/02-design-teardrop-final.jpg`
- Final browser capture: `audit/screenshots/05-design-teardrop-final.jpg`
- State: Design bench, Teardrop selected, Finished Hat preview, Regular Oval profile, 7 1/4 finished size, felt.
- Source pixels: 1536 x 864, density 1.
- Implementation pixels: 1363 x 936, CSS viewport 1363 x 936, device pixel ratio 1.
- Normalization: the cloud browser viewport is fixed. The implementation therefore uses a 1200 px desktop workstation maximum that reproduces the source's measured main-frame width at its native 1536 px viewport. Comparisons use original-density captures and the same application state; no density scaling or browser chrome is included.

## Findings

No actionable P0, P1, or P2 differences remain.

- P3 — Decorative hardware is simplified.
  - Location: panel frames, workflow navigation, and progress bench.
  - Evidence: the source uses more ornate rivets, arrow connectors, beveling, and engraved plaques; the implementation uses restrained borders and shadows over the same workshop visual language.
  - Impact: minor loss of period ornament, without changing hierarchy, task clarity, or the selected-state language.
  - Follow-up: add a purpose-built border/rivet asset set only if future visual polish justifies the added weight.

- P3 — Custom-profile capture is intentionally absent from the launch path.
  - Location: finished-intent/profile controls.
  - Evidence: the source includes a Custom Profile row; the implementation ships standard RO, R, LO, and XLO profiles and clearly identifies their validation state.
  - Impact: measured personal traces remain a roadmap capability rather than an implied unvalidated launch feature.
  - Follow-up: add conformateur/formillion trace import only after the capture and validation workflow is specified.

## Required fidelity surfaces

- Fonts and typography: Georgia/Times serif fallbacks reproduce the source's historical editorial character, uppercase hierarchy, compact labels, and restrained letter spacing. The source's engraved display face is not bundled; this is acceptable P3 drift.
- Spacing and layout rhythm: the final 1200 px workstation uses 0.9 / 2.1 / 0.9 columns, a 405 px preview, and fixed bench/footer heights. At the verified viewport all three main panels have equal 509 px client and scroll heights, so no panel or persistent control is clipped.
- Colors and visual tokens: dark wood-black panels, aged parchment, muted brass, green readiness, amber selection, and warm cream copy closely track the source. Focus states remain intentionally brighter for accessibility.
- Image quality and asset fidelity: the development source remains the full-bleed workshop backdrop. Five 900 x 600 WebP finished-hat intent assets replace the initial schematic approximation and share the source's sepia wireframe drafting style. These six binaries pass the visual QA gate but are not cleared for public release until replaced or conclusively documented in `docs/ASSET_PROVENANCE.md`. Visual QA and rights clearance are separate gates. The manufacturing preview remains a live analytical canvas and is explicitly separated from finished-hat imagery.
- Copy and content: the implementation preserves the source's core labels while adding necessary safety and validation language. “Concept view only” and “prototype export” wording prevent the illustrative hat from being mistaken for manufacturing geometry.

## Full-view and focused comparison evidence

- Full view: the source and final browser capture were opened together at original density after each blocking iteration. The final composition preserves the title plaque, seven-stage navigation, three-column work surface, large parchment hat preview, progress bench, and lower governed-status rail.
- Focused checks: the left intent picker, central hat asset, right governed-controls panel, and lower progress/status rails are readable in the original-density final capture, so separate crops were not needed. DOM measurements confirmed 272 / 635 / 272 px columns inside the 1200 px frame and no internal overflow in either side panel.

## Comparison history

### Iteration 1 — blocked

- Earlier P1: the finished-hat target was represented by a flat front-view schematic rather than the source's dimensional three-quarter technical illustration.
- Earlier P2: a canvas intrinsic-size feedback loop expanded the page to 1109 px and forced the target composition below the viewport.
- Earlier P2: profile validation and opening dimensions sat below an internal scrollbar.
- Fixes: fixed the preview at 405 px; created five real finished-intent assets; moved validation/opening data above secondary geometry inputs; relabeled full-size output as a prototype validation article.
- Post-fix evidence: `audit/screenshots/02-design-teardrop-final.jpg` records the pre-asset schematic state; subsequent browser inspection confirmed the five selected assets loaded at 900 x 600.

### Iteration 2 — blocked

- Earlier P2: adding real thumbnails introduced 19 px of left-panel overflow, while the right panel retained 166 px of secondary-control overflow.
- Earlier P2: the initial 0.84 / 1.72 / 0.96 desktop columns undersized the reference's central drawing board.
- Fixes: compacted the intent rows; collapsed crown height and taper under Advanced crown geometry; shortened profile guidance without weakening validation disclosure; changed columns to 0.9 / 2.1 / 0.9; capped the desktop workstation at 1200 px.
- Post-fix evidence: `audit/screenshots/05-design-teardrop-final.jpg`; side-panel client height and scroll height are both 509 px, and the final columns measure 272 / 635 / 272 px at the fixed browser viewport.

### Iteration 3 — passed

- Final comparison found no actionable P0, P1, or P2 mismatch.
- Remaining differences are the two P3 follow-ups listed above.

## Browser verification

- Primary interactions tested: workflow navigation; size/profile selection; five finished-hat styles; Block/Finished Hat toggle; advanced crown disclosure; calibration confirmation; provisional-profile full-scale lock; proof-export feedback; printer and filament record; Use safety guidance; Verify troubleshooting branch; Preserve/history; reload persistence.
- Export gate: R plus completed calibration unlocks only the explicitly labeled prototype full-scale export; LO remains proof-only.
- Console: no `terminal.local` warnings or errors. Chrome-extension metadata noise was present outside the application origin and excluded.

## Implementation checklist

- [x] Preserve standard open-crown tooling as the manufacturing geometry.
- [x] Offer clearly separated finished-hat intent imagery.
- [x] Keep validation status and opening dimensions above the fold.
- [x] Prevent unvalidated profiles from full-scale export.
- [x] Verify the end-to-end Hat Project journey and persistence.
- [x] Rebuild and rerun automated checks after final changes.

final visual result: passed

rights-clearance result: held — see `docs/ASSET_PROVENANCE.md`

