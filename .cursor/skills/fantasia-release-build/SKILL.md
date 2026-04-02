---
name: fantasia-release-build
description: >-
  Produces production Electron builds for Fantasia Archive with electron-
  builder and Quasar. Use when changing build scripts, packaging, or publish
  flags, or when the user asks how to ship the desktop app.
---

# Fantasia Archive — release build

## Scripts (`package.json`)

- **`yarn build`**: `quasar build -m electron --publish never` — local/production artifact without publishing step from Quasar’s perspective.
- **`dev:electron`**: Development mode with hot reload.

## Tooling

- **Node.js**: **22.22.0 or newer** per `package.json` `engines.node` (same floor as Quasar CLI v2 / CI `setup-node` **22.22**).
- **electron-builder** is a devDependency; Quasar/Electron mode drives the overall pipeline (see `quasar.config.ts` and Quasar docs for Electron targets).

## Checklist before a release candidate

1. **Quality gate** in one terminal: `yarn verify` ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)).
2. `yarn build` (separate terminal); smoke-test the packaged app on target OS(es).
3. Run Playwright suites that matter after the same build (`yarn test:component`, `yarn test:e2e`) — see [fantasia-testing](../fantasia-testing/SKILL.md).

## Versioning

- **NEVER** auto-bump any version during release/build workflows.
- Treat `package.json` `version` as the source of truth and keep changelog headings aligned to it.
- Change any version values only when the user explicitly requests a manual version update.
