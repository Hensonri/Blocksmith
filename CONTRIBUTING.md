# Contributing to Blocksmith

Thank you for helping make hatmaking tooling more accessible.

## Before opening a change

- Keep Open Crown and standard-profile creation usable without a personal trace.
- Do not present provisional geometry as physically validated.
- Preserve local-first operation and open data.
- Include tests for geometry, sizing, migration, or export changes.
- Record provenance for measured profiles and reference artifacts.
- Do not add third-party logos or copied proprietary geometry.

Run `npm run check` before submitting a pull request.

## Developer Certificate of Origin

Every commit must include a sign-off line:

```text
Signed-off-by: Your Name <you@example.com>
```

Use `git commit -s` to add it. The sign-off certifies that you have the right to contribute the work under the project's license; see <https://developercertificate.org/>.

## Physical-validation evidence

Geometry changes should identify:

- source measurements and tools;
- printer, nozzle, filament, layer height, walls, infill, and orientation;
- calibration coupon result;
- expected and measured dimensions;
- fit, seam, and surface observations;
- photos when appropriate;
- the exact source revision and exported artifact checksum.

