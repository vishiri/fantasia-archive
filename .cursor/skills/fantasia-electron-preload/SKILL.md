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
- **Implementations**: One module per API under `src-electron/contentBridgeAPIs/` (e.g. `faWindowControlAPI.ts`, `appDetailsAPI.ts`, `faKeybindsAPI.ts` for persisted shortcut overrides via **`FA_KEYBINDS_IPC`**).

## Main ↔ preload IPC (electron-ipc-bridge)

- **Async first**: Prefer **`ipcRenderer.invoke`** with **`ipcMain.handle`** and Promise-returning methods on `faContentBridgeAPIs`. **Synchronous** **`ipcRenderer.sendSync`** (or other blocking IPC) is **not forbidden** but is a **last resort** — use only when there is no remotely reasonable async alternative; note the exception in a short comment or PR review.
- **Registry**: `src-electron/electron-ipc-bridge.ts` holds canonical channel strings (`export const` objects, e.g. `FA_DEVTOOLS_IPC`, `FA_USER_SETTINGS_IPC`, `FA_WINDOW_CONTROL_IPC`, `FA_APP_DETAILS_IPC`, `FA_EXTRA_ENV_IPC`). Preload-side code that uses `ipcRenderer.invoke` and main-side `ipcMain.handle` must use these constants — never duplicate string literals across files.
- **Main registration**: Add or extend a `mainScripts/ipcManagement/register*Ipc.ts` module that wires `ipcMain.handle` with the same constants, and ensure startup invokes that registrar (today `startApp()` in `mainScripts/appManagement.ts` calls the existing registrars).
- **Preload usage**: Import the matching constant object in the relevant `contentBridgeAPIs/*.ts` module and pass those strings to `ipcRenderer.invoke`.

## Adding a new API surface

1. Define the contract in `types/I_<Name>.ts` (or extend an existing interface).
2. If the API talks to main over IPC, add channel names to `electron-ipc-bridge.ts`, implement `mainScripts/ipcManagement/register*Ipc.ts` (or extend an existing registrar), and invoke it from app startup (today `startApp()` in `mainScripts/appManagement.ts`).
3. Implement functions in `src-electron/contentBridgeAPIs/<name>.ts` exporting a plain object matching that interface.
4. Import the implementation in `electron-preload.ts` and add it to `apiObject` with a stable key (camelCase, consistent with existing keys).
5. Extend `Window['faContentBridgeAPIs']` in `src/globals.d.ts` with the new key and interface.
6. Add Vitest coverage under `src-electron/contentBridgeAPIs/_tests/` (and `mainScripts/ipcManagement/_tests/` for new IPC registrars) following existing `*.vitest.test.ts` patterns. **`yarn testbatch:verify`** enforces **100%** v8 coverage on **`src-electron`** ([vitest-tests.mdc](../../rules/vitest-tests.mdc), [vitest/vitest.electron.config.mts](../../../vitest/vitest.electron.config.mts)).

## Security and boundaries

- Prefer **narrow, explicit** methods on the bridge object over passing raw Node/Electron objects to the renderer.
- Do not enable broad `nodeIntegration` in the renderer to “just make it work”; keep privileged code in main or preload as appropriate.
- Sandboxed preload cannot rely on arbitrary Node modules or `electron` APIs such as `shell`; use IPC to main (`registerFaExtraEnvIpc`, `registerFaExternalLinksIpc`, `registerFaWindowControlIpc`, `registerFaDevToolsIpc`, `registerFaAppDetailsIpc`, and similar) instead of importing packages like `app-root-path` in `contentBridgeAPIs/`.
- Privileged window and app-metadata calls go through async `ipcRenderer.invoke` (`faWindowControlAPI`, `faDevToolsControlAPI`, `appDetailsAPI.getProjectVersion`, `extraEnvVariablesAPI.getSnapshot` with memoized promises for one round trip per load); do not reintroduce `@electron/remote` without a documented reason.
- **Structured IPC arguments** must be validated in **main** (not only typed in preload). Use **Zod** in `src-electron/shared/` and wire parsing in `register*Ipc.ts` — see [fantasia-electron-main](../fantasia-electron-main/SKILL.md) **IPC payload validation (Zod)** and `faUserSettingsPatchSchema.ts` / `registerFaUserSettingsIpc.ts`.

## Related skills

- [fantasia-electron-main](../fantasia-electron-main/SKILL.md) for main-process lifecycle and windows.
- [fantasia-keybinds](../fantasia-keybinds/SKILL.md) for global renderer shortcuts, **`S_FaKeybinds`**, and **`faKeybinds`** persistence over IPC.
- [fantasia-sqlite-main](../fantasia-sqlite-main/SKILL.md) for database access from main.

## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
