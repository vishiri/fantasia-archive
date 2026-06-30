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

- JSDoc/comments in **`src-electron/`**: AGENTS.md comment rules — no Markdown emphasis; single quotes for refs
- **Preload**: **`electron-preload.ts`** → **`contextBridge.exposeInMainWorld('faContentBridgeAPIs', apiObject)`**
- **Renderer**: **`window.faContentBridgeAPIs`** — **`src/globals.d.ts`**
- **Implementations**: **`contentBridgeAPIs/*.ts`** per API (window control, keybinds, project management, **`projectContentAPI`**, …)

## Main ↔ preload IPC (electron-ipc-bridge)

- **Async first**: **`ipcRenderer.invoke`** + **`ipcMain.handle`**. **`sendSync`** last resort only
- **Registry**: **`electron-ipc-bridge.ts`** — **`FA_*_IPC`** constants; never duplicate string literals
- **Main**: **`register*Ipc.ts`** wired from **`startApp()`**
- **Preload**: import constants in **`contentBridgeAPIs/*.ts`**

## Adding a new API surface

1. Contract in **`types/I_<Name>.ts`**
2. Channels in **`electron-ipc-bridge.ts`** + **`register*Ipc.ts`** + startup
3. Implement **`contentBridgeAPIs/<name>.ts`**
4. Add to **`apiObject`** in **`electron-preload.ts`**
5. Extend **`globals.d.ts`**
6. Vitest: **`contentBridgeAPIs/_tests/`**, **`ipcManagement/_tests/`** — **`yarn testbatch:verify`** enforces **95%** on **`src-electron`**

## Security and boundaries

- Narrow explicit methods — no raw Node/Electron objects to renderer
- No broad **`nodeIntegration`** in renderer
- Sandboxed preload → IPC to main for **`shell`**, paths, etc.
- Privileged calls via **`invoke`** — no **`@electron/remote`** without documented reason
- **No `neverthrow` in preload** — **`Promise`** chains; see [neverthrow.mdc](../../rules/neverthrow.mdc)
- Structured IPC args validated in **main** with Zod — [fantasia-electron-main](../fantasia-electron-main/SKILL.md)

## Related skills

- [fantasia-electron-main](../fantasia-electron-main/SKILL.md)
- [fantasia-keybinds](../fantasia-keybinds/SKILL.md)
- [fantasia-sqlite-main](../fantasia-sqlite-main/SKILL.md)

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
