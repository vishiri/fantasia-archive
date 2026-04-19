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

- **Action registry** lives in **`types/I_faActionManagerDomain.ts`** (**`FA_ACTION_IDS`**, **`T_faActionId`**, **`I_faActionPayloadMap`**). Each id is paired with a payload type (or **`void`**) so the compiler enforces matching call sites.
- **Definitions** in **`src/scripts/actionManager/faActionDefinitions.ts`** (**`FA_ACTION_DEFINITIONS`**) bind each id to a **`kind`** (**`async`** / **`sync`**), an optional **`dedup: true`** hint, and a **`handler`** reference. **Handler bodies** live in **`faActionDefinitionHandlers.ts`**. **`findFaActionDefinition`** is the lookup used by the run + sync-queue modules.
- **Run APIs** in **`src/scripts/actionManager/faActionManagerRun.ts`**:
  - **`runFaAction(id, payload)`** — fire-and-forget; the call site never sees an error.
  - **`runFaActionAwait(id, payload): Promise<boolean>`** — same dispatch, returns **`true`** on success, **`false`** on failure (toast + console row are still emitted).
- **Sync queue** in **`src/scripts/actionManager/faActionManagerSyncQueue.ts`** — single FIFO **`pendingSyncQueue`** in **`S_FaActionManager`**, one runner at a time, **`FA_ACTION_SYNC_TIMEOUT_MS = 30_000`** per action, **`FA_ACTION_SYNC_QUEUE_MAX = 32`** soft cap (overflow drops emit a toast and a synthetic **`failed`** history row), opt-in **`dedup`** drops duplicate enqueues. **`awaitSyncQueueDrain()`** resolves once the queue is empty.
- **Async dispatch** runs immediately and tracks the entry through **`S_FaActionManager.inFlightAsyncActions`** until the handler resolves or rejects.
- **Unified error reporting** in **`src/scripts/actionManager/faActionManagerErrorReporting.ts`**: **`reportFaActionFailure`** emits exactly **one** **`console.error`** + **one** **`Notify.create`** with **`type: 'negative'`** per failure and writes the failure record to **`S_FaActionManager.lastFailure`**. Helpers: **`buildFaActionPayloadPreview`** (safe, truncated stringify) and **`normalizeFaActionError`** (Error / string / unknown → structured shape).
- **History** in **`src/scripts/actionManager/faActionManagerHistory.ts`** — session-only ring buffer (cap **`FA_ACTION_HISTORY_MAX = 500`** in **`S_FaActionManager`**) with helpers **`recordHistoryEnqueued`**, **`recordHistoryStarted`** / **`recordHistoryStartedFromEntry`**, **`recordHistoryCompleted`**, **`recordHistoryOverflowDrop`**, and **`snapshotActionHistory()`** (deep-cloned, sorted descending by **`enqueuedAt`**, newest first for the monitor table).
- **Pinia store** **`src/stores/S_FaActionManager.ts`** mirrors runtime state for inspection (**`pendingSyncQueue`**, **`currentSyncAction`**, **`inFlightAsyncActions`**, **`lastFailure`**, **`actionHistory`**) plus mutation helpers used by the manager modules. Actions are not executed inside the store; orchestration lives in the **`actionManager/`** scripts.
- **Store bridge** **`src/scripts/actionManager/faActionManagerStoreBridge.ts`** — **`resolveFaActionManagerStore()`** returns the active store or **`null`** when Pinia is not active (boot-safe, test-safe; avoids circular imports).
- **DialogActionMonitor** **`src/components/dialogs/DialogActionMonitor/`** — **`q-table`** of the snapshot taken on **`@show`** (rows do **not** stream live; reopen for a fresh view). Columns include **Payload** (green **`mdi-check`** when **`payloadPreview`** is non-empty; grey **`mdi-minus`** when empty). Status cell renders **`q-spinner-gears`** for **`running`**, **`mdi-check`** for **`success`**, **`mdi-close`** for **`failed`**, **`mdi-timer-sand-empty`** with **`text-blue-5`** for **`queued`** (MDI v5 uses **`timer-sand`** names, not **`mdi-hourglass`**). Row-click help is a **`mdi-help-circle`** icon with **`q-tooltip`** (**`dialogs.actionMonitor.rowClickHint`**). The story is registered with **`tags: ['skip-visual']`** so Storybook visual capture skips it.
- **Menu wiring** — Under **Help / Info**, **`Action Monitor`** (above **`Toggle developer tools`**) dispatches **`runFaAction('openActionMonitorDialog', undefined)`** and shows the global shortcut **`openActionMonitor`** (default **primary+F11**).

