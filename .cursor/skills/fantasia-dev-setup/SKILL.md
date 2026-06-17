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

- **Package manager**: Yarn 1.x (CI: **`yarn@1.22.19`**)
- **Node.js**: **22.22.0+** (`package.json` `engines.node` **`>=22.22.0`**)
- **Quasar CLI** (optional global): `yarn global add @quasar/cli`
- **CI**: [`.github/workflows/verify.yml`](../../../.github/workflows/verify.yml) — **`yarn testbatch:verify`** only; Storybook VRT local only

## Install

```bash
yarn
```

DnD libs (**`vue-draggable-plus`**, **`quasar-ui-q-draggable-table`**) in **`package.json`**; boot **`q-draggable-table`**. Policy: [fantasia-drag-drop](../fantasia-drag-drop/SKILL.md).

## Run (development)

```bash
quasar dev -m electron
```

(`yarn quasar:dev:electron`). Electron + Storybook together: **`yarn app:dev`**.

## Troubleshooting

### Electron failed to install correctly

Postinstall skipped → missing **`node_modules/electron/dist`**.

```bash
rm -rf node_modules/electron   # PowerShell: Remove-Item -Recurse -Force node_modules/electron
yarn install
# or: node node_modules/electron/install.js
```

### DevTools Autofill CDP noise

Harmless stderr; main process filters specific lines.

### better-sqlite3 bindings missing

Native addon must match Electron ABI.

```bash
yarn rebuild:native
```

Close quasar dev first on Windows file locks. If still fails: remove **`node_modules/better-sqlite3`**, **`yarn install`** (scripts enabled), **`yarn rebuild:native`** again.

## Production build

Required for packaged behavior + **before Playwright**:

```bash
quasar build -m electron
```

(`yarn quasar:build:electron` = `quasar build -m electron --publish never`).

**Quieter**: **`yarn quasar:build:electron:summarized`** — log in **`test-results/quasar-build-electron-last.log`**.

**Playwright `userData`**: **`TEST_ENV`** **`components`**/**`e2e`** → **`%APPDATA%/fantasia-archive/playwright-user-data`**. Serial suites reset in **`test.beforeAll`** only — see [fantasia-testing](../fantasia-testing/SKILL.md).

## Quick reference

| Goal | Command |
|------|---------|
| Quality gate | `yarn testbatch:verify` |
| Full project gate | `yarn testbatch:ensure:nochange` |
| Refresh Storybook VRT | `yarn testbatch:ensure:change` |
| ESLint | `yarn lint:eslint` |
| TypeScript | `yarn lint:typescript` |
| Stylelint | `yarn lint:stylelint` |
| Unit tests | `yarn test:unit` |
| Component tests | `yarn test:components` (after prod build) |
| E2E | `yarn test:e2e` (after prod build) |

**Storybook**: `yarn --cwd .storybook-workspace install` after root **`yarn`**.

See [eslint-typescript.mdc](../../rules/eslint-typescript.mdc), [fantasia-testing](../fantasia-testing/SKILL.md). **Yarn 1.x**: **`yarn check`** ≠ quality gate — use **`yarn testbatch:verify`**.

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
