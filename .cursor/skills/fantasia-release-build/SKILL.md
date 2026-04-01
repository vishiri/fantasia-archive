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

- **electron-builder** is a devDependency; Quasar/Electron mode drives the overall pipeline (see `quasar.config.js` and Quasar docs for Electron targets).

## Checklist before a release candidate

1. `yarn lint` and `yarn test:unit`.
2. `yarn build`; smoke-test the packaged app on target OS(es).
3. Run Playwright suites that matter after the same build (`yarn test:component`, `yarn test:e2e`) — see [fantasia-testing](../fantasia-testing/SKILL.md).

## Versioning

- Bump `package.json` `version` and any in-app version strings exposed via `appDetails` / i18n as required for the release.
- Gather this version by inspecting the `changeLog.md` for the newest version present in it.
