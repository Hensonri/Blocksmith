# Blocksmith for Hat Makers — Provenance and Clean-Room Record

**Record date:** 2026-08-20  
**Applies to:** Initial public-release candidate and its generated geometry

## Project authorship

Blocksmith for Hat Makers is designed and directed by Rich Henson with AI-assisted research, implementation, illustration, and documentation. Human decisions include the product mission, user workflow, dimensional targets, allowed profiles, safety/validation gates, physical-tool requirements, prototype acceptance criteria, and the selection or rejection of proposed outputs.

## Geometry origin

The release geometry is generated from first-party code, documented measurements, user-selected parameters, and ordinary mathematical constructions. The current standard crown implementation calculates ellipse axes from circumference and profile ratio, generates vertically spaced rings, applies governed taper and shoulder functions, triangulates those rings, and exports a closed STL mesh.

The project does not claim ownership of standard hat-block concepts, functional dimensions, ellipse mathematics, STL conventions, or historical hat-tool mechanisms. It claims authorship only in its original code, documentation, selection and arrangement, independently defined geometry, and project-specific expressive work to the extent protected by law.

## Governed profile status

| Profile | Origin | Current status | Release policy |
| --- | --- | --- | --- |
| Regular Oval (R) | BMFS v0.2 opening reference: 193.900 × 168.530 mm at 570 mm circumference | Reference-calibrated; full-size physical validation pending | Prototype full-scale only after calibration gate. |
| Round Oval (RO) | Independently selected mathematical axis ratio | Provisional | Proof scale only. |
| Long Oval (LO) | Independently selected mathematical axis ratio | Provisional | Proof scale only. |
| Extra-Long Oval (XLO) | Independently selected mathematical axis ratio | Experimental | Proof scale only. |

## Tooling disposition

First-party governed work includes the stand, pusher, puller-down pair, foot tolliker, independently generated 9 mm and 12 mm curlers, rounding-jack layout, sweatband template, spinner, mandrel, bow jig, and calibration coupon, subject to their individual validation status.

The uploaded `cap_3_8f(1).stl`/related curler reference was inspected for dimensions and functional orientation. Its mesh surface was not copied. The Blocksmith curler was redrawn from an independently defined, curvature-continuous centerline with a bottom-entry groove rising approximately 9.525 mm. The uploaded file must remain outside the repository, installers, caches, examples, and release archives.

## Excluded source classes

The following may not enter a Blocksmith public release without a new, documented legal review:

- noncommercial (`NC`) or no-derivatives (`ND`) licensed files;
- MakerWorld Standard License models;
- Cults, Etsy, paid, private, personal-use, or unclear-license models;
- user-supplied STL/3MF files lacking documented ownership and permission;
- traced or surface-copied proprietary meshes;
- competitor screenshots, catalog photographs, logos, marketing copy, distinctive trade dress, or branded preset catalogs;
- generated output whose source references or license cannot be reconstructed.

Historically reviewed but excluded examples include DeeDee 9/12 mm curlers, a MakerWorld brim bender, Cults/Etsy offerings, and unprovenanced user models.

## Approved research classes

Research may rely on Rich Henson's own measurements and photographs, public-domain manuals, confirmed-expired historical patents for functional principles, CC0 material, and CC BY material only when a complete attribution and modification record is preserved. Research material is not automatically a redistributable release asset.

## Code origin and dependencies

Application/domain code was created for this project. The implementation uses ordinary React/Vite infrastructure and standard mathematical/STL methods. Public exact searches of distinctive identifiers did not identify matching external code. Third-party packages remain under their own licenses and are inventoried in `THIRD_PARTY_NOTICES.md` and `package-lock.json`.

## Required per-release evidence

For each signed release, preserve:

1. source commit and release tag;
2. complete source tree and lockfile;
3. exported artifact filename and SHA-256 checksum;
4. generator revision and input parameters;
5. source classification: first-party, CC0, public domain, or approved attributed source;
6. validation state and physical-test evidence;
7. printer, material, orientation, calibration, and measured results where applicable;
8. visual-asset manifest and third-party notice inventory; and
9. a statement that excluded references were not shipped.

## Release statement

Blocksmith for Hat Makers generates original parametric geometry from user inputs, documented dimensions, and independently selected mathematical constructions. Released meshes must be reproducible from Blocksmith source or separately identified as an approved reference. Restricted third-party STL files, catalog imagery, and proprietary mesh surfaces are not included or copied.

