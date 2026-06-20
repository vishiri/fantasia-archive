---
name: fantasia-action-manager
description: >-
  Centralized renderer action manager: registry, sync FIFO queue, fire-and-forget
  async dispatch, unified error reporting (single console row + single toast),
  session-only action history, and the DialogActionMonitor surface. Use when
  adding or migrating user-meaningful UI actions, when a save/dialog needs
  consistent failure surfacing, or when working on the in-app action monitor.
---

# Fantasia Archive — action manager (faActionManager)

## What exists today

- **Registry**: **`types/I_faActionManagerDomain.ts`** (**`FA_ACTION_IDS`**, **`T_faActionId`**, **`I_faActionPayloadMap`**)
- **Definitions**: **`faActionDefinitions.ts`** + handlers **`faActionDefinitionHandlers.ts`**; lookup **`findFaActionDefinition`**
- **Run APIs**: **`faActionManagerRun.ts`** — **`runFaAction`** (fire-and-forget), **`runFaActionAwait`** → **`boolean`**
- **Sync queue**: **`faActionManagerSyncQueue.ts`** — FIFO, **`FA_ACTION_SYNC_TIMEOUT_MS = 30_000`**, max **32**, opt-in **`dedup`**, **`awaitSyncQueueDrain()`**
- **Async**: immediate dispatch; tracked in **`S_FaActionManager.inFlightAsyncActions`**
- **Error reporting**: **`faActionManagerErrorReporting_manager.ts`** — **one** **`console.error`** + **one** **`Notify.create`** per failure via **`reportFaActionFailure`**
- **History**: **`faActionManagerHistory.ts`** — session ring (**`FA_ACTION_HISTORY_MAX = 500`**), **`snapshotActionHistory()`**
- **Store**: **`S_FaActionManager.ts`** — mirrors runtime state; orchestration in **`actionManager/`** scripts
- **Bridge**: **`faActionManagerStoreBridge.ts`** — **`resolveFaActionManagerStore()`** boot/test safe
- **DialogActionMonitor**: **`src/components/dialogs/DialogActionMonitor/`** — snapshot on **`@show`**; story **`tags: ['skip-visual']`**
- **Menu**: **Help / Info → Action Monitor** → **`runFaAction('openActionMonitorDialog')`**

## Single-toast rule

Action manager = **only** error toasts for registered actions. Handlers **throw** or return **`false`**; stores **must not** emit duplicate negative **`Notify`**. Success toasts may stay in store when user-relevant.

**`saveProjectSettings`**: project name + optional worlds snapshot via **`faProjectWorldsPersistSnapshotFromDialog`**.

## Migrated call sites (today)

- **Async**: dev tools, settings dialogs, markdown docs, saves, window chrome, language, Action Monitor, …
- **Sync**: close app, refresh after language change
- **Keybinds**: **`faKeybindRunCommand.ts`** → **`FA_KEYBIND_COMMAND_TO_ACTION_ID`** → **`runFaAction`**

## Adding a new action (checklist)

1. **`types/I_faActionManagerDomain.ts`** — append id + payload map entry
2. **`faActionDefinitionHandlers.ts`** + row in **`faActionDefinitions.ts`** (**`kind`**, optional **`dedup`**)
3. Call sites → **`runFaAction`** / **`runFaActionAwait`**
4. i18n: reuse **`globalFunctionality.faActionManager.actionFailed`** template
5. Tests: **`src/scripts/actionManager/_tests/`** + call site tests; keybind routes → **`faKeybindRunCommand`** tests
6. Strip duplicate negative **`Notify`** from handlers/stores

## File map

- **Domain**: **`types/I_faActionManagerDomain.ts`**
- **Manager**: **`src/scripts/actionManager/`** (definitions, run, queue, error reporting, history, store bridge)
- **Store**: **`src/stores/S_FaActionManager.ts`**
- **Monitor UI**: **`DialogActionMonitor/`**
- **Menu**: **`AppControlMenus/_data/helpInfo.ts`**
- **Keybinds**: **`faKeybindRunCommand.ts`**
- **i18n**: **`L_faActionManager.ts`**, **`L_DialogActionMonitor.ts`**

## Tests

Key suites: **`faActionDefinitions`**, **`faActionManagerRun`**, **`faActionManagerSyncQueue`**, **`faActionManagerHistory`**, **`faActionManagerErrorReporting*`**, **`faActionManagerStoreBridge`**, migrated call sites, **`DialogActionMonitor`** Vitest/Playwright, **`checkActionMonitor.playwright.spec.ts`**

## Related

- [fa-action-manager.mdc](../../rules/fa-action-manager.mdc)
- [fantasia-keybinds](../fantasia-keybinds/SKILL.md), [fantasia-quasar-vue](../fantasia-quasar-vue/SKILL.md), [fantasia-testing](../fantasia-testing/SKILL.md)

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
