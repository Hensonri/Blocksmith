# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Blocksmith product decisions

- Preserve the supplied `Blocksmith Studio — The Milliner's Workstation` image as the visual source of truth: an old hatter's shop, brass/wood controls, parchment drawing surface, and the seven-stage Capture → Design → Prepare → Print → Use → Verify → Preserve workflow.
- The primary first-use path is a standard open-crown block using a built-in standard head profile. A conformateur/formillion trace is optional, never required.
- Open Crown is the tooling default. Finished-hat crease choices are an intent preview and must not silently change manufacturing geometry.
- Keep the large central hat visualization interactive so visible form changes track the selected size, profile, crown height, brim width, taper, and finished-hat intent.
- Be honest about validation. R-profile/BMFS reference dimensions may be identified as reference-calibrated; RO, LO, XLO, new crown surfaces, and any unprinted geometry must remain clearly provisional until physically validated.
- Core design/export must work locally and offline without an account. Customer, printer, material, calibration, and print-result records stay on the user's device unless the user explicitly exports them.
- Dual units, progressive disclosure, keyboard access, legible contrast, and a clear path to Export are required. Decorative character must never make controls harder to understand.
- Record attribution as: “Built by Rich and Codex—because the cost of making a hat was just too damn high.”
