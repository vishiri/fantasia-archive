# Changelog
----------

## 2.4.9 - Contributor tooling, Pinia dialogs, and CI hardening

### Bugfixes & Optimizations
- Fixed **Pinia 3** dialog flow: **`S_DialogMarkdown`** and **`S_DialogComponent`** are now standard setup stores (call **`S_DialogMarkdown()`** / **`S_DialogComponent()`** at use sites). **`openDialogMarkdownDocument`**, **`DialogMarkdownDocument`**, and **`DialogAboutFantasiaArchive`** use guarded watchers when a store is not active (e.g. **Storybook**). **`ComponentTesting`** handles missing **`componentName`** routes safely and renders the harness only after a matching SFC is resolved.
- Simplified the **Index** preview page by removing the extra **Fantasia Mascot** block from the default **`IndexPage`** route (keeps the route as a lightweight shell for local links/testing).
- Renamed and grouped **Yarn** contributor scripts for clarity: quality gates **`yarn testbatch:verify`** / **`yarn testbatch:ensure`**; lint **`yarn lint:eslint`**, **`yarn lint:typescript`**, **`yarn lint:stylelint`**; Quasar Electron **`yarn quasar:build:electron`** / **`yarn quasar:dev:electron`**; Playwright **`yarn test:components`** and colon-suffixed **`test:components:*`**, **`test:e2e:*`**; Storybook dev **`yarn storybook:run`** and static **`yarn storybook:build`** (formerly **`build-storybook`**). Removed obsolete **`yarn test:full`** and duplicate **`yarn visual:storybook:ci`**; **GitHub Actions** call **`yarn visual:storybook:test`** directly. Updated **README**, **AGENTS**, Cursor rules/skills, **`package.json`**, **`testRunner_*.mjs`**, and workflows.
- Colocated Storybook **static output** (**`.storybook-workspace/storybook-static/`**), **Playwright** visual-regression config, **`visual-tests/`** (including committed snapshots), workspace **`storybook:visual:*`** scripts, and VRT devDependencies (**`http-server`**, **`@playwright/test`**) under **`.storybook-workspace/`**; root **`yarn visual:storybook:*`** delegates with **`yarn --cwd .storybook-workspace`**. Updated **`.gitignore`**, **`tsconfig.json`**, and **`lint:eslint`** paths.
- Set explicit least-privilege **`permissions`** (`contents: read`) on **`verify`** and manual **`build`** **GitHub Actions** workflows; added **Dependency Review**, **OSV Scanner** (reusable workflows + weekly schedule on **`master`**), and **Gitleaks** for PR/push hygiene.

## 2.4.8 - Pinia 3 and Vue Router 5

### Bugfixes & Optimizations
- Refreshed **Sass** to **1.99.x** under **`^1.78.0`** in **root** and **`.storybook-workspace`** lockfiles so the desktop app and **Storybook** use the same resolved Dart Sass line for styles.
- Upgraded **Pinia** to **v3** and **Vue Router** to **v5** for the desktop app and **`.storybook-workspace`** (explicit **`vue-router`** there for **`StoryRouterShell`**); did not add optional **`@pinia/colada`**. Refreshed **root** and **`.storybook-workspace`** lockfiles with **`yarn upgrade`** within existing semver ranges (**Storybook** remains pinned at **10.3.4** on that line).
- Upgraded **`uuid`** to **v13** for markdown and component dialog UUIDs (**`S_Dialog`**) and **`@quasar/cli`** to **v3** for the **`quasar`** CLI used with **`@quasar/app-vite`** v2.
- Upgraded **Electron** to **41.x** (from **33.x**); **`electron-builder`** still runs **`@electron/rebuild`** so **`sqlite3`** matches the bundled runtime. **`@electron/remote`** **2.1.x** and the known UnPackaged production-install peer warning for **`electron`** are unchanged.
- Standardized type-only imports across the TypeScript and Vue codebase (`import type`) to align with strict linting and keep runtime bundles free of type-only import noise.
- Added a new `yarn ensure` command for full-project validation (`verify` + production build + Playwright component + Playwright E2E) and aligned contributor guidance in **README**, **AGENTS**, and Cursor rules/skills to document the quick gate vs full gate workflow clearly.
- Reduced non-actionable Vue warning noise in component Vitest output by filtering known Quasar-resolution and test-only injection warnings in shared test setup, keeping signal focused on actionable failures.
- Fixed CI TypeScript resolution for Vue SFC imports by replacing the generated `.quasar` shim reference in `src/env.d.ts` with an in-repo `declare module '*.vue'` declaration, so `yarn verify` succeeds on clean GitHub runners without requiring local/generated `.quasar` shim files.

