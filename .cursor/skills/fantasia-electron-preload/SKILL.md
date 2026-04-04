---
name: fantasia-electron-preload
description: >-
  Extends or fixes renderer-facing Electron APIs exposed through the preload
  script and contextBridge. Use when adding IPC-like surface area, typing
  window.faContentBridgeAPIs, or editing files under src-electron/
  contentBridgeAPIs.
---

# Fantasia Archive — preload and content bridge

## Architecture

- In JSDoc and line comments under src-electron/, follow AGENTS.md code-comment rules (no Markdown emphasis in comments; use single quotes for inline references instead of grave accents).
- **Preload**: `src-electron/electron-preload.ts` builds `apiObject` and calls `contextBridge.exposeInMainWorld('faContentBridgeAPIs', apiObject)`.
- **Renderer access**: `window.faContentBridgeAPIs` — typed in `src/globals.d.ts`.
- **Implementations**: One module per API under `src-electron/contentBridgeAPIs/` (e.g. `faWindowControlAPI.ts`, `appDetailsAPI.ts`).

## Adding a new API surface

1. Define the contract in `types/I_<Name>.ts` (or extend an existing interface).
2. Implement functions in `src-electron/contentBridgeAPIs/<name>.ts` exporting a plain object matching that interface.
3. Import the implementation in `electron-preload.ts` and add it to `apiObject` with a stable key (camelCase, consistent with existing keys).
4. Extend `Window['faContentBridgeAPIs']` in `src/globals.d.ts` with the new key and interface.
5. Add Vitest coverage under `src-electron/contentBridgeAPIs/tests/` following existing `*.vitest.test.ts` patterns.

## Security and boundaries

- Prefer **narrow, explicit** methods on the bridge object over passing raw Node/Electron objects to the renderer.
- Do not enable broad `nodeIntegration` in the renderer to “just make it work”; keep privileged code in main or preload as appropriate.
- Some APIs use `@electron/remote` (e.g. `BrowserWindow` in `faWindowControlAPI`); when changing that pattern, consider security and testability implications.

## Related skills

- [fantasia-electron-main](../fantasia-electron-main/SKILL.md) for main-process lifecycle and windows.
- [fantasia-sqlite-main](../fantasia-sqlite-main/SKILL.md) for database access from main.
