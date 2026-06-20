---
name: fantasia-quasar-vue
description: >-
  Builds Vue 3 + Quasar UI for Fantasia Archive: layouts, pages, router, Pinia,
  and boot files. Use when editing .vue files, Quasar components, routes, or
  stores under src/.
---

# Fantasia Archive — Quasar and Vue

## Stack

- **Node.js 22.22.0+** (`package.json` `engines.node`)
- **Vue 3** + **Quasar** (`quasar` v2, `@quasar/app-vite`)
- **Pinia** (`src/stores/`); router `src/router/`
- **TypeScript**; alias **`app/`** → project root

## Component folders (`src/components/`)

- **Helper / wrapper SFCs** — three infrastructure features use **`_<PascalCase>`** folder + file — see [AGENTS.md](../../../AGENTS.md) **Helper / wrapper SFC naming**. Not for dialog sub-panels.
- **`dialogs/`** — `Dialog*` modals. Root **`q-dialog`** refs in global open coordination → **`registerComponentDialogStackGuard`** or **`registerMarkdownDialogStackGuard`** from **`dialogManagement.ts`**.
- **`floatingWindows/`** — `Window*` movable/resizable surfaces. **`_FaFloatingWindowBodyTeleport`**; **`useFaFloatingWindowFrame`**; **no** dialog stack guard. Z-index **`5000`–`5999`**. Playbook: [fantasia-floating-windows](../fantasia-floating-windows/SKILL.md).
- **`globals/`** — chrome (`GlobalWindowButtons`, `AppControlMenus`, **`_FaUserCssInjector`**, …)
- **`elements/`** — reusable widgets (`FaColorPickerInput`, **`FaIconPickerInput`**, …)
- **`other/`** — composites (`SocialContactButtons`)
- **`foundation/`** — Storybook-only catalogues; no product routes, no Playwright
- **Hierarchical trees** — **`@he-tree/vue`** only; **`QTree` forbidden** — [fantasia-he-tree](../fantasia-he-tree/SKILL.md)
- **List / table reorder** — **`vue-draggable-plus`** / **`v-draggable-table`** — [fantasia-drag-drop](../fantasia-drag-drop/SKILL.md)

Locale **`L_*`**: `i18n/<locale>/components/<bucket>/` mirrors buckets (**`foundation/`** excluded). **`dialogs/`**, **`floatingWindows/`** beside **`components/`**.

## Layout and pages

- Default chrome: **`MainLayout.vue`**, **`src/router/routes.ts`**
- **Global keybinds**: **`MainLayout.vue`** registers **`keydown`** after **`S_FaKeybinds`** loads — [fantasia-keybinds](../fantasia-keybinds/SKILL.md)
- **Playground**: **`ComponentTesting.vue`** + **`ComponentTestingLayout.vue`**
- **Storybook**: `src/components/**/_tests/<Component>.stories.ts`, **`meta.title`** **`Components/<bucket>/<ComponentName>`**. Layout/page stories canvas-only — [storybook-stories.mdc](../../rules/storybook-stories.mdc). Workspace: [`.storybook-workspace/`](../../../.storybook-workspace/)

## Single-file component block order (MUST)

Every **`.vue`** SFC: **`<template>`** → **`<script>`** / **`<script setup>`** → **`<style>`**. Never open script or style before template.

## Quasar patterns

- Prefer **`q-*`** + sibling spacing/typography patterns
- **Theme tokens**: feature **`styles/_variables.scss`**, [`src/css/theme/quasar-components/`](../../../src/css/theme/quasar-components/), globals partials, [`app.palette.scss`](../../../src/css/app.palette.scss) — see [project-scss.mdc](../../rules/project-scss.mdc). **`--fa-color-*`** on **`:root`** in **`fa-theme.scss`**; semantic utilities in **`faSemanticText.scss`**. **Do not** reference raw palette **`$primary`**, **`$grey`**, … in **`<style>`** — use semantic tokens. After **`quasar-components/`** edits: **`yarn audit:quasar-component-tokens`**. **`$`** names use hyphens, not underscores.
- **Scrollable areas**: class **`hasScrollbar`** — [`scrollbar.scss`](../../../src/css/globals/scrollbar.scss)
- **Inline code**: **`<code class="code-token">`**
- Boot: `src/boot/`
- **`import type`** for type-only imports
- Templates: **`$t('...')`** — avoid **`useI18n`** only for **`t`** when template binding works

