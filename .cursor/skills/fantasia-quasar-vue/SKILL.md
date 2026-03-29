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

## Related

- [fantasia-i18n](../fantasia-i18n/SKILL.md) for user-visible strings.
- [fantasia-testing](../fantasia-testing/SKILL.md) for component Playwright tests next to components.
