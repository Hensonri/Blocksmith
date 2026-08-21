# Licensing Structure

Blocksmith for Hat Makers is intended to remain free, inspectable, repairable, and difficult to capture behind a closed service. Different kinds of project material use licenses suited to software, open hardware, and documentation.

## License map

| Material | License | Principal paths |
| --- | --- | --- |
| Software, tests, schemas, web worker, build and release scripts | GNU AGPL-3.0-or-later | `src/**`, `tests/**`, `worker/**`, `scripts/**`, `index.html`, `vite.config.mjs`, software-oriented JSON/configuration unless overridden |
| Printable hardware source and governed physical-tool geometry | CERN-OHL-S-2.0 | `openscad/**`, `hardware/**`, `geometry-source/**`, and source-design files explicitly marked with `SPDX-License-Identifier: CERN-OHL-S-2.0` |
| Project documentation and cleared educational/illustration material | CC BY-SA 4.0 | `docs/**`, cleared files in `public/assets/**`, and documentation explicitly marked with `SPDX-License-Identifier: CC-BY-SA-4.0` |
| Third-party dependencies and approved references | Their own licenses | Listed individually in `THIRD_PARTY_NOTICES.md` or the applicable provenance manifest |
| Project name, logos, signing keys, and source-identifying marks | Not granted by the source/content licenses | Governed by `TRADEMARKS.md`; third-party marks remain their owners' property |

The complete AGPL-3.0 text is in the root `LICENSE`. Complete CERN-OHL-S-2.0 and CC BY-SA 4.0 texts are in `LICENSES/`.

## Boundary rules

1. A file-level SPDX identifier overrides the directory default.
2. Generated STL/3MF output is governed by the license notice embedded in or distributed with the source generator and release manifest. Every official output must identify its source revision.
3. `public/assets/**` is not automatically cleared merely because it resides in the repository. `docs/ASSET_PROVENANCE.md` controls whether an image is approved for public release and which license may be applied.
4. Third-party packages are not relicensed. Their license obligations must be preserved in source releases and installers.
5. Patent and trademark rights are not granted by CC BY-SA 4.0. CERN-OHL-S-2.0 and AGPL-3.0 include their own terms; consult the complete texts.
6. Where a file combines separable software, documentation, and hardware sources, split it when practical. Otherwise add an explicit header explaining the applicable license for each separable part.

## Contribution certification

Contributors certify origin using Developer Certificate of Origin sign-off. Donated profiles and physical-tool designs must include measurement provenance and permission records. Contributions may not contain unauthorized logos, copied proprietary geometry, restricted STL/3MF files, or generated material whose reference chain cannot be documented.

Commercial hats and tools may be referenced descriptively for compatibility or research, but public presets should use original descriptive names, independent measurements, and clear provenance.

## No warranty

Licensing does not certify geometry, safety, fitness, non-infringement, or physical validation. Refer to `docs/GEOMETRY_STATUS.md`, `docs/PROVENANCE.md`, and the complete license texts.

