---
name: fantasia-release-build
description: >-
  Produces production Electron builds for Fantasia Archive with electron-
  builder and Quasar. Use when changing build scripts, packaging, or publish
  flags, or when the user asks how to ship the desktop app.
---

# Fantasia Archive — release build

## Scripts (`package.json`)

- **`yarn quasar:build:electron`**: `quasar build -m electron --publish never`
- **`yarn quasar:build:electron:summarized`**: **`.utility-scripts/quasarBuildElectronSummarized.mjs`** — log in **`test-results/quasar-build-electron-last.log`** on failure; used by **`testbatch:ensure:*`**
- **`yarn quasar:dev:electron`**: dev + hot reload

## Tooling

- **Node.js 22.22.0+** (`engines.node`)
- **electron-builder** devDependency; Quasar Electron mode drives pipeline (**`quasar.config.ts`**)

## Checklist before release candidate

1. **`yarn testbatch:verify`** one terminal
2. **`yarn quasar:build:electron`** separate terminal; smoke packaged app
3. Playwright after same build — [fantasia-testing](../fantasia-testing/SKILL.md)
4. Full chain: **`yarn testbatch:ensure:nochange`** or separate Storybook scripts

## CI release build (`.github/workflows/build.yml`)

- Manual **`workflow_dispatch`** with a **`version`** input; packages **Windows**, **macOS**, **Linux** (AppImage/deb/rpm) and uploads installers
- **No CI test gate** — verify, Playwright, Storybook VRT do **not** run in the build workflow
- Run the local checklist above (esp. **`yarn testbatch:ensure:nochange`**) on your own machine **before** triggering the CI build
- Push/PR testing stays in **`verify.yml`** and the **`pr-full-suite-*`** labeled-PR workflows

## Versioning

- **NEVER** auto-bump version during release/build
- **`package.json` `version`** = source of truth; changelog headings align
- Change version only when user explicitly requests

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
