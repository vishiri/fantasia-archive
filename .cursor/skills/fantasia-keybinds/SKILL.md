---
name: fantasia-keybinds
description: >-
  Global keyboard shortcuts (faKeybinds): renderer matching, Pinia store,
  main-process persistence over IPC, and Keybind settings UI. Use when adding
  or changing app-wide shortcuts, capture validation, or bridge APIs for
  keybind storage.
---

# Fantasia Archive — global keyboard shortcuts (faKeybinds)

## What exists today

- **App-wide shortcuts** run in the **renderer** on a **window** **keydown** listener (**capture** phase) so they can call existing dialog and app helpers without widening the preload surface beyond **`getKeybinds`** / **`setKeybinds`**.
- **Definitions**: `src/scripts/keybinds/faKeybindCommandDefinitions.ts` (**`FA_KEYBIND_COMMAND_DEFINITIONS`**) list each command’s **`id`**, optional **`defaultChord`**, **`editable`**, **`firesInEditableFields`**, and **`messageKey`** (i18n path for the settings table).
- **Dispatch**: `src/scripts/keybinds/faKeybindHandleKeydown.ts` builds the handler via **`createFaKeybindKeydownHandler(getFaKeybindKeydownContext)`**. Context comes from **`faKeybindKeydownContext.ts`**, which reads **`S_FaKeybinds`** (snapshot overrides, platform, **`suspendGlobalKeybindDispatch`**).
- **Actions**: `src/scripts/keybinds/faKeybindRunCommand.ts` maps **`T_faKeybindCommandId`** to behavior (open dialogs, toggle DevTools, etc.).
- **Layout wiring**: `src/layouts/MainLayout.vue` — after **`refreshKeybinds()`** in Electron, registers the listener; removes it on unmount. Skipped in **`isFantasiaStorybookCanvas()`** and non-Electron **`MODE`**.
- **Pinia**: `src/stores/S_FaKeybinds.ts` holds **`snapshot`**, **`suspendGlobalKeybindDispatch`**, **`refreshKeybinds`**, **`updateKeybinds`** (bridge **`invoke`**, success/error **`Notify`**).
- **Persistence (main)**: `src-electron/mainScripts/keybinds/` (**`faKeybindsStore.ts`**, defaults, patch schema). **`registerFaKeybindsIpc.ts`** wires **`ipcMain.handle`**; channel names live in **`src-electron/electron-ipc-bridge.ts`** (**`FA_KEYBINDS_IPC`**).
- **Preload**: `src-electron/contentBridgeAPIs/faKeybindsAPI.ts` exposes **`window.faContentBridgeAPIs.faKeybinds`**; shared shapes live in **`types/I_faKeybindsDomain.ts`** (command ids, chords, store root, snapshot, bridge **`I_faKeybindsAPI`**, capture helpers such as **`T_faKeybindTryChordFromEventResult`**).
- **Settings UI**: `src/components/dialogs/DialogKeybindSettings/` — table rows are built from **`FA_KEYBIND_COMMAND_DEFINITIONS`** (**`dialogKeybindSettingsTable.ts`**: **`buildDialogKeybindSettingsRows`**, columns, visual stubs, filtered table state). Capture flow and conflict checks live in **`dialogKeybindSettingsCapture*.ts`** modules; **`dialogKeybindSettingsDialogWiring.ts`** groups open/routing plus **`registerDialogKeybindSettingsGlobalSuspend`** (pauses dispatch while the main dialog or capture sheet is open).

## Adding a new global command (checklist)

1. **`types/I_faKeybindsDomain.ts`** — append the new **`id`** string to **`FA_KEYBIND_COMMAND_IDS`** and ensure the exported **`T_faKeybindCommandId`** union updates.
2. **`src/scripts/keybinds/faKeybindCommandDefinitions.ts`** — add one **`I_faKeybindCommandDefinition`** entry (**`defaultChord`**, **`editable`**, **`firesInEditableFields`**, **`id`**, **`messageKey`**). The table and capture UI pick this up automatically.
3. **`i18n/*/dialogs/L_dialogKeybindSettings.ts`** — add **`commands.<camelCaseId>`** under the existing **`commands`** object for each maintained locale (same key path as **`messageKey`**).
4. **`src/scripts/keybinds/faKeybindRunCommand.ts`** — branch on the new **`id`** and call the app action (prefer existing helpers such as **`openDialogComponent`**, stores, or small **`src/scripts/appInfo/`** modules).
5. **Tests** — extend **`faKeybindRunCommand`**, **`faKeybindHandleKeydown`**, command-definition, **`S_FaKeybinds`**, **`dialogKeybindSettingsTable`** / **`dialogKeybindSettingsModules.vitest.test`**, Electron **`faKeybindsStore`** / IPC / preload tests as needed so **`yarn testbatch:verify`** coverage stays green.

If the command needs **new persisted fields** or **schema** changes beyond **`overrides`**, extend **`src-electron/shared/`** Zod schemas and **`faKeybindsStore`** with the same discipline as user settings; keep **`electron-ipc-bridge`** and **`registerFaKeybindsIpc`** in sync.

## Related skills and rules

- [fantasia-electron-preload](../fantasia-electron-preload/SKILL.md) — **`faKeybindsAPI`** and **`globals.d.ts`**.
- [fantasia-electron-main](../fantasia-electron-main/SKILL.md) — **`registerFaKeybindsIpc`**, **`faKeybindsStore`**.
- [fantasia-quasar-vue](../fantasia-quasar-vue/SKILL.md) — **`MainLayout.vue`**, dialogs under **`src/components/dialogs/`**.
- [fantasia-i18n](../fantasia-i18n/SKILL.md) — **`L_dialogKeybindSettings`** command labels.

## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
