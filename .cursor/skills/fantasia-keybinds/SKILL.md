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

- **Renderer** **`keydown`** listener (capture) — calls dialog/app helpers without widening preload beyond **`getKeybinds`** / **`setKeybinds`**
- **Definitions**: **`faKeybindCommandDefinitions.ts`** (**`FA_KEYBIND_COMMAND_DEFINITIONS`**)
- **Chord logic**: **`faKeybindsChordFromEvent.ts`**, **`faKeybindsChordEqualityAndResolve.ts`**, **`faKeybindsChordDisplayAndConflict.ts`**
- **UI formatting**: **`faKeybindsChordUiFormatting.ts`** — settings, menus, shortcut copy
- **Dispatch**: **`faKeybindsGlobalDispatch.ts`** → **`faKeybindRunCommand.ts`** → **`runFaAction`** via **`FA_KEYBIND_COMMAND_TO_ACTION_ID`** ([fantasia-action-manager](../fantasia-action-manager/SKILL.md))
- **Layout**: **`MainLayout.vue`** registers after **`refreshKeybinds()`**; skipped in Storybook canvas + non-Electron
- **Chromium Ctrl+Shift suppress**: main **`registerFaChromiumCtrlShiftShortcutSuppress`** + global forward; boot **`faChromiumForwardedKeyChord`**
- **Pinia**: **`S_FaKeybinds.ts`**
- **Persistence**: **`src-electron/mainScripts/keybinds/`**; **`registerFaKeybindsIpc.ts`**; **`FA_KEYBINDS_IPC`**
- **Preload**: **`faKeybindsAPI.ts`**; types **`types/I_faKeybindsDomain.ts`**
- **Settings UI**: **`DialogKeybindSettings/`** — table from definitions; capture in **`dialogKeybindSettingsCapture*.ts`**
- **Shipped**: **`openProjectSettings`** → **`openProjectSettingsDialog`** when active project

## `src/scripts/keybinds/` — avoid fragmentation

Few domain modules: chord parse, equality/resolve, display/conflict, dispatch wiring. **`faKeybindRunCommand.ts`** stays thin for **`vi.mock`** seam — [typescript-scripts.mdc](../../rules/typescript-scripts.mdc).

## Adding a new global command (checklist)

1. **`types/I_faKeybindsDomain.ts`** — append **`FA_KEYBIND_COMMAND_IDS`**
2. **`faKeybindCommandDefinitions.ts`** — one definition row
3. **`i18n/*/dialogs/L_dialogKeybindSettings.ts`** — **`commands.<camelCaseId>`**
4. **`faKeybindRunCommand.ts`** — **`FA_KEYBIND_COMMAND_TO_ACTION_ID`** row; register action in **`faActionDefinitions.ts`**
5. Tests — run command, dispatch integration, definitions, store, dialog, Electron IPC/preload

Persisted schema changes → Zod in **`src-electron/shared/`** + **`keybinds_manager`** + bridge sync.

## Playwright (`keyboard.press`)

Use **`faPlaywrightKeyboardChords.ts`** — primary vs literal Control per **`faKeybindExpandDefaultChord`**. Docs: [playwright-tests.mdc](../../rules/playwright-tests.mdc), [fantasia-testing](../fantasia-testing/SKILL.md).

## Related

- [fantasia-action-manager](../fantasia-action-manager/SKILL.md), [fantasia-electron-preload](../fantasia-electron-preload/SKILL.md), [fantasia-electron-main](../fantasia-electron-main/SKILL.md), [fantasia-quasar-vue](../fantasia-quasar-vue/SKILL.md), [fantasia-i18n](../fantasia-i18n/SKILL.md)

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
