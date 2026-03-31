# Changelog
----------

## 2.3.0 - Storybook workspace and desktop polish

### New features
- Moved Storybook into a nested `.storybook-workspace` package with its own toolchain, removed the root `.storybook` tree, and refreshed colocated stories (menus, dialogs, mascot, window controls, and social buttons) for stable addons, `public/` assets, and authoring workflows.
- Tuned global Quasar variable tokens and shared component SCSS adjustments for more consistent window chrome, controls, and markdown/dialog surfaces.
- Added Fantasia mascot image label strings for en-US and German locales to support accessible naming.
- Documented Storybook, Electron `file://`, and Playwright rebuild expectations for contributors in `AGENTS.md`, `README.md`, and Cursor skills/rules (including a dedicated Storybook stories rule).

### Bugfixes & Optimizations
- Fixed social contact button icons not loading in packaged Electron builds by resolving `public/` images with a relative base when `import.meta.env.BASE_URL` is `/` or empty, instead of root-relative URLs under `file://`.
- Updated Playwright component coverage for window controls to match current markup and accessibility labels.

## 2.2.1 - Type naming and consistency sweep

### New features
- Added explicit component test-governance guidance across AGENTS/rules/skills: each `src/components/**` Vue component keeps a colocated `*.vitest.test.ts` suite, with parity treated as coverage presence (not exhaustive branch/line percentages).
- Standardized fixture placement policy for future test authoring: Vitest and Playwright fixtures stay inline in their respective test files, while `_data/` remains production-only.
- Refactored shared menu and dialog/document type declarations into clearer singular and collection naming while preserving the `I_` / `T_` prefix conventions.
- Added reusable menu item and submenu type building blocks to keep menu configuration typing easier to maintain.
- Expanded renderer-side Vitest coverage under `src/` for scripts and store state transitions using deterministic mocks.
- Added a tracked renderer test-strategy inventory under `.cursor/plans/` to map `src/` TS/Vue targets across Vitest and Playwright responsibilities.
- Split Vitest into a Node/core config and a jsdom components config with shared setup so `yarn test:unit` covers boot, i18n, scripts, stores, and colocated smoke tests for every `src/components/*.vue`.
- Colocated `AppControlSingleMenu` and `SocialContactSingleButton` as top-level components (paths and imports updated).
- Routed initial navigation through a dedicated `appStartupRouting` helper consumed from `App.vue`.

### Bugfixes & Optimizations
- Fixed trigger callback typing mismatches in help menu data by wrapping typed handlers in zero-argument callbacks compatible with generic menu trigger signatures.
- Normalized typo-prone comments and wording across component tests, E2E tests, and selected source files for consistent naming and grammar.
- Updated README test command examples to match actual script names and usage patterns in `package.json`.
- Separated Playwright artifact output from the HTML report folder in `playwright.config.ts` to remove reporter output-directory clash warnings.
- Re-aligned testing guidance to keep `yarn test:unit` as the baseline unit-test workflow in project docs and Cursor guidance files.
- Clarified AGENTS/rules/skills guidance so Vitest explicitly treats both `src/` and `src-electron/` as first-class unit-testing surfaces while keeping Playwright as the integration/runtime layer.
- Clarified test-data rules: automated-test fixtures stay inline in each `*.vitest.test.ts` / `*.playwright.test.ts`, component-testing payloads use `COMPONENT_PROPS` where possible, and embedded component-mode menu data stays inline in `AppControlMenus` for dialog triggers.
- Resolved ESLint findings in boot external-link Vitest mocks (`Event` listener typing and padded blocks).

## 2.2.0 - Testing and agent tooling

### New features
- Expanded Vitest coverage for Electron preload bridge modules and main-process scripts (window controls, devtools, external links, app management, spell checker, and main window creation) using deterministic mocks.
- Playwright component tests for DialogAboutFantasiaArchive (replaces the previous TODO placeholder file).
- Cursor rule and skill for local plan documents in `.cursor/plans/` (gitignored), plus changelog guidance to read version-matching plan files for release context.

### Bugfixes & Optimizations
- Replaced remaining TypeScript `any` annotations in shared type declarations with `unknown` to keep menu trigger and Vue component typing stricter.
- Added explicit anti-`any` guidance to Vue, TypeScript scripts, Vitest, and Playwright rules/skills to keep future code strongly typed.

## 2.1.0 - Tooling and AI-assisted development

### New features
- Cursor project rules and skills for Vue/Quasar, BEM and scoped SCSS, Playwright and Vitest, Electron preload, global SCSS, conventional Git commits, and en-US changelog upkeep tied to the app version.
- AGENTS.md as the project entry point for AI-assisted development.

## 2.0.0 - The Big Rewrite

### New features
- A whole plethora since this is a full rewrite!

### Known issues
- No issues at the date of release.

### Bugfixes & Optimizations
- Too many optimizations to list since this is a rewrite.
- No bugs at the date of release.