## `public/` assets and Electron (`file://`) (MUST)

When **`import.meta.env.BASE_URL`** is **`'/'`** or empty, **`/images/...`** resolves to filesystem root under **`file://`**. Build **`public/`** URLs with relative base (e.g. **`./images/...`**). Example: **`SocialContactSingleButton.vue`**.

## Component `_data/` (production structured payloads)

Large production data objects → **`src/components/<Feature>/_data/`** (several **`.ts`** files OK). May use **`i18n`**, copy helpers, **`trigger`** handlers. **Test fixtures** stay inside test files — not **`_data/`** or **`_tests/_data/`**.

## Component `scripts/` and SFC size (MUST)

- **ESLint limits**: **`.vue` ≤250**, **functions ≤100**, **`.ts` ≤250** — [code-size-decomposition.mdc](../../rules/code-size-decomposition.mdc)
- Extract to **`scripts/*.ts`**, subcomponents, **`src/scripts/`** when over limit. SCSS only under **`styles/`** — [component-styles-folder.mdc](../../rules/component-styles-folder.mdc)
- **Return object literals**: identifiers/literals only in **`return { ... }`**
- **Fewer modules per concern** until near caps — avoid 10–20 line one-export files
- Distinct from **`_data/`** and shared **`src/scripts/`** — [vue-quasar.mdc](../../rules/vue-quasar.mdc)

## Cursor rules for `.vue` files

| Topic | Rule |
|-------|------|
| Quasar, Composition API, i18n, extraction | [`vue-quasar.mdc`](../../rules/vue-quasar.mdc) |
| BEM + scoped SCSS | [`vue-bem-scss.mdc`](../../rules/vue-bem-scss.mdc) |
| Extracted styles | [`component-styles-folder.mdc`](../../rules/component-styles-folder.mdc) |
| `data-test-*` hooks | [`vue-template-test-hooks.mdc`](../../rules/vue-template-test-hooks.mdc) |
| Trees | [`fa-he-tree.mdc`](../../rules/fa-he-tree.mdc) |
| DnD | [`fa-drag-drop-lists.mdc`](../../rules/fa-drag-drop-lists.mdc) |
| Icon picker | [`fa-icon-picker.mdc`](../../rules/fa-icon-picker.mdc) |
| Global SCSS | [`project-scss.mdc`](../../rules/project-scss.mdc) |

## Quality gates

- Before commits: **`yarn testbatch:verify`** ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc), [eslint-typescript.mdc](../../rules/eslint-typescript.mdc))
- Extra attention on **`yarn lint:stylelint`** when changing **`<style>`** or **`src/**/*.scss`**
- **`quasar.config.ts`**: match Quasar typings (PWA **`workboxMode`**, BEX **`QuasarBexConfiguration`**)
- Vitest SFC parity: **`_tests/<Name>.vitest.test.ts`** per feature **`.vue`**
- Material SFC/**`i18n`** edits → [fantasia-testing](../fantasia-testing/SKILL.md) **Connected tests**

## Related

- [fantasia-floating-windows](../fantasia-floating-windows/SKILL.md), [fantasia-he-tree](../fantasia-he-tree/SKILL.md), [fantasia-drag-drop](../fantasia-drag-drop/SKILL.md), [fantasia-icon-picker](../fantasia-icon-picker/SKILL.md), [fantasia-i18n](../fantasia-i18n/SKILL.md), [fantasia-testing](../fantasia-testing/SKILL.md), [fantasia-action-manager](../fantasia-action-manager/SKILL.md)

## Storybook i18n caution

- Storybook mocks: focused **`L_*`** imports — not full locale roots (markdown **`documents/*.md`** break import analysis)
- Placeholder **`documents.*`** in **`externalFileLoader.ts`**
- No **`A11y/*`** stories; no stories that only exercise **`TEST_ENV === 'components'`** branches

## Types

Shared types → **`types/`** (**`app/types/...`**). See [types-folder.mdc](../../rules/types-folder.mdc).
