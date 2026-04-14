---
name: fantasia-release-build
description: >-
  Produces production Electron builds for Fantasia Archive with electron-
  builder and Quasar. Use when changing build scripts, packaging, or publish
  flags, or when the user asks how to ship the desktop app.
---

# Fantasia Archive — release build

## Scripts (`package.json`)

- **`yarn quasar:build:electron`**: `quasar build -m electron --publish never` — local/production artifact without publishing step from Quasar’s perspective (full log stream).
- **`yarn quasar:build:electron:summarized`**: same build via **`scripts/quasarBuildElectronSummarized.mjs`** — minimal terminal noise; full log in **`test-results/quasar-build-electron-last.log`** on failure. Used by **`yarn testbatch:ensure:*`**.
- **`yarn quasar:dev:electron`**: Development mode with hot reload.

## Tooling

- **Node.js**: **22.22.0 or newer** per `package.json` `engines.node` (same floor as Quasar CLI v2 / CI `setup-node` **22.22**).
- **electron-builder** is a devDependency; Quasar/Electron mode drives the overall pipeline (see `quasar.config.ts` and Quasar docs for Electron targets).

## Checklist before a release candidate

1. **Quality gate** in one terminal: `yarn testbatch:verify` ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)).
2. `yarn quasar:build:electron` (separate terminal); smoke-test the packaged app on target OS(es).
3. Run Playwright suites that matter after the same build (`yarn test:components`, `yarn test:e2e`) — see [fantasia-testing](../fantasia-testing/SKILL.md).
4. For Storybook smoke + visual snapshot compare in one chain with the steps above, use **`yarn testbatch:ensure:nochange`** instead of piecing commands manually (or run **`yarn test:storybook:smoke`** and **`yarn test:storybook:visual`** separately after the build steps as needed).

## Versioning

- **NEVER** auto-bump any version during release/build workflows.
- Treat `package.json` `version` as the source of truth and keep changelog headings aligned to it.
- Change any version values only when the user explicitly requests a manual version update.

## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