## Single-toast rule

The action manager is the **only** place that emits **error** toasts for registered actions. Stores invoked by handlers must throw (or return **`false`** with a console log) and **must not** emit their own negative **`Notify.create`** for save failures. Examples already migrated:

- **`src/stores/faKeybindsStoreBridgeUpdate.ts`** — bridge failures only **`console.error`** and return **`false`**; the action manager surfaces the toast through **`saveKeybindSettings`**.
- **`src/stores/S_FaUserSettings.ts`** — **`updateSettings`** **throws** on bridge rejection or save mismatch; the action manager surfaces the toast through **`saveProgramSettings`**. Success **`Notify`** stays in the store.

Success notifications (Settings saved, etc.) remain in the originating store when they are user-relevant.

## Migrated call sites (today)

- **Async** — toggle dev tools, open Keybind / Program Settings dialog, open Advanced Search Guide / Changelog / License / About / Tips Tricks Trivia dialogs, save Keybind Settings, save Program Settings, minimize / resize app, language switch, startup tips notification, open Action Monitor.
- **Sync** — close app, refresh web contents after language change.
- **Keybind dispatcher** — **`src/scripts/keybinds/faKeybindRunCommand.ts`** maps each **`T_faKeybindCommandId`** to a **`T_faActionId`** through **`FA_KEYBIND_COMMAND_TO_ACTION_ID`** and calls **`runFaAction`**.

## Adding a new action (checklist)

1. **`types/I_faActionManagerDomain.ts`** — append the id to **`FA_ACTION_IDS`** and add the matching payload entry in **`I_faActionPayloadMap`** (use **`void`** for no payload).
2. **`src/scripts/actionManager/faActionDefinitionHandlers.ts`** — add an **`export async function handle…`** (or sync **`export function`** when appropriate) with the implementation. **`src/scripts/actionManager/faActionDefinitions.ts`** — append one row to **`FA_ACTION_DEFINITIONS`** with **`kind`** (**`sync`** for ordered window-control / lifecycle flows, **`async`** for fire-and-forget UI). Use **`dedup: true`** when the action should silently collapse rapid double-triggers (most "open dialog" actions and **`closeApp`** already do).
3. **Call sites** — replace the previous direct call to a UI helper / store / bridge with **`runFaAction(id, payload)`** (or **`runFaActionAwait(...)`** when the caller needs the boolean outcome).
4. **i18n** — no new keys are required for the dispatcher itself; **`globalFunctionality.faActionManager.actionFailed`** already templates **`{actionId}`**. Reuse existing dialog/menu locale keys.
5. **Tests** — extend Vitest under **`src/scripts/actionManager/_tests/`** (registry coverage, run paths) plus the migrated call site's tests; for keybind-routed actions also extend **`src/scripts/keybinds/_tests/faKeybindRunCommand.vitest.test.ts`**. When the monitor UI, **`L_DialogActionMonitor`**, or clipboard JSON shape changes, run or update **`src/components/dialogs/DialogActionMonitor/_tests/**`**, **`e2e-tests/checkActionMonitor.playwright.spec.ts`**, and any E2E that opens the monitor—see [fantasia-testing](../fantasia-testing/SKILL.md) **Connected tests for any feature change**.
6. **Single-toast discipline** — strip any **`Notify.create`** with **`type: 'negative'`** that would now duplicate the manager's failure toast; have the underlying store/helper **`throw`** or return **`false`** instead.

## File map

