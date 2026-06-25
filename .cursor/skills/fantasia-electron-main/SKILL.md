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

- **Entry**: **`electron-main.ts`** — Chromium stderr filter, app name/`userData`, Windows DevTools workaround, **`startApp`** (all IPC registrars), native shell menu, **`openAppWindowManager`**. **`startApp()`** before any **`BrowserWindow`** so preload channels exist before renderer load.
- **IPC style**: prefer **`ipcMain.handle`** + **`ipcRenderer.invoke`**. **`sendSync`** last resort only — document exceptions.
- **`userData`**: **`fixAppName()`** in **`appIdentity_manager.ts`**. **`TEST_ENV`** **`components`**/**`e2e`** → **`playwright-user-data`** via **`playwrightIsolatedUserDataDirName.ts`**
- **Modules**: **`src-electron/mainScripts/`** feature folders over growing **`electron-main.ts`**
- **IPC registration**: channel strings **`electron-ipc-bridge.ts`**; handlers **`ipcManagement/register*Ipc.ts`**; **`registerAllFaIpc()`** from **`ipcManagement_manager.ts`**

## IPC payload validation (Zod)

**`ipcMain.handle` args untrusted at runtime** — validate in main before stores/privileged APIs.

- Objects/patches: Zod schema in **`src-electron/shared/`** — reference **`faUserSettingsPatchSchema.ts`**
- Throw on invalid → **`invoke`** rejects; renderer handles
- Single primitives: **`typeof`** + predicate OK (e.g. **`checkIfExternalUrl`**)
- **`registerFaExtraEnvIpc`**: env/harness trust, not preload IPC
- **`zod`** in **`package.json`** **`dependencies`**
- Vitest: **`shared/_tests/`** + registrar tests for invalid payloads

### When Zod not replacing existing code

- External links: one string + URL check
- Window control, app details, devtools: no structured renderer payload
- Future bulk DB APIs: Zod from start

## Testing

- Vitest: **`mainScripts/_tests/`**, per-area **`_tests/`**, **`contentBridgeAPIs/_tests/`**
- After main changes: **`yarn testbatch:verify`** when TS/sources touched

## Renderer sandbox

- **`webPreferences`**: **`sandbox: true`**, **`contextIsolation: true`**, **`nodeIntegration: false`**. Preload → main IPC for privileged work. [Electron Process Sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox)

## Window chrome IPC

- **`registerFaWindowControlIpc`**, **`registerFaAppDetailsIpc`** — **`BrowserWindow.fromWebContents(event.sender)`**
- **Preload path**: **`path.resolve(currentDir, …)`** from bundled main chunk — no extra **`..`** assuming subfolder of **`mainScripts/`**

## Security hardening (main)

- **`app://`** — **`registerFaAppProtocolWiring`**: host allowlist + **`path.relative`** guard against traversal outside app root.
- **IPC sender** — invoke handlers validate **`event.sender.id`** matches registered main window (failsafe path reply, OS-open, packaged DevTools no-op).
- **Navigation** — **`will-navigate`** + **`setWindowOpenHandler`** allowlist on main **`BrowserWindow`** (**`mainWindowCreationWiring.ts`**).
- **`openExternal`** — **`faExternalUrlPredicate`**: block RFC1918 + link-local targets.
- **Project paths** — **`createResolveHardenedFaProjectFilePath`** (**`functions/`**) + **`faProjectFilePathHardeningWiring.ts`** before open/reconnect; packaged builds omit dev **`ELECTRON_MAIN_FILEPATH`** leak.

## Keybind persistence

**`mainScripts/keybinds/`** — overrides, Zod patch, **`registerFaKeybindsIpc`**. See [fantasia-keybinds](../fantasia-keybinds/SKILL.md).

## SQLite and files

- **`.faproject`**: [docs/database/projectDB.md](../../../docs/database/projectDB.md)
- App JSON: **`electron-store`** — [appUserDataKv.md](../../../docs/database/appUserDataKv.md)
- [fantasia-sqlite-main](../fantasia-sqlite-main/SKILL.md)

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
