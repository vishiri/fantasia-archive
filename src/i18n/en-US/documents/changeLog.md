# Changelog
----------

## 2.4.4 - Dependencies and dev tooling

### Bugfixes & Optimizations
- Refreshed the dependency lockfile with `yarn upgrade` under the existing semver ranges so installs resolve to the latest compatible releases (including Quasar, Vue, `vue-i18n`, Sass, Playwright, and the Vite tooling pulled in by Quasar).
- Upgraded `jsdom` to v29 for the Vitest DOM environment, `eslint-plugin-n` to v17, and refreshed `@types/node` on the Node 22 typings line.
- Migrated lint and types tooling to **ESLint 9** flat config (**neostandard**, **eslint-plugin-vue** v10, **typescript-eslint**), **TypeScript** 6, and **Stylelint** 17 with updated shareable configs; small source tweaks match stricter defaults (import attributes, union spacing, dev window URL guard, QMarkdown CSS shim).
- Aligned **AGENTS**, Cursor rules, and skills so the standard pre-commit and pre-changelog workflow always runs **ESLint**, **TypeScript (`tsc`)**, **Stylelint**, and **unit tests** in that order, with each command invoked in its own terminal for clear logs.

## 2.4.3 - Additional dependency updates and improved testing workflow

### Bugfixes & Optimizations
- Upgraded `vitest` to v4 and adjusted Electron main-process unit-test mocks to constructor-compatible implementations so `BrowserWindow`, `Menu`, and `MenuItem` mocking remains stable under the newer runner.
- Refreshed additional low-risk dependencies (`sqlite3`, `lodash-es`, `stylelint`, `stylelint-config-standard-scss`, and `eslint-plugin-promise`) and revalidated the complete lint/test/build pipeline after the updates.
- Added persistent agent/testing guidance to run each validation command in an isolated terminal invocation to keep long test outputs readable and easier to audit.
- Aligned the `2.4.3` changelog block with the canonical `package.json` version and strengthened contributor guidance so changelog edits always re-read live `package.json` first, avoiding section/version drift.

## 2.4.2 - Core dependency refresh and Quasar/Vite workflow validation

### Bugfixes & Optimizations
- Upgraded `vue-i18n` to v11 and removed legacy TypeScript suppression in i18n bootstrapping now that current typings compile cleanly.
- Refreshed core app and tooling dependencies (including Quasar extras/qmarkdown, Axios, Pinia, Vue Router, Vitest, and selected ESLint plugins) to reduce maintenance risk while staying within the current project architecture.
- Applied a follow-up tooling refresh for the Quasar/Vite workflow (`@quasar/app-vite`, `@intlify/unplugin-vue-i18n`, `vite-plugin-checker`, `eslint-plugin-vue`, and `@types/node`) with full lint, typecheck, unit, component, E2E, and build validation.

## 2.4.1 - Changelog policy lock and component test stability

### Bugfixes & Optimizations
- Fixed Playwright component-test discovery for `DialogAboutFantasiaArchive` by avoiding full i18n loader imports that pull markdown documents into Node-side test loading.
- Updated the dialog social-button assertions to compare rendered labels, matching current UI output and keeping component tests stable.
- Locked project guidance to **never auto-bump versions**; changelog sections now strictly follow the existing `package.json` version unless a manual change is explicitly requested.

## 2.4.0 - Quasar CLI Vite v2 and Node 22 toolchain