## 2.4.7 - Storybook 10 and Vite 8 alignment

### Bugfixes & Optimizations
- Upgraded **`.storybook-workspace`** to **Storybook 10** and **Vite 8** so component previews run on the same major bundler line as the desktop app (**`@quasar/app-vite`**), refreshed the nested **Yarn** lockfile for reproducible installs (including **CI** frozen installs), and aligned root **Storybook** / **`eslint-plugin-storybook`** versions with that release family.
- Refreshed **root** and **`.storybook-workspace`** lockfiles with **`yarn upgrade`** within existing semver ranges (notably **Quasar**, **Vue**, **vue-i18n**, **Playwright**, **Sass**, and related tooling); kept **`@types/node`** on the **22.x** typings line for the **Node 22** engine. Updated **README** and **AGENTS** so contributors see **Storybook 10** on **Vite 8** instead of the old split-Vite wording.
- Added **`debug-storybook.log*`** to **`.gitignore`** so local Storybook diagnostic logs are not picked up as untracked files.

## 2.4.6 - Window chrome, Storybook, Stylelint, and DevTools

### Bugfixes & Optimizations
- Applied **`getCurrentWindow()`** from **`@electron/remote`** to **window chrome** bridge helpers (**minimize**, **maximize**, **resize**, **close**, **maximized state**) so controls stay tied to the app window when OS focus moves to menus or other surfaces.
- Aligned **`.storybook-workspace`** with the main app on **Vue 3.5**, **vue-i18n 11**, **Quasar 2.16+**, **Pinia 2.3+**, and **@quasar/extras 1.17**; removed stray **`package-lock.json`** there so only **Yarn** lockfiles are used.
- Refreshed **root** and **`.storybook-workspace`** lockfiles with **`yarn upgrade`** within existing semver ranges; pinned root **Storybook** addons to **8.6.18** so they match **`@storybook/vue3-vite`** and the nested workspace (notably newer **Playwright**, **Sass**, and other compatible tooling).
- Migrated **`src/css/app.scss`** and **`globals/*.scss`** to Sass **`@use`** with explicit **`quasar.variables.scss`** imports in partials, replacing deprecated **`@import`** chains for app-owned global styles ahead of Dart Sass 3.
- Storybook’s Vite **`additionalData`** prepends **`quasar.variables.scss`** for project **`.vue` / `.scss`** (via **`file://`** URLs so Windows paths with spaces resolve). For **`quasar/src/css/index.sass`** it uses **`@import`** (not **`@use`**) ahead of Quasar’s own imports—the same effective ordering as **`@quasar/vite-plugin`’s `sassVariables`** transform—so **`!default`** theme entries resolve to your palette and framework CSS variables (**`--q-dark`**, **`--q-primary`**, and related tokens) match the desktop app; other **`node_modules`** Sass stays untouched.
- Extended the root **Stylelint** setup with **`@stylistic/stylelint-config`** so stylistic rules dropped from **Stylelint 17**’s core keep enforcing familiar CSS/SCSS formatting; updated **`.vscode`** recommendations and settings so the Stylelint extension can use the project config, **fix on save**, and format standalone **`.scss`** files consistently.
- Routed **DevTools** control (**toggle**, **open**, **close**, and **status**) through small **main-process IPC** handlers instead of **`@electron/remote`** **`getCurrentWindow()`**, so **Help → Toggle developer tools** stays reliable in packaged **Electron** builds; the **E2E** check now waits until DevTools finish attaching instead of asserting immediately after the menu closes.
- Updated **GitHub Actions** on **`verify`** and manual **build** workflows (**`actions/checkout`**, **`actions/setup-node`**, **`actions/upload-artifact`**) to current major versions.
- Noted in **`quasar.config.ts`** that **`@electron/remote`**’s **`electron`** peer is expected to show as unmet during UnPackaged **`yarn install --production`**; packaging still succeeds because the app runs on the bundled Electron runtime.
- Storybook preview registers Quasar’s **`Dark`** plugin, the **`@quasar/quasar-ui-qmarkdown`** app plugin (after Quasar, matching boot order), **Roboto (latin-ext)**, and **`preview-body.html`** / **`Dark.set(true)`** so **`body--dark`** stays aligned with the app; Sass **`additionalData`** skips **`app.scss`** to avoid double-loading variables. **Dialog** and **top-menu** component Docs use **`parameters.docs.story.inline: false`** again so Autodocs does not mount every story in one document (each **`q-dialog`** auto-opens on mount, which stacked modals when **`inline: true`**); each nested Docs iframe still loads the same preview CSS stack.

