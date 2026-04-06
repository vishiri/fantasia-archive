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

- **Entry**: `src-electron/electron-main.ts` orchestrates startup in order: Chromium stderr filter (`chromiumFixes/suppressChromiumDevtoolsAutofillStderrNoise`), app name and `userData` (`appIdentity/fixAppName`), Windows DevTools workaround (`chromiumFixes/windowsDevToolsExtensionsFix`), `startApp` (IPC + `@electron/remote` init), `nativeShell/tweaks` menu removal, then `openAppWindowManager` / `closeAppManager` from `appManagement.ts`.
- **`userData`**: `fixAppName()` in `appIdentity/fixAppName.ts` sets `app.setPath('userData', …)`. When `process.env.TEST_ENV` is `components` or `e2e`, `userData` is **`%APPDATA%/<package.json name>/playwright-user-data`** (stable; not under the `*-dev` folder used by `quasar dev` with `DEBUGGING`). The folder segment is `PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME` in `appIdentity/playwrightIsolatedUserDataDirName.ts` (re-exported from `fixAppName.ts` for Electron callers).
- **Modular logic**: Prefer `src-electron/mainScripts/` feature folders — `appIdentity/`, `windowManagement/`, `chromiumFixes/`, `userSettings/`, `nativeShell/`, `ipcManagement/` — plus root `appManagement.ts`, over growing `electron-main.ts` indefinitely.
- **IPC registration**: Shared channel strings live in `src-electron/electron-ipc-bridge.ts`. Main-process `ipcMain` handlers for preload-invoked channels belong in `mainScripts/ipcManagement/register*Ipc.ts` (e.g. `registerFaDevToolsIpc.ts`, `registerFaUserSettingsIpc.ts`). Call those registrars from app startup (`startApp()` in `appManagement.ts` today) so preload and main always use the same names.

## Testing

- Vitest tests live under `src-electron/mainScripts/tests/` (e.g. `appManagement`), each `mainScripts/<area>/tests/` (`appIdentity`, `windowManagement`, `chromiumFixes`, `userSettings`, `nativeShell`, `ipcManagement`), and `src-electron/contentBridgeAPIs/tests/` for bridge modules.
- After main-process changes, run the **quality gate** when TypeScript or related sources changed: `yarn testbatch:verify` ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)) — see [eslint-typescript.mdc](../../rules/eslint-typescript.mdc).

## Remote and windows

- `@electron/remote` is a dependency; bridge APIs may use it from preload-side modules. When refactoring window control, keep renderer exposure minimal and typed.
- **Preload path** (`windowManagement/mainWindowCreation.ts`): Resolve `electron-preload` and the window icon with `path.resolve(currentDir, …)` where `currentDir` is `dirname(fileURLToPath(import.meta.url))` for the **bundled main-process chunk** (Quasar emits one main bundle; nested source folders like `windowManagement/` do not appear in that path). Do **not** add an extra parent `..` assuming `currentDir` is a subfolder of `mainScripts/` — that breaks preload loading, skips `contextBridge`, and leaves `window.faContentBridgeAPIs` undefined (component tests fall back to `/` instead of `/componentTesting/...`).

## SQLite and files

- Database experiments and temp paths currently use `app.getPath('userData')` and `_faProjectTemp/` (see `electron-main.ts`). For full DB design, follow [fantasia-sqlite-main](../fantasia-sqlite-main/SKILL.md).

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