### Bugfixes & Optimizations
- Upgraded the desktop app toolchain to `@quasar/app-vite` v2 (Vite 8), ESM `quasar.config.ts`, TypeScript 5.6, and ESLint feedback via `vite-plugin-checker` during dev/build.
- Standardized contributor and CI Node.js on **22.22.0 or newer** (required by the current Quasar CLI), refreshed GitHub Actions `setup-node`, and documented native-module rebuild expectations for `sqlite3` after Electron/Node bumps.
- Replaced the QMarkdown app extension with direct `@quasar/quasar-ui-qmarkdown` registration, Vite-native `*.md?raw` locale imports, and Vue template `isPreTag` handling so markdown dialogs stay stable without the extension’s Vite plugin.
- Migrated vue-i18n bundling to `@intlify/unplugin-vue-i18n`, bumped Electron and electron-builder for ESM main-process output, and aligned Sass with the Storybook subproject; Storybook remains on Vite 6 until its supported peer range includes Vite 8.
- Bumped **`@electron/remote`** to 2.1.x so Electron 33 keeps a working preload (avoids removed Chromium feature probes that previously broke preload load and the bridge APIs).
- Fixed **Playwright component-testing** routing: `ComponentTesting` now globs `../components/**/*.vue` from `src/pages`, so production Electron runs mount the requested SFC instead of an empty harness.
- Raised **`@typescript-eslint`** to v8 for TypeScript 5.6, added **`yarn lint:types`** (full-project `tsc`), and expanded AGENTS/Cursor guidance for ESLint and typecheck gates (TSLint is not used).
- Reduced noisy **DevTools Autofill** CDP stderr lines in development by filtering those specific messages in the Electron main process (harmless protocol mismatches only).
- Hardened renderer code paths that call **`window.faContentBridgeAPIs`** when the preload bridge is missing, and aligned Vitest **`vi.stubEnv`** usage with Vitest 3 boolean rules for `DEV` / `PROD` / `SSR`.
- Tuned **Quasar/electron-builder** config for stricter typings and packaging: PWA `workboxMode` casing (`GenerateSW`), empty **`bex`** block matching current Quasar types, Linux **`desktop.entry`** for electron-builder 26, plus TypeScript project glue (`env.d.ts` Vue shim reference, vue-i18n augmentation handling) so `lint:types` stays reliable.
- Addressed **Dart Sass 2** deprecation noise in shared SCSS via `sass:color` in Quasar variables and scrollbar styles (replacing legacy color helpers).
- **Install reminder:** the **`electron`** package needs its **postinstall** download; skipping lifecycle scripts (for example `npm install --ignore-scripts`) can leave a broken binary until you reinstall or run `node node_modules/electron/install.js`.

## 2.3.2 - Storybook layouts, pages, and contributor tooling

### New features
- Added canvas-only Storybook previews for main layouts and representative app pages using a shared in-memory router (`StoryRouterShell`), a single `STORYBOOK_APP_ROUTES` table, and colocated `src/layouts/**` and `src/pages/**` stories.
- Wired a Storybook-only Vite transform that rewrites `import.meta.globEager` to eager `import.meta.glob` so the component-testing page loads under the Storybook workspace toolchain.
- Extended Storybook i18n mocks so the not-found page shows real copy instead of raw translation keys; simplified index and single-component story labels (dropped the redundant index-only preview).
- Documented layout and page Storybook expectations in `AGENTS.md` and Cursor rules/skills, including canvas-only previews and changelog ordering alongside component stories.

### Bugfixes & Optimizations
- Pointed root ESLint at intentional source and config paths instead of the whole repository; added `yarn lint:style` with Stylelint for `src` Vue and SCSS plus a root Stylelint config.
- Enabled TypeScript `skipLibCheck` and excluded build artifacts, Storybook static output, the Vitest components config, and colocated `*.stories.ts` from the root `tsconfig` project for cleaner checks.
- Removed an empty scoped style block from `SocialContactButtons` surfaced by style linting.
- Refreshed Vitest and Playwright coverage (external link manager, mascot image, window controls) to match current behavior and selectors.

## 2.3.1 - Electron packaging icon and favicon coverage

### Bugfixes & Optimizations
- Added explicit Electron Builder icon configuration for Windows, macOS, and Linux, including Linux desktop-entry metadata and Linux target setup.
- Linked all generated favicon sizes in `index.html` so renderer icon declarations cover the full `public/icons/` set.
- Updated changelog markdown wording to avoid build-time parsing failures in the qmarkdown/Vite pipeline during Electron production builds.

## 2.3.0 - Storybook workspace and desktop polish

### New features
- Moved Storybook into a nested `.storybook-workspace` package with its own toolchain, removed the root `.storybook` tree, and refreshed colocated stories (menus, dialogs, mascot, window controls, and social buttons) for stable addons, `public/` assets, and authoring workflows.
- Tuned global Quasar variable tokens and shared component SCSS adjustments for more consistent window chrome, controls, and markdown/dialog surfaces.
- Added Fantasia mascot image label strings for en-US and German locales to support accessible naming.
- Documented Storybook, Electron `file://`, and Playwright rebuild expectations for contributors in `AGENTS.md`, `README.md`, and Cursor skills/rules (including a dedicated Storybook stories rule).

### Bugfixes & Optimizations
- Fixed social contact button icons not loading in packaged Electron builds by resolving public image URLs with a relative base when the app base URL is "/" or empty, instead of root-relative URLs under file://.
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