## 2.4.5 - Contributor workflow and CI

### Bugfixes & Optimizations
- Added **`yarn verify`** to run ESLint, TypeScript (`tsc`), Stylelint, and unit tests in one command (named **`verify`** because Yarn 1 reserves **`yarn check`** for dependency verification); documented it in the README and dev-setup guidance, aligned Cursor rules/skills, and run it in the manual GitHub Actions build workflow before the production Electron build.
- Fixed the combined unit-then-Playwright helper so it runs unit tests then Playwright over component and E2E paths (removed the broken `concurrently` invocation and dropped the unused **`concurrently`** dependency).
- Cleared the French locale changelog markdown so release notes are not maintained per locale until translations return.
- Upgraded **`@intlify/unplugin-vue-i18n`** to v11 for the Quasar/Vite locale pipeline, **`uuid`** to v11 (built-in TypeScript types; removed **`@types/uuid`**), and **`sqlite3`** to v6 for the Electron main-process dependency line.
- Added a **GitHub Actions** workflow that runs **`yarn verify`** on **push** and **pull request** to **`master`** / **`main`** (including installing the Storybook workspace so ESLint can resolve `.storybook-workspace/.storybook`).
- Refreshed **root** and **`.storybook-workspace`** lockfiles with **`yarn upgrade`** within existing semver ranges (notably newer **Playwright**, **Quasar**, **Vue**, **vue-i18n**, **Sass**, and related tooling where ranges allowed).
- Made **DevTools** bridge helpers use **`getCurrentWindow()`** instead of **`BrowserWindow.getFocusedWindow()`** so **toggle / status** stay tied to the app window when menus or DevTools change OS focus, stabilizing the DevTools **E2E** check.

## 2.4.4 - Dependencies and dev tooling

### Bugfixes & Optimizations
- Refreshed the dependency lockfile with `yarn upgrade` under the existing semver ranges so installs resolve to the latest compatible releases (including Quasar, Vue, `vue-i18n`, Sass, Playwright, and the Vite tooling pulled in by Quasar).
- Upgraded `jsdom` to v29 for the Vitest DOM environment, `eslint-plugin-n` to v17, and refreshed `@types/node` on the Node 22 typings line.
- Migrated lint and types tooling to **ESLint 9** flat config (**neostandard**, **eslint-plugin-vue** v10, **typescript-eslint**), **TypeScript** 6, and **Stylelint** 17 with updated shareable configs; small source tweaks match stricter defaults (import attributes, union spacing, dev window URL guard, QMarkdown CSS shim).
- Aligned **AGENTS**, Cursor rules, and skills so the standard pre-commit and pre-changelog workflow always runs **ESLint**, **TypeScript (`tsc`)**, **Stylelint**, and **unit tests** in that order; the **quality gate** may run as one chained terminal command for efficiency, with individual commands reserved for debugging failures. **Build** and **Playwright** checks stay one command per terminal.

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
- Migrated vue-i18n bundling to `@intlify/unplugin-vue-i18n`, bumped Electron and electron-builder for ESM main-process output, and aligned Sass with the Storybook subproject; Storybook remains on Vite 6 until its supported peer range includes Vite 8. *(Superseded in **2.4.7**: Storybook now runs on **Vite 8** with **`@quasar/app-vite`**.)*
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
