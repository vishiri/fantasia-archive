---
name: fantasia-dev-setup
description: >-
  Sets up and runs Fantasia Archive locally using Yarn, Node.js 22.22 or newer,
  and Quasar Electron mode. Use when installing dependencies, choosing dev vs production
  build commands, or when the user mentions environment setup, CLI, or first
  run.
---

# Fantasia Archive — dev setup

## Toolchain

- **Package manager**: Yarn 1.x (README: use Yarn 1.22.19; avoid npm-only workflows for day-to-day work).
- **Node.js**: **22.22.0 or newer** (`package.json` `engines.node` is `>=22.22.0`; Quasar `@quasar/app-vite` v2 aligns with this). Use `nvm` / `fnm` to pin (e.g. `nvm use 22.22`).
- **Quasar CLI** (recommended): `yarn global add @quasar/cli` — ensure the global Yarn bin is on `PATH`.
- **CI (push/PR)**: [`.github/workflows/verify.yml`](../../../.github/workflows/verify.yml) runs **`yarn testbatch:verify`** only (installs **`.storybook-workspace`** for ESLint). **Storybook** VRT (`yarn test:storybook:visual*`) is **not** run in **GitHub Actions** — use **`yarn testbatch:ensure:nochange`** or the individual scripts locally.

## Install

```bash
yarn
```

## Run (development)

Hot reload and Electron debugging:

```bash
quasar dev -m electron
```

(`package.json` also exposes `yarn quasar:dev:electron`.)

## Troubleshooting

### `Electron failed to install correctly` (missing `node_modules/electron/dist`)

The `electron` package downloads its binary in a **postinstall** step. **`npm install --ignore-scripts`** (or any install that skips lifecycle scripts) leaves `path.txt` / `dist/` missing and Quasar will crash when spawning Electron.

**Fix:** remove the broken folder and reinstall **with scripts enabled** (close running Electron/Quasar first if Windows reports `EBUSY`):

```bash
rm -rf node_modules/electron   # PowerShell: Remove-Item -Recurse -Force node_modules/electron
yarn install
# or: node node_modules/electron/install.js
```

### DevTools `Autofill.enable` / `Autofill.setAddresses` in the terminal

Bundled DevTools call Chrome CDP domains that Electron does not implement; Chromium logs harmless failures to stderr. The app filters those specific lines in the Electron **main** process so the dev terminal stays readable (they can still appear inside the DevTools console itself).

## Production build

Required for packaged app behavior and **before Playwright** component/e2e runs:

```bash
quasar build -m electron
```

(`yarn quasar:build:electron` maps to `quasar build -m electron --publish never`.)

**Playwright `userData`:** With **`TEST_ENV`** **`components`** or **`e2e`**, Electron **`userData`** is **`%APPDATA%/<package.json name>/playwright-user-data`** (here: **`Roaming\fantasia-archive\playwright-user-data`**), **not** **`fantasia-archive-dev`** (that folder is for **`quasar dev`** when **`DEBUGGING`** is set). See [`fixAppName.ts`](../../../src-electron/mainScripts/fixAppName.ts) for main-process wiring and [`playwrightIsolatedUserDataDirName.ts`](../../../src-electron/mainScripts/playwrightIsolatedUserDataDirName.ts) for the shared folder-name constant (Electron-free, used by **`playwrightUserDataReset`**). Each Playwright file calls **`resetFaPlaywrightIsolatedUserData()`** in **`test.beforeEach`** ([`helpers/playwrightHelpers/playwrightUserDataReset.ts`](../../../helpers/playwrightHelpers/playwrightUserDataReset.ts)) so that profile is wiped before every test. Shared Playwright helpers live under **`helpers/playwrightHelpers/`**; add future harness packages as siblings under **`helpers/`**; keep the repo root for config, **`README`**, lockfiles, and **`scripts/`**, not new loose harness **`.ts`** files. Rebuild the production Electron app after changing **`fixAppName`** path logic or **`playwrightIsolatedUserDataDirName`**.

## Quick reference

| Goal | Command |
|------|---------|
| **Quality gate** (lint + `vue-tsc` + style + unit tests, one terminal) | `yarn testbatch:verify` |
| **Full project gate** (verify + Electron build + Playwright component + E2E + Storybook smoke + VRT compare) | `yarn testbatch:ensure:nochange` |
| **Full project gate — refresh Storybook VRT baselines** (same through smoke, then snapshot update) | `yarn testbatch:ensure:change` |
| ESLint | `yarn lint:eslint` |
| TypeScript (`vue-tsc`, no emit; includes `.vue` SFCs) | `yarn lint:typescript` |
| Stylelint (Vue/CSS/SCSS/Sass + Storybook `.storybook` sources) | `yarn lint:stylelint` (autofix: `yarn lint:stylelint:fix`) |
| Unit tests | `yarn test:unit` |
| Component tests (Playwright) | `yarn test:components` (after production build) |
| E2E tests (Playwright) | `yarn test:e2e` (after production build) |

**Storybook** nested package: run **`yarn`** at the repo root, then **`yarn --cwd .storybook-workspace install`** so **`yarn storybook:run`** / **`yarn storybook:build`** / **`yarn test:storybook:visual*`** (Playwright VRT) resolve their dependencies.

See [eslint-typescript.mdc](../../rules/eslint-typescript.mdc) for ESLint vs TSLint, `tsconfig` / `vue-tsc`, and Vitest env typing. See [fantasia-testing](../fantasia-testing/SKILL.md) for test details. **Yarn 1.x** reserves `yarn check` for dependency verification — use **`yarn testbatch:verify`** for the lint/types/style/unit gate ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)).

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
