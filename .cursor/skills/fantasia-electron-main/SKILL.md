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

- **Entry**: `src-electron/electron-main.ts` orchestrates startup in order: Chromium stderr filter (`chromiumFixes/suppressChromiumDevtoolsAutofillStderrNoise`), app name and `userData` (`appIdentity/fixAppName`), Windows DevTools workaround (`chromiumFixes/windowsDevToolsExtensionsFix`), `startApp` (all `ipcMain` registrars — DevTools, extra-env snapshot for sandboxed preload, external links / `shell.openExternal`, user settings, window chrome, app metadata), `nativeShell/tweaks` menu removal, then `openAppWindowManager` / `closeAppManager` from `appManagement.ts`. `startApp()` must run **before** any `BrowserWindow` is created so **`ipcMain.handle`** channels used from preload exist before the renderer loads.
- **IPC style (async first)**: Prefer **`ipcMain.handle`** with **`ipcRenderer.invoke`** for preload-facing channels whenever the flow can be async. **`ipcRenderer.sendSync`** / blocking one-way IPC is **not forbidden** but is a **last resort** — avoid it if any remotely reasonable async design exists; document exceptions with a short comment near the handler or in review.
- **`userData`**: `fixAppName()` in `appIdentity/fixAppName.ts` sets `app.setPath('userData', …)`. When `process.env.TEST_ENV` is `components` or `e2e`, `userData` is **`%APPDATA%/<package.json name>/playwright-user-data`** (stable; not under the `*-dev` folder used by `quasar dev` with `DEBUGGING`). The folder segment is `PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME` in `appIdentity/playwrightIsolatedUserDataDirName.ts` (re-exported from `fixAppName.ts` for Electron callers).
- **Modular logic**: Prefer `src-electron/mainScripts/` feature folders — `appIdentity/`, `windowManagement/`, `chromiumFixes/`, `userSettings/`, `nativeShell/`, `ipcManagement/` — plus root `appManagement.ts`, over growing `electron-main.ts` indefinitely.
- **IPC registration**: Shared channel strings live in `src-electron/electron-ipc-bridge.ts`. Main-process `ipcMain` handlers for preload-invoked channels belong in `mainScripts/ipcManagement/register*Ipc.ts` (e.g. `registerFaDevToolsIpc.ts`, `registerFaExtraEnvIpc.ts`, `registerFaExternalLinksIpc.ts`, `registerFaUserSettingsIpc.ts`, `registerFaWindowControlIpc.ts`, `registerFaAppDetailsIpc.ts`, `registerFaKeybindsIpc.ts` for **`FA_KEYBINDS_IPC`** and `mainScripts/keybinds/faKeybindsStore.ts`, `registerFaProjectManagementIpc.ts` for **`FA_PROJECT_MANAGEMENT_IPC`** and **`mainScripts/projectManagement/`** — **`.faproject`** creation and DB lifecycle). Call those registrars from app startup (`startApp()` in `appManagement.ts` today) so preload and main always use the same names.

## IPC payload validation (Zod)

- **`ipcMain.handle` arguments are untrusted at runtime** even when preload and `types/` use correct TypeScript shapes. Anything the renderer can reach (including after a future XSS) may call the bridge with arbitrary structured-clone values.
- **Objects and patches**: Define a Zod schema in **`src-electron/shared/`** (Electron-free, no `import` from `electron`) and parse with **`.parse()`** or **`.safeParse()`** in the registrar before merging into stores or calling privileged APIs. Reference: **`faUserSettingsPatchSchema.ts`** — builds a **`.strict()`** object from **`FA_USER_SETTINGS_DEFAULTS`** keys so unknown keys fail and allowed keys stay aligned with **`cleanupFaUserSettings`**. Export a small **`parse…`** helper that rejects non–plain objects if you want clearer errors than Zod’s defaults for `null`/arrays.
- **Throw on invalid input** so `ipcRenderer.invoke` rejects; document or handle failures in the renderer (for example Pinia **`try/catch`** around **`setSettings`**).
- **Single primitive channels** (one URL string, one flag): **`typeof`** plus an existing predicate (e.g. **`checkIfExternalUrl`** in **`registerFaExternalLinksIpc`**) is fine; optional **`z.string().refine(...)`** only if it improves readability or shared error formatting.
- **Not renderer IPC**: **`registerFaExtraEnvIpc`** builds **`COMPONENT_PROPS`** from **`process.env`** via **`JSON.parse`** — that is harness/env trust, not preload IPC; Zod there would harden env-driven shapes but is a separate decision from channel handlers.
- **Dependency**: **`zod`** is listed under **`package.json`** **`dependencies`** so production main bundles resolve it.
- Add Vitest coverage for the schema module under **`src-electron/shared/_tests/`** and extend **`register*Ipc`** tests so invalid payloads do not call **`store.set`** (or equivalent).

