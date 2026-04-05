---
name: fantasia-electron-main
description: >-
  Works on Fantasia Archive Electron main process: app lifecycle, window
  management, platform tweaks, native integrations, and ipcMain registration
  (register*Ipc + electron-ipc-bridge channel names). Use when editing
  electron-main.ts, src-electron/mainScripts/, or main-side tests.
---

# Fantasia Archive — Electron main process

## Entry and flow

- **Entry**: `src-electron/electron-main.ts` orchestrates startup: `fixAppName`, Windows DevTools tweaks, `startApp`, menu tweaks, `openAppWindowManager`, `closeAppManager`.
- **Modular logic**: Prefer `src-electron/mainScripts/` (e.g. `appManagement.ts`, `mainWindowCreation.ts`, `tweaks.ts`, `fixAppName.ts`) over growing `electron-main.ts` indefinitely.
- **IPC registration**: Shared channel strings live in `src-electron/electron-ipc-bridge.ts`. Main-process `ipcMain` handlers for preload-invoked channels belong in `mainScripts/register*Ipc.ts` (e.g. `registerFaDevToolsIpc.ts`, `registerFaUserSettingsIpc.ts`). Call those registrars from app startup (`startApp()` in `appManagement.ts` today) so preload and main always use the same names.

## Testing

- Vitest tests live under `src-electron/mainScripts/tests/` and `src-electron/contentBridgeAPIs/tests/` for bridge modules.
- After main-process changes, run the **quality gate** when TypeScript or related sources changed: `yarn testbatch:verify` ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)) — see [eslint-typescript.mdc](../../rules/eslint-typescript.mdc).

## Remote and windows

- `@electron/remote` is a dependency; bridge APIs may use it from preload-side modules. When refactoring window control, keep renderer exposure minimal and typed.

## SQLite and files

- Database experiments and temp paths currently use `app.getPath('userData')` and `_faProjectTemp/` (see `electron-main.ts`). For full DB design, follow [fantasia-sqlite-main](../fantasia-sqlite-main/SKILL.md).

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
