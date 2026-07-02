---
name: fantasia-two-level-architecture
description: >-
  Migrates Fantasia Archive features to two-level functions + managers layout:
  pure scripts/functions/, *_manager.ts wiring (underscore suffix, e.g.
  dialogFoo_manager.ts), thin Vue SFCs. Use when refactoring features, fixing
  fa-two-level ESLint violations, or adding new UI.
---

# Two-level functions + managers

## Migrate one feature

1. Add **`scripts/functions/`** — pure logic; **`import type`** from **`app/types/**`** only; inject deps from manager
2. Add **`scripts/<feature>_manager.ts`** — wiring only; **`create…`** factories; no top-level functions/classes ([fa-two-level/manager-wiring-only](../../rules/fa-two-level-architecture.mdc))
3. Thin **`.vue`**: props, child imports, one **`use…`** from manager
4. Delete legacy **`scripts/*.ts`** beside **`functions/`**
5. Update **`_tests`**; add **`functions/_tests`**
6. **Dev scoped gate** on feature ([fantasia-dev-scoped-verify](../fantasia-dev-scoped-verify/SKILL.md)); **full** **`yarn testbatch:verify`** before commit

## Fix common ESLint messages

| Message | Fix |
|---------|-----|
| functions/ value imports | Move to **`*_manager.ts`**, pass as arg |
| Legacy script beside functions/ | Merge into functions/ + manager or delete |
| Vue script import allowlist | Expose via manager return |
| Import functions/ only from manager | Manager (tests excepted) |
| Re-export shim | Delete; import real manager/functions |
| manager-wiring-only | Bodies in **`functions/`** or **`*Wiring.ts`** |
| manager-wiring-only (class) | Class in non-manager sibling |
| manager-wiring-only (arrow const) | Factory arg object or **`*Wiring.ts`** |
| functions-only-type-imports | Keep orchestration in **`scripts/`** sibling — not **`functions/`** |
| Vue imports `functions/` | Use domain barrel (**`faDragDrop_manager`**, **`dom_manager`**) when present |

## `*Wiring.ts` vs `*_manager.ts`

- **`*_manager.ts`** — factory + **`export const`** only.
- **`*Wiring.ts`** — **`export function`** + **`document`** / **`window`** / **`fs`**; examples: **`faInterfaceTextDirectionApplyWiring.ts`**, **`faDragDropDocumentDragCursorWiring.ts`**, **`faProjectFilePathHardeningWiring.ts`**.
- **`MainLayout`**: **`attachWindowKeydownListener`** / **`detachWindowKeydownListener`** injected from **`mainLayout_manager.ts`** into **`createMainLayout`**.

## Domain barrels (`src/scripts/<domain>/`)

**`faDragDrop_manager.ts`**, **`dom_manager.ts`** — public API for Vue; re-export **`functions/`** + wiring.

## Pinia stores

**`src/stores/S_*.ts`** = manager. Pure logic in **`src/stores/functions/`**. Bridge scripts may import **`stores/functions/`**.
- Return **`readonly(ref)`** for external session state; mutate in actions only.
- **`S_FaActiveProject`**: **`openGeneration`** mutex; stale open → **`'superseded'`** (**`T_faActiveProjectOpenFlowOutcome`**).

## Audit checklist (all `*_manager.ts`)

1. Grep — no **`export function`**, module **`function`**, **`class`**, top-level **`const x = () =>`**
2. **`yarn lint:eslint`** — **`fa-two-level/manager-wiring-only`**
3. Factory arg property arrows OK
4. Classes + **`sessionDeps`** in **`*Session.ts`**, **`*Wiring.ts`**, **`*Bound.ts`**
5. Electron Node **`fs`** bind: factory in **`functions/`**, **`export const`** in **`*Wiring.ts`** (e.g. **`faProjectFilePathHardeningWiring.ts`**)

## Shared types (`types/`)

Level-1 **`functions/**`**: **`import type`** from **`app/types/**`** only. Managers export values; types from **`app/types/...`**. See [types-folder.mdc](../../rules/types-folder.mdc).

## Electron

Same under **`src-electron/mainScripts/<area>/`**: **`functions/`**, **`<area>_manager.ts`**, **`*Wiring.ts`**, IPC registrars import domain **`*_manager.ts`**. Keep **`contentBridgeAPIs/`** thin.

## Related

- [fa-two-level-architecture.mdc](../../rules/fa-two-level-architecture.mdc)
- [fantasia-testing](../fantasia-testing/SKILL.md)
