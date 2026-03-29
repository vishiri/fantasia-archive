---
name: fantasia-dev-setup
description: >-
  Sets up and runs Fantasia Archive locally using Yarn, Node 18, and Quasar
  Electron mode. Use when installing dependencies, choosing dev vs production
  build commands, or when the user mentions environment setup, CLI, or first
  run.
---

# Fantasia Archive — dev setup

## Toolchain

- **Package manager**: Yarn 1.x (README: use Yarn 1.22.19; avoid npm-only workflows for day-to-day work).
- **Node**: v18.x (README references 18.20.6; `nvm` helps pin versions).
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

(`package.json` also exposes `yarn dev:electron`.)

## Production build

Required for packaged app behavior and **before Playwright** component/e2e runs:

```bash
quasar build -m electron
```

(`yarn build` maps to `quasar build -m electron --publish never`.)

## Quick reference

| Goal | Command |
|------|---------|
| Lint | `yarn lint` |
| Unit tests | `yarn test:unit` |
| Component tests (Playwright) | `yarn test:component` (after production build) |
| E2E tests (Playwright) | `yarn test:e2e` (after production build) |

See [fantasia-testing](../fantasia-testing/SKILL.md) for test details.
