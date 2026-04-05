---
name: fantasia-sqlite-main
description: >-
  Designs SQLite usage in Fantasia Archive’s Electron main process: file
  locations under userData, native better-sqlite3 module constraints, and migrations.
  Use when editing electron-main database code, schema, or persistence paths.
---

# Fantasia Archive — SQLite in main process

## Current state

- **`better-sqlite3`** is a native Node dependency; access belongs in the **main process** (see stub and comments in `src-electron/electron-main.ts`).
- Temp / prototype DB path pattern: `app.getPath('userData')` + `_faProjectTemp/` + database file (e.g. `.fae` extension in current experiments).

## Principles

1. **Never open arbitrary SQL from the renderer** — expose narrow, validated operations via preload APIs if the UI needs data. If those APIs use main-process IPC, add channel names to `electron-ipc-bridge.ts` and register handlers in `mainScripts/register*Ipc.ts` (see [fantasia-electron-preload](../fantasia-electron-preload/SKILL.md)).
2. **Paths**: Use `app.getPath('userData')` (or other `app.getPath` variants) for per-user storage; create directories before opening the DB.
3. **Native builds**: `better-sqlite3` must compile for the Electron/Node ABI used by the packaged app; verify `yarn quasar:build:electron` and packaged runs after upgrades.
4. **Lifecycle**: Open/close or pool connections deliberately; avoid leaking handles on window reload during dev.

## Evolution

- When replacing the stub, add a dedicated module under `src-electron/` (e.g. `mainScripts/db/` or `database/`) and keep `electron-main.ts` thin.
- Plan migrations and backup/export consistent with the product’s “worldbuilding database” model (see [fantasia-worldbuilding-domain](../fantasia-worldbuilding-domain/SKILL.md)).

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
