---
name: fantasia-quasar-vue
description: >-
  Builds Vue 3 + Quasar UI for Fantasia Archive: layouts, pages, router, Pinia,
  and boot files. Use when editing .vue files, Quasar components, routes, or
  stores under src/.
---

# Fantasia Archive — Quasar and Vue

## Stack

- **Node.js 22.22.0 or newer** for local dev and CLI (`package.json` `engines.node`).
- **Vue 3** with **Quasar** (`quasar` v2, `@quasar/app-vite`).
- **Pinia** for state (`src/stores/`); router in `src/router/`.
- **TypeScript** throughout; path alias `app/` maps to project root (see imports like `app/types/...`).

## Layout and pages

- Default app chrome: `src/layouts/MainLayout.vue` and routes in `src/router/routes.ts`.
- **Component playground**: `src/pages/ComponentTesting.vue` with `src/layouts/ComponentTestingLayout.vue` — use for isolated UI experiments before wiring into main flows.
- **Storybook**: primary stories live under `src/components/**/<Component>.stories.ts`. Optional **canvas-only** stories may exist for `src/layouts/**/*.stories.ts` and `src/pages/**/*.stories.ts` (router previews); for those, **do not** add autodocs, Docs tab content, or `parameters.docs.description` — keep `parameters.docs.disable: true` (see [`storybook-stories.mdc`](../../rules/storybook-stories.mdc)). Storybook runs from [`.storybook-workspace/`](../../../.storybook-workspace/) (config under `.storybook-workspace/.storybook/`) so `staticDirs` and Vite can mirror the Quasar app’s `public/` layout. Root scripts: `yarn storybook`, `yarn build-storybook`.

## Quasar patterns

- Prefer Quasar components (`q-*`) and existing spacing/typography patterns in sibling components.
- Boot files in `src/boot/` run at app init (e.g. axios, external links).
- When importing shared project types, keep `I_` / `T_` prefixes and use descriptive singular/collection naming (e.g. `T_documentName`, `I_appMenuList`).
- In `.vue` SFCs, prefer template `$t('...')` translation calls; avoid importing `useI18n` only for `t(...)` when a template binding can express the same text.

## `public/` assets and Electron (`file://`)

- Quasar + Vite often expose `import.meta.env.BASE_URL` as `'/'` or `''` for the Electron renderer. URLs such as `/images/foo.png` then resolve to the **filesystem root** under `file://`, not next to `index.html`, and images or other `public/` files may fail to load in packaged builds (and break Playwright assertions that expect a loaded `<img>`).
- For anything served from `public/`, build href/src with a **relative** base when `BASE_URL` is `'/'` or empty (e.g. `./images/...`). Example: [`SocialContactSingleButton.vue`](../../../src/components/SocialContactSingleButton/SocialContactSingleButton.vue).

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

- `yarn lint` (ESLint + `@typescript-eslint` v8 + Vue; `standard`-style config) and **`yarn lint:types`** (`tsc -p tsconfig.json`) — see [eslint-typescript.mdc](../../rules/eslint-typescript.mdc). **TSLint** is not used.
- `yarn lint:style` when changing scoped Vue/SCSS significantly.
- **`quasar.config.ts`**: match Quasar typings (e.g. PWA `workboxMode: 'GenerateSW' | 'InjectManifest'`; `bex` uses `QuasarBexConfiguration`, not legacy `contentScripts`). Duplicate **Vite** `Plugin` types vs `@quasar/app-vite` may require a documented **`@ts-expect-error`** on `defineConfig`.
- **`src/boot/i18n.ts`**: vue-i18n module augmentation may use **`@ts-expect-error` (TS2665)** because the package `module` entry targets the ESM bundle under `tsc`.
- Keep TypeScript strict in Vue code: avoid `any`; prefer explicit prop/emits/interfaces, `unknown`, and narrowing.
- Keep component test parity in `src/components/**`: each `.vue` should have a colocated `tests/<ComponentName>.vitest.test.ts` (presence baseline; not a claim of exhaustive line/branch coverage).

## Related

- [fantasia-i18n](../fantasia-i18n/SKILL.md) for user-visible strings.
- [fantasia-testing](../fantasia-testing/SKILL.md) for component Playwright tests next to components.

## Storybook i18n caution

- In Storybook-specific loaders/mocks, avoid importing full locale entrypoints (`src/i18n/index.ts` or `src/i18n/en-US/index.ts`) because they import markdown `documents/*.md`.
- Prefer importing focused non-markdown `T_*` modules (for example menu/button translation modules) and provide explicit placeholder copy for markdown-backed `documents.*` keys used by dialogs.
- Do **not** create Storybook stories under the `A11y/*` category for this project.
- Do **not** create Storybook stories that only exercise `TEST_ENV === 'components'` branches; validate those paths in Playwright/component-test harnesses instead.
