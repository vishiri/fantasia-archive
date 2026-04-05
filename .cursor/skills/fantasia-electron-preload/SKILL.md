---
name: fantasia-electron-preload
description: >-
  Extends or fixes renderer-facing Electron APIs exposed through the preload
  script and contextBridge. Use when adding IPC-like surface area, typing
  window.faContentBridgeAPIs, editing src-electron/contentBridgeAPIs, or
  extending shared IPC channel names in electron-ipc-bridge.ts.
---

# Fantasia Archive — preload and content bridge

## Architecture

- In JSDoc and line comments under src-electron/, follow AGENTS.md code-comment rules (no Markdown emphasis in comments; use single quotes for inline references instead of grave accents).
- **Preload**: `src-electron/electron-preload.ts` builds `apiObject` and calls `contextBridge.exposeInMainWorld('faContentBridgeAPIs', apiObject)`.
- **Renderer access**: `window.faContentBridgeAPIs` — typed in `src/globals.d.ts`.
- **Implementations**: One module per API under `src-electron/contentBridgeAPIs/` (e.g. `faWindowControlAPI.ts`, `appDetailsAPI.ts`).

## Main ↔ preload IPC (electron-ipc-bridge)

- **Registry**: `src-electron/electron-ipc-bridge.ts` holds canonical channel strings (`export const` objects, e.g. `FA_DEVTOOLS_IPC`, `FA_USER_SETTINGS_IPC`). Preload-side code that uses `ipcRenderer.invoke` / `sendSync` and main-side `ipcMain.handle` / `on` must use these constants — never duplicate string literals across files.
- **Main registration**: Add or extend a `mainScripts/register*Ipc.ts` module that wires `ipcMain` with the same constants, and ensure startup invokes that registrar (today `startApp()` in `mainScripts/appManagement.ts` calls the existing registrars).
- **Preload usage**: Import the matching constant object in the relevant `contentBridgeAPIs/*.ts` module and pass those strings to `ipcRenderer`.

## Adding a new API surface

1. Define the contract in `types/I_<Name>.ts` (or extend an existing interface).
2. If the API talks to main over IPC, add channel names to `electron-ipc-bridge.ts`, implement `mainScripts/register*Ipc.ts` (or extend an existing registrar), and invoke it from app startup (today `startApp()` in `mainScripts/appManagement.ts`).
3. Implement functions in `src-electron/contentBridgeAPIs/<name>.ts` exporting a plain object matching that interface.
4. Import the implementation in `electron-preload.ts` and add it to `apiObject` with a stable key (camelCase, consistent with existing keys).
5. Extend `Window['faContentBridgeAPIs']` in `src/globals.d.ts` with the new key and interface.
6. Add Vitest coverage under `src-electron/contentBridgeAPIs/tests/` (and `mainScripts/tests/` for new IPC registrars) following existing `*.vitest.test.ts` patterns.

## Security and boundaries

- Prefer **narrow, explicit** methods on the bridge object over passing raw Node/Electron objects to the renderer.
- Do not enable broad `nodeIntegration` in the renderer to “just make it work”; keep privileged code in main or preload as appropriate.
- Some APIs use `@electron/remote` (e.g. `BrowserWindow` in `faWindowControlAPI`); when changing that pattern, consider security and testability implications.

## Related skills

- [fantasia-electron-main](../fantasia-electron-main/SKILL.md) for main-process lifecycle and windows.
- [fantasia-sqlite-main](../fantasia-sqlite-main/SKILL.md) for database access from main.

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
