# Geometry and Validation Status

This document is a manufacturing-honesty ledger. A green interface does not replace physical inspection.

| Surface | Current state | Evidence | Export policy |
| --- | --- | --- | --- |
| R standard opening | Reference-calibrated | BMFS v0.2 baseline: 193.900 × 168.530 mm at 570 mm circumference | Prototype full-scale may unlock after printer/pin calibration |
| RO opening ratio | Provisional | Mathematical ellipse only | Proof scale only |
| LO opening ratio | Provisional | Mathematical ellipse only | Proof scale only |
| XLO opening ratio | Experimental | Mathematical ellipse only | Proof scale only |
| Standard open-crown surface | Computationally validated | Closed manifold mesh, finite coordinates, governed bounds, automated tests | Proof scale by default; first full-size print remains a prototype |
| Finished-hat creases | Illustrative | Five style-matched raster intent views, explicitly separated from the analytical tooling preview | Never exported as manufacturing geometry in v0.1 |
| Pin-fit coupon | Empirical workflow preserved | 3.00–3.50 mm horizontal holes in 0.05 mm steps | SCAD source available; render before printing |

## Known physical evidence

- Prototype 001 confirmed the initial geometry concept.
- The pin-fit sequence measured actual pin stock before selecting hole allowance.
- Prototype 003 used 3.15 mm modeled holes with measured 3.00 mm pins and supported hand assembly/disassembly with two 50 mm pins.
- The brim modular-flange work established numerical and physical reference data that the R-profile opening uses here.

The corresponding historical SCAD/STL source files must be imported from their authoritative originals rather than reconstructed from memory. This repository does not claim to contain those files yet.

## Full-scale hold points

Before any full-scale print:

1. Measure the exact pin stock.
2. Print the coupon on the intended printer with the intended material and orientation.
3. Record the smallest clean finger-fit hole with no rocking.
4. Measure the 60 mm reference and investigate scale error rather than applying compensation blindly.
5. Confirm the profile status and opening dimensions.
6. Slice and inspect wall count, infill, seams, overhangs, first layer, and printer envelope.
7. Print a proof whenever the profile, printer, material, or geometry revision changes.
8. Inspect the printed part and felt witness surface before accepting the revision.