### When Zod is not replacing existing code (repo scan)

- **`registerFaExternalLinksIpc`**: one **`string`** argument plus **`checkIfExternalUrl`** — no structured object; switching to Zod would be **`z.string()`** plus **`refine`** duplicating the same predicate without simplifying the flow.
- **`registerFaWindowControlIpc`**, **`registerFaAppDetailsIpc`**, **`registerFaDevToolsIpc`**: async **`handle`** / **`invoke`** channels with no structured payload from the renderer beyond implicit sender context (resolve the owning window from **`event.sender`**).
- **`registerFaExtraEnvIpc`**: snapshot is built from **`process.env`** in main, not from renderer IPC; **`parseComponentProps`** uses **`JSON.parse`** on **`COMPONENT_PROPS`** — optional future Zod there would harden harness/env JSON, not the preload IPC boundary.
- Future **DB or bulk APIs** over **`invoke`**: prefer Zod (or the same pattern as **`faUserSettingsPatchSchema`**) from the start.

## Testing

- Vitest tests live under `src-electron/mainScripts/_tests/` (e.g. `appManagement`), each `mainScripts/<area>/_tests/` (`appIdentity`, `windowManagement`, `chromiumFixes`, `userSettings`, `nativeShell`, `ipcManagement`), and `src-electron/contentBridgeAPIs/_tests/` for bridge modules.
- After main-process changes, run the **quality gate** when TypeScript or related sources changed: `yarn testbatch:verify` ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)) — see [eslint-typescript.mdc](../../rules/eslint-typescript.mdc).

## Renderer sandbox

- The main `BrowserWindow` in `windowManagement/mainWindowCreation.ts` uses `webPreferences.sandbox: true`, `contextIsolation: true`, and explicit `nodeIntegration: false` (Electron disables the sandbox if `nodeIntegration` is true for that window). Preload must not import arbitrary Node modules; privileged work uses main + IPC — see `registerFaExtraEnvIpc.ts` (harness snapshot, paths) and `registerFaExternalLinksIpc.ts` (`shell.openExternal`). Official overview: Electron [Process Sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox).

## Window chrome IPC

- Frameless window controls and read-only app version from main use **`ipcMain.handle`** in **`registerFaWindowControlIpc.ts`** and **`registerFaAppDetailsIpc.ts`**; preload uses **`ipcRenderer.invoke`** with channels from **`electron-ipc-bridge.ts`**. Handlers resolve **`BrowserWindow`** via **`BrowserWindow.fromWebContents(event.sender)`** so the correct window is targeted when focus moves to native menus.
- **Preload path** (`windowManagement/mainWindowCreation.ts`): Resolve `electron-preload` and the window icon with `path.resolve(currentDir, …)` where `currentDir` is `dirname(fileURLToPath(import.meta.url))` for the **bundled main-process chunk** (Quasar emits one main bundle; nested source folders like `windowManagement/` do not appear in that path). Do **not** add an extra parent `..` assuming `currentDir` is a subfolder of `mainScripts/` — that breaks preload loading, skips `contextBridge`, and leaves `window.faContentBridgeAPIs` undefined (component tests fall back to `/` instead of `/componentTesting/...`).

## Keybind persistence (`mainScripts/keybinds/`)

- Global shortcut **overrides** persist in main (**`faKeybindsStore.ts`**, defaults, Zod patch schema under **`src-electron/shared/`**). **`registerFaKeybindsIpc.ts`** validates patches and reads/writes the store; preload **`faKeybindsAPI`** is the renderer entry. Adding commands or changing stored shapes: see [fantasia-keybinds](../fantasia-keybinds/SKILL.md).

## SQLite and files

- Database experiments and temp paths currently use `app.getPath('userData')` and `_faProjectTemp/` (see `electron-main.ts`). For full DB design, follow [fantasia-sqlite-main](../fantasia-sqlite-main/SKILL.md).

## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
