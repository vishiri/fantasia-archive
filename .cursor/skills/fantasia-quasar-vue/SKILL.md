---
name: fantasia-quasar-vue
description: >-
  Builds Vue 3 + Quasar UI for Fantasia Archive: layouts, pages, router, Pinia,
  and boot files. Use when editing .vue files, Quasar components, routes, or
  stores under src/.
---

# Fantasia Archive — Quasar and Vue

## Stack

- **Vue 3** with **Quasar** (`quasar` v2, `@quasar/app-vite`).
- **Pinia** for state (`src/stores/`); router in `src/router/`.
- **TypeScript** throughout; path alias `app/` maps to project root (see imports like `app/types/...`).

## Layout and pages

- Default app chrome: `src/layouts/MainLayout.vue` and routes in `src/router/routes.ts`.
- **Component playground**: `src/pages/ComponentTesting.vue` with `src/layouts/ComponentTestingLayout.vue` — use for isolated UI experiments before wiring into main flows.

## Quasar patterns

- Prefer Quasar components (`q-*`) and existing spacing/typography patterns in sibling components.
- Boot files in `src/boot/` run at app init (e.g. axios, external links).
- When importing shared project types, keep `I_` / `T_` prefixes and use descriptive singular/collection naming (e.g. `T_documentName`, `I_appMenuList`).

## Component `_data/` (production structured payloads)

- When a `.vue` file would hold a **large production data object** (menus, multi-part configs, long lists), move pieces under **`src/components/<Feature>/_data/`**.
- Use **several locally named `.ts` files** inside `_data/` instead of one giant file when it aids navigation (mirror [AppControlMenus/_data](src/components/AppControlMenus/_data/)).
- Those files may still use **translations** (`i18n`), **imported copy helpers**, and **functions** on items (e.g. `trigger` handlers); they are not limited to string literals.
- **Automated-test fixture data** does **not** live in `_data/` or in **`tests/<fixture>.ts`** modules: Vitest keeps it inside `*.vitest.test.ts`; Playwright keeps mount payloads inline in `*.playwright.test.ts` and passes them via `COMPONENT_PROPS`. If a parent SFC must embed a component-mode-only blob, keep it as a **`const` inside that `.vue`**. See [vue-quasar.mdc](../../rules/vue-quasar.mdc) for split vs `src/scripts/` boundaries.

## Cursor rules for `.vue` files (split by topic)

| Topic | Rule |
|-------|------|
| Quasar, Composition API, i18n, script size / extraction | [`vue-quasar.mdc`](../../rules/vue-quasar.mdc) |
| BEM classes and scoped SCSS only | [`vue-bem-scss.mdc`](../../rules/vue-bem-scss.mdc) |
| `data-test` and other Playwright template hooks | [`vue-template-test-hooks.mdc`](../../rules/vue-template-test-hooks.mdc) |
| Global SCSS / `src/css` | [`project-scss.mdc`](../../rules/project-scss.mdc) |

## Quality gates

- `yarn lint` (ESLint + Vue plugin; project uses `standard`-style config).
- Stylelint is configured for Vue/SCSS when touching styles significantly.
- Keep TypeScript strict in Vue code: avoid `any`; prefer explicit prop/emits/interfaces, `unknown`, and narrowing.

## Related

- [fantasia-i18n](../fantasia-i18n/SKILL.md) for user-visible strings.
- [fantasia-testing](../fantasia-testing/SKILL.md) for component Playwright tests next to components.
