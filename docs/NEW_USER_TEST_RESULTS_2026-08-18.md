# New-User Test Results — 2026-08-18

## What was tested

This was a browser-based cognitive walkthrough using two first-time-maker paths. It is a disciplined simulated new-user test, not a substitute for observing unaffiliated people with physical pins, a coupon, a printer, and a hat body.

The launch question was: can a new maker create and preserve a standard open-crown Hat Project while understanding that the selected finished-hat style is illustrative and that manufacturing validation remains governed separately?

## Path A — size-first hatter

Scenario: a maker knows the finished size is 7 1/4, wants a Teardrop finished hat, and plans to print Regular Oval tooling.

Observed outcome:

1. Capture opened with Hat size selected and the standard profiles available without a scan or trace.
2. The maker could select Teardrop and switch to Finished Hat while the interface continued to state that the printable tooling is Standard Open Crown.
3. The Teardrop illustration changed independently from the governed R opening of 197.3 x 171.5 mm at the 580 mm tooling circumference.
4. Prepare kept prototype full-scale export locked until the pin fit and 60 mm reference were recorded and explicitly confirmed.
5. Printer, filament, safety, inspection, troubleshooting, project history, and shop-traveler steps were reachable without a dead end.
6. The Hat Project survived a browser reload with the recorded printer, filament, calibration, and verification state intact.

Result: passed.

## Path B — style-first experimental maker

Scenario: a maker chooses Cattleman Crease, then selects Long Oval because it appears closer to the wearer.

Observed outcome:

1. Cattleman displayed a distinct finished-hat illustration while the tooling declaration remained Standard Open Crown.
2. Selecting LO immediately changed the visible status to provisional and displayed “Physical validation pending—proof exports only.”
3. The quarter-scale proof path remained available.
4. Prototype full-scale export stayed disabled even after calibration was complete.
5. Returning to R restored the reference-linked status and the separately governed prototype-export gate.

Result: passed.

## Problems found and fixed during the test

| Severity | Finding | Launch fix |
| --- | --- | --- |
| P1 | The initial finished-hat preview looked like a flat engineering schematic, not the dimensional reference. | Added five real sepia wireframe illustrations: Open Crown, Cattleman, Pinch Front, Teardrop, and Center Dent. |
| P2 | The canvas could grow the page and push progress controls below the viewport. | Fixed the preview height and verified the entire workstation remains visible. |
| P2 | Opening/profile validation was below an internal scrollbar. | Moved governed dimensions and status above secondary controls. |
| P2 | Novices met crown height and taper before understanding size, profile, and validation. | Moved those parameters under a closed Advanced crown geometry disclosure. |
| P2 | “Full-scale ready” could imply production validation. | Renamed the state and download as a prototype full-scale validation article, with an explicit first-print hold point. |
| P2 | Side-panel overflow and column ratios drifted from the visual target. | Compacted the panels, removed internal overflow, and rebalanced the workstation around the central hat. |

## What still needs real people

Before a broad public launch, observe 3–5 actual makers—ideally one experienced milliner, one capable 3D-printing novice, and one person familiar with neither domain. The highest-value physical questions are:

- Do they choose RO/R/LO/XLO for the right reason rather than by visual preference?
- Can they measure the physical pin stock and choose the smallest clean finger-fit coupon hole correctly?
- Do they understand finished circumference versus governed tooling circumference?
- Can they move the proof STL through their own slicer without assuming the preview image is printable geometry?
- After a failed print, do they use Verify to return to calibration rather than changing several variables at once?

## Launch recommendation

The prototype is ready for a small, explicitly pre-alpha field test. The software flow now protects the known validation boundaries; actual physical user sessions should precede any production-grade or safety claim.