- **Domain types** — **`types/I_faActionManagerDomain.ts`**.
- **Manager modules** — **`src/scripts/actionManager/`** (`faActionDefinitions.ts`, `faActionDefinitionHandlers.ts`, `faActionManagerRun.ts`, `faActionManagerSyncQueue.ts`, `faActionManagerErrorReporting.ts`, `faActionManagerHistory.ts`, `faActionManagerStoreBridge.ts`).
- **Pinia store** — **`src/stores/S_FaActionManager.ts`**.
- **Action Monitor dialog** — **`src/components/dialogs/DialogActionMonitor/`** (SFC, **`scripts/dialogActionMonitorTable.ts`**, **`_tests/DialogActionMonitor.vitest.test.ts`**, **`_tests/DialogActionMonitor.stories.ts`** with **`tags: ['skip-visual']`**).
- **Menu wiring** — **`src/components/globals/AppControlMenus/_data/helpInfo.ts`** (Action Monitor entry under Toggle developer tools).
- **Keybind routing** — **`src/scripts/keybinds/faKeybindRunCommand.ts`** (**`FA_KEYBIND_COMMAND_TO_ACTION_ID`**).
- **i18n** — **`i18n/<locale>/globalFunctionality/L_faActionManager.ts`** + **`i18n/<locale>/dialogs/L_DialogActionMonitor.ts`** (and **`helpInfo.actionMonitor.*`** under the existing menu locale).

## Tests

- **`src/scripts/actionManager/_tests/faActionDefinitions.vitest.test.ts`** — every **`FA_ACTION_IDS`** entry has a registered definition, no duplicates, every **`kind`** is **`sync`** or **`async`**.
- **`src/scripts/actionManager/_tests/faActionManagerErrorReporting.vitest.test.ts`** — payload preview (undefined, plain object, truncation, cycle), error normalization, single-toast + single-console contract, store recording.
- **`src/scripts/actionManager/_tests/faActionManagerHistory.vitest.test.ts`** — queued / running / success / failed transitions, overflow row, snapshot deep-clone + ordering.
- **`src/scripts/actionManager/_tests/faActionManagerSyncQueue.vitest.test.ts`** — FIFO order, dedup, **`FA_ACTION_SYNC_QUEUE_MAX`** overflow + toast, handler throws, unknown id, idle drain.
- **`src/scripts/actionManager/_tests/faActionManagerRun.vitest.test.ts`** — async/sync dispatch, **`runFaActionAwait`** success/failure for both kinds, unknown id reporter.
- **`src/scripts/actionManager/_tests/faActionManagerStoreBridge.vitest.test.ts`** — **`null`** with no Pinia, resolved store with active Pinia.
- **Migrated call sites** — Vitest coverage updated in **`src/components/globals/GlobalWindowButtons/_tests`**, **`src/components/globals/GlobalLanguageSelector/scripts/_tests`**, **`src/components/dialogs/DialogProgramSettings/scripts/_tests`**, **`src/components/dialogs/DialogKeybindSettings/scripts/_tests`**, **`src/scripts/appInternals/_tests`**, and the keybind dispatcher tests above.
- **Action Monitor UI** — **`src/components/dialogs/DialogActionMonitor/_tests/*.vitest.test.ts`**, **`scripts/_tests/*.vitest.test.ts`**, **`DialogActionMonitor.playwright.test.ts`**; E2E **`e2e-tests/checkActionMonitor.playwright.spec.ts`** (and flows that open the monitor, e.g. **`checkKeybinds.playwright.spec.ts`**).

## Related skills and rules

- [fa-action-manager.mdc](../../rules/fa-action-manager.mdc) — path-scoped rule with the same authoring constraints in checklist form.
- [fantasia-keybinds](../fantasia-keybinds/SKILL.md) — keybind command ids → action ids mapping.
- [fantasia-quasar-vue](../fantasia-quasar-vue/SKILL.md) — **`MainLayout.vue`**, dialogs, Pinia conventions.
- [fantasia-electron-preload](../fantasia-electron-preload/SKILL.md) — **`window.faContentBridgeAPIs`** surfaces called from action handlers (window control, web contents refresh).
- [fantasia-i18n](../fantasia-i18n/SKILL.md) — **`L_faActionManager`**, **`L_DialogActionMonitor`**, and per-locale menu text.
- [fantasia-testing](../fantasia-testing/SKILL.md) — Vitest layout, **`yarn testbatch:verify`** flow, Playwright build-before rule, **Connected tests for any feature change** sweep.

## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
