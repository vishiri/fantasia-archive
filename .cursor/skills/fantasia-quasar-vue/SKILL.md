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

## Component folders (`src/components/`)

- **`dialogs/`** — `Dialog*` modal SFCs.
- **`globals/`** — app chrome (`GlobalWindowButtons`, `AppControlMenus`, `AppControlSingleMenu`).
- **`elements/`** — small reusable widgets (`FantasiaMascotImage`, `SocialContactSingleButton`).
- **`other/`** — other composites (`SocialContactButtons`).

Locale `L_*` paths under `i18n/<locale>/components/` use the same bucket names as `src/components/`. See [README](../../../README.md) and [AGENTS.md](../../../AGENTS.md).

## Layout and pages

- Default app chrome: `src/layouts/MainLayout.vue` and routes in `src/router/routes.ts`.
- **Component playground**: `src/pages/ComponentTesting.vue` with `src/layouts/ComponentTestingLayout.vue` — use for isolated UI experiments before wiring into main flows.
- **Storybook**: primary stories live under `src/components/**/tests/<Component>.stories.ts`. Optional **canvas-only** stories may exist for `src/layouts/**/tests/*.stories.ts` and `src/pages/**/tests/*.stories.ts` (router previews); for those, **do not** add autodocs, Docs tab content, or `parameters.docs.description` — keep `parameters.docs.disable: true` (see [`storybook-stories.mdc`](../../rules/storybook-stories.mdc)). Storybook runs from [`.storybook-workspace/`](../../../.storybook-workspace/) (config under `.storybook-workspace/.storybook/`, static build `storybook-static/`, VRT under `visual-tests/` + `playwright.storybook-visual.config.ts`) so `staticDirs` and Vite can mirror the Quasar app’s `public/` layout. Root scripts: `yarn storybook:run`, `yarn storybook:build`, `yarn test:storybook:visual*`.

## Quasar patterns

- Prefer Quasar components (`q-*`) and existing spacing/typography patterns in sibling components.
- Boot files in `src/boot/` run at app init (e.g. axios, external links).
- When importing shared project types, keep `I_` / `T_` prefixes and use descriptive singular/collection naming (e.g. `T_documentName`, `I_appMenuList`).
- In TypeScript and Vue SFC TS scripts, use `import type` for type-only imports.
- In `.vue` SFCs, prefer template `$t('...')` translation calls; avoid importing `useI18n` only for `t(...)` when a template binding can express the same text.

## `public/` assets and Electron (`file://`)

- Quasar + Vite often expose `import.meta.env.BASE_URL` as `'/'` or `''` for the Electron renderer. URLs such as `/images/foo.png` then resolve to the **filesystem root** under `file://`, not next to `index.html`, and images or other `public/` files may fail to load in packaged builds (and break Playwright assertions that expect a loaded `<img>`).
- For anything served from `public/`, build href/src with a **relative** base when `BASE_URL` is `'/'` or empty (e.g. `./images/...`). Example: [`SocialContactSingleButton.vue`](../../../src/components/elements/SocialContactSingleButton/SocialContactSingleButton.vue).

## Component `_data/` (production structured payloads)

- When a `.vue` file would hold a **large production data object** (menus, multi-part configs, long lists), move pieces under **`src/components/<Feature>/_data/`**.
- Use **several locally named `.ts` files** inside `_data/` instead of one giant file when it aids navigation (mirror [AppControlMenus/_data](src/components/globals/AppControlMenus/_data/)).
- Those files may still use **translations** (`i18n`), **imported copy helpers**, and **functions** on items (e.g. `trigger` handlers); they are not limited to string literals.
- **Automated-test fixture data** does **not** live in `_data/` or in **`tests/<fixture>.ts`** modules: Vitest keeps it inside `*.vitest.test.ts`; Playwright keeps mount payloads inline in `*.playwright.test.ts` and passes them via `COMPONENT_PROPS`. If a parent SFC must embed a component-mode-only blob, keep it as a **`const` inside that `.vue`**. See [vue-quasar.mdc](../../rules/vue-quasar.mdc) for split vs `src/scripts/` boundaries.

## Component `scripts/` (user-requested SFC extraction)

- **Do not** extract large `<script setup>` functions into separate files unless the **user explicitly asks** for that refactor (no proactive “cleanup” splits).
- When they do ask, new modules **always** live under **`src/components/<bucket>/<Feature>/scripts/`** (`.ts` files), imported back into the feature `.vue`. Do not park these extractions next to the `.vue` at the feature root.
- Distinct from **`_data/`** (production structured payloads) and from **`src/scripts/`** (shared app-wide helpers). See [vue-quasar.mdc](../../rules/vue-quasar.mdc).

## Cursor rules for `.vue` files (split by topic)

| Topic | Rule |
|-------|------|
| Quasar, Composition API, i18n, script size / extraction | [`vue-quasar.mdc`](../../rules/vue-quasar.mdc) |
| BEM classes and scoped SCSS only | [`vue-bem-scss.mdc`](../../rules/vue-bem-scss.mdc) |
| `data-test-locator` and other Playwright `data-test-*` template hooks | [`vue-template-test-hooks.mdc`](../../rules/vue-template-test-hooks.mdc) |
| Global SCSS / `src/css` | [`project-scss.mdc`](../../rules/project-scss.mdc) |

## Quality gates

- Before commits or substantial UI refactors, run the **quality gate** in one terminal: `yarn testbatch:verify` ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)) — see [eslint-typescript.mdc](../../rules/eslint-typescript.mdc). **TSLint** is not used.
- Give **`yarn lint:stylelint`** extra attention when changing Vue `<style>` blocks or `src/**/*.scss`.
- **`quasar.config.ts`**: match Quasar typings (e.g. PWA `workboxMode: 'GenerateSW' | 'InjectManifest'`; `bex` uses `QuasarBexConfiguration`, not legacy `contentScripts`). Duplicate **Vite** `Plugin` types vs `@quasar/app-vite` may require a documented **`@ts-expect-error`** on `defineConfig`.
- **`src/boot/i18n.ts`**: vue-i18n module augmentation may use **`@ts-expect-error` (TS2665)** because the package `module` entry targets the ESM bundle under `tsc`.
- Keep TypeScript strict in Vue code: avoid `any`; prefer explicit prop/emits/interfaces, `unknown`, and narrowing.
- Keep Vitest SFC parity in **`src/components/**`**, **`src/layouts/**`**, and **`src/pages/**`**: each feature `.vue` should have a colocated **`tests/<Name>.vitest.test.ts`** (presence baseline; not a claim of exhaustive line/branch coverage).

## Related

- [fantasia-i18n](../fantasia-i18n/SKILL.md) for user-visible strings.
- [fantasia-testing](../fantasia-testing/SKILL.md) for component Playwright tests next to components.

## Storybook i18n caution

- In Storybook-specific loaders/mocks, avoid importing full locale entrypoints (`i18n/index.ts` or `i18n/en-US/index.ts`) because they import markdown `documents/*.md`.
- Prefer importing focused non-markdown `L_*` locale modules (for example menu/button translation modules) and provide explicit placeholder copy for markdown-backed `documents.*` keys used by dialogs.
- Do **not** create Storybook stories under the `A11y/*` category for this project.
- Do **not** create Storybook stories that only exercise `TEST_ENV === 'components'` branches; validate those paths in Playwright/component-test harnesses instead.

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
