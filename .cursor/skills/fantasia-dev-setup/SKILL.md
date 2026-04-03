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

## Quick reference

| Goal | Command |
|------|---------|
| **Quality gate** (lint + `tsc` + style + unit tests, one terminal) | `yarn testbatch:verify` |
| **Full project gate** (`testbatch:verify` + `quasar:build:electron` + Playwright component + Playwright E2E) | `yarn testbatch:ensure` |
| ESLint | `yarn lint:eslint` |
| TypeScript (`tsc`, no emit) | `yarn lint:typescript` |
| Stylelint (Vue + SCSS) | `yarn lint:stylelint` |
| Unit tests | `yarn test:unit` |
| Component tests (Playwright) | `yarn test:components` (after production build) |
| E2E tests (Playwright) | `yarn test:e2e` (after production build) |

**Storybook** nested package: run **`yarn`** at the repo root, then **`yarn --cwd .storybook-workspace install`** so **`yarn storybook:run`** / **`yarn storybook:build`** / **`yarn visual:storybook:*`** (Playwright VRT) resolve their dependencies.

See [eslint-typescript.mdc](../../rules/eslint-typescript.mdc) for ESLint vs TSLint, `tsconfig` / `tsc`, and Vitest env typing. See [fantasia-testing](../fantasia-testing/SKILL.md) for test details. **Yarn 1.x** reserves `yarn check` for dependency verification — use **`yarn testbatch:verify`** for the lint/types/style/unit gate ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)).
