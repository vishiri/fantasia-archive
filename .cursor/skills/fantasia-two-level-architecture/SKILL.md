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

1. Add `scripts/functions/` and move pure logic there. No imports except `import type` from `app/types/**`. Pass `i18n.global.t`, stores, `Result`, and bridge APIs as arguments from the manager.
2. Add or rename `scripts/<feature>_manager.ts` (suffix `_manager.ts`, not `.manager.ts`). Import NPM, Pinia, `i18n`, `_data/`, and `functions/*` here only; **do not define functions in the manager**—use `create…` factories from `functions/` and `export const` bindings (ESLint `fa-two-level/manager-wiring-only`). Do **not** add a second file that only re-exports that manager under a legacy name—import the manager (or `functions/`) directly from call sites.
3. Thin the `.vue` file: `defineProps`, child `*.vue` imports, one `use…` from the manager.
4. Delete legacy `scripts/*.ts` modules in that feature (ESLint errors once `functions/` exists).
5. Update `_tests` imports; add `functions/_tests` for pure units.
6. Run `yarn lint:eslint` on the feature folder, then `yarn testbatch:verify`.

## Fix common ESLint messages

| Message | Fix |
|---------|-----|
| functions/ must not use value imports | Move the import to `*_manager.ts` and pass the value into the function. |
| Legacy script module not allowed beside scripts/functions/ | Merge into `functions/` + manager or delete after move. |
| Vue script may only import the feature *_manager.ts | Remove store/script imports from the SFC; expose via manager return. |
| Import functions/ only from *_manager.ts | Import the function module only from the manager (tests excepted). |
| Re-export shim file | Delete the alias module; point imports at the defining `*_manager.ts` or `functions/*.ts`. |
| manager-wiring-only | Move function bodies to `functions/` (or sibling wiring module); manager exports `const` from `create…(deps)`. |
| manager-wiring-only (class) | Move the class to a non-`*_manager.ts` module (for example `faFooSession.ts`); manager only passes the constructor into `create…`. |
| manager-wiring-only (local const arrow) | Inline the lambda in the factory argument object, or move deps assembly to `functions/` or `*Wiring.ts`. |

## Audit checklist (all `*_manager.ts`)

1. Grep `**/*_manager.ts` — no `export function`, `function ` at module scope, `class `, or top-level `const x = () =>`.
2. Run `yarn lint:eslint` — `fa-two-level/manager-wiring-only` covers exports and non-exported top-level `const`/`let` and classes.
3. Factory **argument objects** may still use property arrows (for example `t: (key) => i18n.global.t(key)`); that is not a manager body.
4. Implementation classes and fixed `sessionDeps` live in sibling modules (`*Session.ts`, `*Wiring.ts`, `*Bound.ts`), not in `*_manager.ts`.

## Shared types (`types/`)

- Level-1 **`functions/**`** may only **`import type`** from **`app/types/**`** — put every shared **`export interface`** / **`export type`** there (naming: **`I_`**, **`T_`**), not in **`functions/`**, **`*_manager.ts`**, or Vue scripts.
- Managers and stores export **values** only; they must **not** **`export type { … }`** from implementation files. Call sites import types from **`app/types/...`** directly.
- Do not add re-export shim files that only forward types from **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).

## Pinia stores

`src/stores/S_*.ts` is the manager. Put pure logic in `src/stores/functions/`. Bridge scripts under `stores/scripts/*Bridge*` may import `stores/functions/`.

## Electron

Same layout under `src-electron/mainScripts/<area>/`:

- `functions/` — pure helpers (`import type` from `app/types/**` only).
- `<area>_manager.ts` — wiring-only public entry; re-export or bind factories from `functions/` and `*Wiring.ts` modules.
- `*Wiring.ts` (and `*Surface.ts`, `*Runtime.ts`, etc.) — impure implementation siblings (SQLite, `electron`, `fs`, cross-module orchestration).
- `ipcManagement/` — `ipcManagement_manager.ts` exports `registerAllFaIpc`; individual `registerFa*Ipc.ts` files stay as IPC registrars and should import domain APIs from `*_manager.ts` when possible.

Keep `contentBridgeAPIs/` thin.

## Related

- [.cursor/rules/fa-two-level-architecture.mdc](../../rules/fa-two-level-architecture.mdc)
- [fantasia-testing](../fantasia-testing/SKILL.md)
