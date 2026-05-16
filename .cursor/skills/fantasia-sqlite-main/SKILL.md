---
name: fantasia-sqlite-main
description: >-
  Designs SQLite usage in Fantasia Archive’s Electron main process: file
  locations under userData, native better-sqlite3 module constraints, and migrations.
  Use when editing electron-main database code, schema, or persistence paths.
---

# Fantasia Archive — SQLite in main process

## Current state

- **`better-sqlite3`** is a native Node dependency; access belongs in the **main process** only.
- **User projects** are SQLite files with the **`.faproject`** extension. Main code lives under **`src-electron/mainScripts/projectManagement/`** (save dialog, slugging, path checks, **`PRAGMA user_version`** migrations, active connection lifecycle). The renderer calls **`window.faContentBridgeAPIs.projectManagement.createProject`** (see **`types/I_faProjectManagementDomain.ts`**, **`FA_PROJECT_MANAGEMENT_IPC`**, **`registerFaProjectManagementIpc`**).
- **E2E**: Playwright uses **`e2eSetNextProjectCreatePath`** in **`helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths.ts`** (**`TEST_ENV: 'e2e'`** only) to set the absolute path for the next create; main reads it via **`faProjectManagementE2ePathOverride.ts`** (global setter key must stay aligned with the helper).
- Older temp / prototype paths under **`userData`** may still use **`_faProjectTemp/`** or experimental extensions (for example **`.fae`**) in local branches; product **`.faproject`** files are the supported user-visible project containers.

## Principles

1. **Never open arbitrary SQL from the renderer** — expose narrow, validated operations via preload APIs if the UI needs data. If those APIs use main-process IPC, add channel names to `electron-ipc-bridge.ts` and register handlers in `mainScripts/ipcManagement/register*Ipc.ts` (see [fantasia-electron-preload](../fantasia-electron-preload/SKILL.md)).
2. **Paths**: Use `app.getPath('userData')` (or other `app.getPath` variants) for per-user storage; create directories before opening the DB.
3. **Native builds**: `better-sqlite3` must compile for the Electron/Node ABI used by the packaged app; verify `yarn quasar:build:electron` and packaged runs after upgrades.
4. **Lifecycle**: Open/close or pool connections deliberately; avoid leaking handles on window reload during dev.

## Active project DB access (mandatory failsafe)

All **active `.faproject`** reads and writes in main (including project noteboard, styling persistence, and any new IPC that touches the open project file) must go through **`runWithFaProjectDatabaseForIpcAsync`** or **`runWithFaProjectDatabaseSync`** from **`src-electron/mainScripts/projectManagement/faProjectDatabaseEnsureConnected.ts`**, not direct **`getFaProjectActiveDatabase()`** calls. ESLint restricts **`getFaProjectActiveDatabase`**, **`getFaProjectLastKnownActiveProjectFilePath`**, and **`replaceFaProjectActiveDatabase`** imports outside the allowlisted modules; see **`.cursor/rules/fa-project-database-access.mdc`**.

- **Mirrored path**: Main keeps the last known absolute **`.faproject`** path alongside the **`better-sqlite3`** handle (**`faProjectActiveDatabase.ts`**). **`replaceFaProjectActiveDatabase(db, filePath)`** runs on successful open and create; **`closeFaProjectActiveDatabase()`** clears both; **`closeFaProjectActiveDatabaseHandleOnly()`** drops only the handle so a single reconnect can reuse the path.
- **Reconnect + retry**: One synchronous reopen from the mirrored path when the handle is null, plus at most **one** handle-only close and retry when the operation throws a classified SQLite / **better-sqlite3** error. A **single-flight** mutex avoids overlapping reconnects.
- **Optional renderer path**: If main has no mirrored path after reconnect, async IPC paths may request the active path from the renderer via **`FA_PROJECT_FAILSAFE_IPC`** (**`electron-ipc-bridge.ts`**); the boot script registers **`faProjectFailsafeAPI.installActiveProjectPathReply`** with Pinia **`S_FaActiveProject`**. Replied paths are validated with **`pathLooksLikeFaProjectFile`** before open.
- **Session reset**: Main window session cleanup uses **`did-start-navigation`** with **`isMainFrame && !details.isSameDocument`** so spurious navigations do not drop the connection ( **`faMainWindowWebContentsSessionReset.ts`** ).

When adding new project-DB IPC handlers, wire them through the ensure layer and extend tests under **`src-electron/mainScripts/projectManagement/_tests/`** and **`registerFaProjectManagementIpc` Vitest** as needed.

## Evolution

- When replacing the stub, add a dedicated module under `src-electron/` (e.g. `mainScripts/db/` or `database/`) and keep `electron-main.ts` thin.
- Plan migrations and backup/export consistent with the product’s “worldbuilding database” model (see [fantasia-worldbuilding-domain](../fantasia-worldbuilding-domain/SKILL.md)).

## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
