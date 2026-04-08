---
name: fantasia-testing
description: >-
  Runs and extends Fantasia Archive tests: Vitest unit tests vs Playwright
  component and E2E tests, including rebuild-before-Playwright rules and file
  naming. Use when writing tests, debugging CI, or when the user mentions
  Vitest, Playwright, component tests, or e2e.
---

# Fantasia Archive — testing

## Cursor rules (detailed structure)

Match **existing** tests to the letter when adding or editing:

- Vitest: [`vitest-tests.mdc`](../../rules/vitest-tests.mdc) (`**/*.vitest.test.ts`)
- Playwright (test files): [`playwright-tests.mdc`](../../rules/playwright-tests.mdc) (`**/*playwright*.ts`)
- Playwright hooks in Vue templates (`data-test-locator` and other `data-test-*`, never bare `data-test`): [`vue-template-test-hooks.mdc`](../../rules/vue-template-test-hooks.mdc) (`**/*.vue`)

## Vitest coverage tiers (CI)

Same rules as [vitest-tests.mdc](../../rules/vitest-tests.mdc) (**Vitest coverage tiers (CI)** section): **100%** all metrics on **`src-electron`** and **`helpers/**/*.ts`**; **100%** all metrics on **`unit-src-renderer`** **`src`** **`.ts`** (boot, scripts, stores, **`specialCharactersFixer`**); **100%** statements, functions, lines on **`unit-components`** **`.ts`** under **`src/components`**, **`src/layouts`**, **`src/pages`** (branches reported, not gated—**v8** noise); **`.vue`** SFCs have **no** threshold—**~60%** **watermarks** for review. Configs live under [**vitest/**](../../../vitest/); entry [**vitest.config.mts**](../../../vitest.config.mts) sets repo **`root`** and **`extends`** per project.

## Unit tests (Vitest)

- **Commands**: **`yarn test:unit`** runs the Vitest multi-project root in [vitest.config.mts](../../vitest.config.mts) (**`unit-electron`**, **`unit-src-renderer`**, **`unit-helpers`**, **`unit-components`**) without coverage. **`yarn testbatch:verify`** ends with **`yarn test:coverage:verify`**: **100%** on all four v8 metrics for **`src-electron`** ([vitest.electron.config.mts](../../../vitest/vitest.electron.config.mts)) and **`helpers`** ([vitest.helpers.config.mts](../../../vitest/vitest.helpers.config.mts)); **100%** on all four for **`unit-src-renderer`** **`src`** **`.ts`** ([vitest.src-renderer.config.mts](../../../vitest/vitest.src-renderer.config.mts)); **100%** statements, functions, and lines for **`unit-components`** **`.ts`** under **`src/components`**, **`src/layouts`**, and **`src/pages`**, with **`.vue`** SFCs only watermarked (**60%** lower band for review—no failing gate) ([vitest.components.config.mts](../../../vitest/vitest.components.config.mts)). Use **`yarn test:coverage:electron`**, **`yarn test:coverage:helpers`**, or **`yarn test:coverage:src`** to debug one slice.
- **Execution policy**: use **`yarn test:unit`** while iterating; before commits run **`yarn testbatch:verify`** ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)). Do not chain unit/coverage commands with `yarn quasar:build:electron` or Playwright in one shell line.
- **Machine-readable reports**: `test-results/vitest-report/test-results-vitest-*.json` per project (electron, src-renderer, helpers, components).
- **Scope**: Logic in `src/` and `src-electron/` (including main-process modules) with `*.vitest.test.ts` co-located under `tests/` folders; component mounting tests use `@vue/test-utils` + shared [vitest.setup.ts](../../../vitest/vitest.setup.ts).
- **`helpers/` packages** (e.g. [`helpers/playwrightHelpers/`](../../../helpers/playwrightHelpers/)): treat like other testable modules—add or extend **`tests/*.vitest.test.ts`** when you add or change non-trivial helper code. Discovery is automatic via **`unit-helpers`**; do not put Playwright-only harness packages under **`src/helpers/`** unless you intend those **`*.vitest.test.ts`** files in **`unit-helpers`**—prefer repo-root **`helpers/<package>/`**.
- **SFC baseline**: under **`src/components/**`**, **`src/layouts/**`**, and **`src/pages/**`**, maintain one colocated **`tests/<Name>.vitest.test.ts`** per feature `.vue` (add/rename/remove both together). **Extracted `scripts/*.ts`** next to a component SFC should gain **`scripts/tests/*.vitest.test.ts`** when they hold real logic (same idea as `src/scripts` helpers).
- **Renderer examples**: `src/scripts/**` helpers, store/composable state transitions, and other deterministic `src/` logic that does not require full Electron runtime wiring.
- **`_data/` is for production feeds** (not automated-test fixture blobs): do **not** add Vitest suites aimed **only** at `_data/` paths; validate production data indirectly via components or scripts. **Vitest fixtures** and **Playwright fixture objects** (props payloads, key lists, gold values) stay **inside** the respective `*.vitest.test.ts` / `*.playwright.test.ts` files as inline `const` data — **no** extra `tests/*.ts` files used only as fixture dumps. Do **not** use `tests/_data/`.
- **Style**: Flat `test` / `test.skip` only (no `describe`), JSDoc above each test naming the function under test, titles like `Test that ...` — see `src-electron/**/tests/*.vitest.test.ts` and the vitest rule above.
- **Typing**: Avoid `any` in test code and fixtures; use concrete interfaces, inferred literals, or `unknown` narrowed before assertion/use.
- **Shared type naming**: Preserve project naming conventions for imported types (`I_` interfaces, `T_` aliases) and prefer descriptive names such as `I_appMenuList` / `T_dialogName`.
- **Coverage semantics**: 1:1 component-to-suite parity means coverage **presence** for **`.vue`**; **`src`** **`.ts`** in the Vitest coverage **`include`** lists must meet the enforced percentages (see [vitest-tests.mdc](../../rules/vitest-tests.mdc)). **`.vue`** rows **below ~60%** lines or statements in the **`unit-components`** report warrant investigation.

## Playwright (component + E2E)

**Critical**: Playwright targets a **built, production** Electron app. After **any** source change affecting what tests exercise, run `quasar build -m electron` (or `yarn quasar:build:electron`) before Playwright. Use **Node.js 22.22.0+** locally (`package.json` `engines`) so Electron / native steps match CI.

**Electron `userData` isolation**: Specs set `TEST_ENV` to `components` or `e2e`. The main process then uses `%APPDATA%/<package.json name>/playwright-user-data` (this app: `fantasia-archive/playwright-user-data`, not `fantasia-archive-dev`). [`fixAppName.ts`](../../../src-electron/mainScripts/appIdentity/fixAppName.ts) applies that path in Electron. [`playwrightIsolatedUserDataDirName.ts`](../../../src-electron/mainScripts/appIdentity/playwrightIsolatedUserDataDirName.ts) exports **`PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME`** with **no** `electron` import so [`playwrightUserDataReset.ts`](../../../helpers/playwrightHelpers/playwrightUserDataReset.ts) (and Vitest for path logic) can run in Node without importing **`fixAppName`**—otherwise Playwright test collection hits **`import { app } from 'electron'`** and fails. Every `*.playwright.test.ts` / `*.playwright.spec.ts` registers **`test.beforeEach(() => { resetFaPlaywrightIsolatedUserData() })`** from **`playwrightUserDataReset.ts`** so that folder (including **`faUserSettings.json`**) is removed before each **`electron.launch`**. Shared Playwright-only modules live under [`helpers/playwrightHelpers/`](../../../helpers/playwrightHelpers/); add future cross-cutting harness packages as siblings under **`helpers/`**.

### Cross-toolchain alignment (Storybook + Electron + same repo)

- **Storybook** — Runs from [`.storybook-workspace/`](../../../.storybook-workspace/); config must keep `staticDirs` (and related Vite `public/` wiring) in sync with the Quasar app so public assets resolve the same way in Storybook dev and `yarn storybook:build` output. See [`.storybook-workspace/.storybook/main.ts`](../../../.storybook-workspace/.storybook/main.ts). **Static build** lands in `.storybook-workspace/storybook-static/`. Workspace **`storybook:build`** and **`test:storybook:smoke`** use **`--quiet --loglevel warn`**; production **`viteFinal`** further lowers Vite noise (warnings still show). **Storybook VRT** uses [`.storybook-workspace/playwright.storybook-visual.config.ts`](../../../.storybook-workspace/playwright.storybook-visual.config.ts) and `.storybook-workspace/visual-tests/`; root `yarn test:storybook:visual*` chains `yarn storybook:build` with `yarn --cwd .storybook-workspace test:storybook:visual*`. Per-story **`[storybook-visual]`** progress logs are off by default; set **`FA_STORYBOOK_VISUAL_VERBOSE=1`** when debugging. `@playwright/test`, `playwright`, and `http-server` for that flow are **devDependencies of `.storybook-workspace`** (install with `yarn --cwd .storybook-workspace install`).
- **Electron `file://`** — Packaged renderer paths are not a web origin at `/`. If `import.meta.env.BASE_URL` is `'/'` or empty, building `public/` URLs as `/images/...` can fail loading; use a relative prefix (e.g. `./`) for those assets (see `SocialContactSingleButton.vue`).
- **Playwright** — Same rebuild rule as above: **`yarn quasar:build:electron` before `yarn test:components` / `yarn test:e2e`** when exercised sources changed; flaky UI in tests after a green Storybook pass often means a stale build or a `file://` URL mismatch.
- **Storybook visual snapshots** — Keep `layouts-componenttestinglayout--with-social-contact-single-button` and `pages-componenttesting--social-contact-single-button` excluded from snapshot collection; they are Playwright harness utility previews and are not meaningful VRT surfaces.
- **One-shot full suite** — **`yarn testbatch:ensure:nochange`** runs **`yarn testbatch:verify`** + **`yarn quasar:build:electron:summarized`** + **`yarn test:components`** + **`yarn test:e2e`** + **`yarn test:storybook:smoke`** + **`yarn test:storybook:visual`** (committed snapshot compare). **`yarn testbatch:ensure:change`** is the same through smoke, then **`yarn test:storybook:visual:update`** for intentional baseline refresh only.

### Config highlights (`playwright.config.ts`)

- Single **`outputDir`**: `test-results/playwright-artifacts` (per-test subfolders; Playwright copies `testInfo.attach` path-based files into each test's `attachments/`). **`testMatch`** limits runs to `src/components/**` and `e2e-tests/**`. Terminal reporter **`line`** (concise progress; failures in full; no list of every passing test). HTML report: **`test-results/playwright-report`** (attachment bytes are duplicated into `playwright-report/data/`). **`yarn test:components`** / **`yarn test:e2e`** (and single-spec variants) run via **`scripts/playwrightWithArtifactTrim.mjs`**, which deletes **`test-results/playwright-artifacts`** after the run so only the HTML report tree (including `data/*.webm`) remains. Raw `recordVideo` output uses an OS temp dir and is removed after attach ([`helpers/playwrightHelpers/playwrightElectronRecordVideo.ts`](../../../helpers/playwrightHelpers/playwrightElectronRecordVideo.ts)).
- `workers: 1`, `fullyParallel: false` — assume sequential, single-worker runs unless you change config.
- Electron component and E2E specs use `getFaPlaywrightElectronRecordVideoPartial(testInfo)` in `electron.launch` and `closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)` instead of raw `electronApp.close()`. After `const appWindow = await electronApp.firstWindow()`, call `installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)` from [`helpers/playwrightHelpers/playwrightElectronRecordVideo.ts`](../../../helpers/playwrightHelpers/playwrightElectronRecordVideo.ts) so WebM captures show a synthetic pointer dot (OS cursor is often absent from window video). Set `FA_PLAYWRIGHT_CURSOR_MARKER` to `'0'` or `'false'` to disable the dot; set `FA_PLAYWRIGHT_NO_VIDEO` to `'1'` or `'true'` to skip recording and attachment scan. Recordings use **1920×1080** via `recordVideo.size`.

### Videos and HTML report (human review and agents)

- Each Electron Playwright test can produce a **usable WebM** recording attached to that test in the **HTML report**. After **`yarn test:components`**, **`yarn test:e2e`**, or the **`:single`** / **`:single:ci`** variants, open **`test-results/playwright-report/index.html`** in a browser, drill into a test, and use **Attachments** to play or save the video. Files the UI plays from live under **`test-results/playwright-report/data/`** (content-addressed names).
- **Report and scratch output are ephemeral across runs:** every Playwright invocation **regenerates** **`test-results/playwright-report/`**. Running a **different** suite (component vs E2E) or **re-running** the same suite **replaces** the previous report—nothing is accumulated there. The yarn Playwright scripts also remove **`test-results/playwright-artifacts`** after each run via **`scripts/playwrightWithArtifactTrim.mjs`** so duplicate on-disk copies are not kept beside the report.
- **LLMs / agents:** do not assume you can meaningfully “analyze” full motion video from repo context alone. Prefer telling the user to open **`test-results/playwright-report/index.html`** (or to share a screenshot or textual failure) rather than treating raw **`.webm`** blobs as inspectable prose.

### Component tests

- **Structure**: Match imports, header constants (`extraEnvSettings`, `electronMainFilePath`, `faFrontendRenderTimer`, `selectorList`), JSDoc per test, inline `// Prepare` / `// Check` / `// Close the app` comments, and `electron.launch` / `closeFaElectronAppWithRecordedVideoAttachments` flow — see [`.cursor/rules/playwright-tests.mdc`](../../rules/playwright-tests.mdc) and any existing test beside the component.
- **Locators**: Prefer **`data-test-locator`** plus other `data-test-*` from `.vue` templates (never bare `data-test`); document static values in `selectorList` and use small helpers beside it for dynamic `data-test-locator` suffixes (see [SocialContactSingleButton.playwright.test.ts](../../../src/components/elements/SocialContactSingleButton/tests/SocialContactSingleButton.playwright.test.ts) vs [DialogProgramSettings.playwright.test.ts](../../../src/components/dialogs/DialogProgramSettings/tests/DialogProgramSettings.playwright.test.ts) `programSettingsSelector`). **Exception locators** (Quasar portaled `[role="tooltip"]`, E2E menu strings, etc.) still belong in `selectorList` as the **full selector string** under a clear key (for example `quasarTooltip: '[role="tooltip"]'`) — avoid raw literals in the test body. For suites with many tooltips, put duplicate tooltip text on the trigger (`data-test-tooltip-text`) for bulk string checks and keep at least one hover + live tooltip assertion (`appWindow.locator(selectorList.quasarTooltip)`, etc.) so behavior stays real ([DialogProgramSettings.vue](../../../src/components/dialogs/DialogProgramSettings/DialogProgramSettings.vue)).
- **Typing**: Keep selectors, props payloads, and helper arguments strongly typed; avoid `any`.

- **Command**: `yarn test:components`
- **Execution policy**: run this command in its own terminal invocation; never combine it with other verification commands in one chained shell command.
- **Location**: Under `src/components/`, files ending in `.playwright.test.ts` (often in a `tests/` subfolder next to the component).
- **Single test**: `yarn test:components:single --component=<bucket>/<ComponentName>` (for example `dialogs/DialogProgramSettings`, `elements/ErrorCard`; see `package.json` for Windows `%npm_config_*%` variants).
- **Interactive picker**: `yarn test:components:list` → runs `testRunner_component.mjs` (discovers `*.playwright.test.ts` under `src/components/`, lists choices as **`bucket/ComponentFolder`** matching the repo tree).

### E2E tests

- **Structure**: Same Playwright rule as components; e2e files use `TEST_ENV: 'e2e'`, may use numeric `faFrontendRenderTimer`, and sometimes `getByText` with visible labels — see `e2e-tests/*.playwright.spec.ts` in the repo.

- **Command**: `yarn test:e2e`
- **Execution policy**: run this command in its own terminal invocation; keep E2E output isolated from other command logs.
- **Location**: `e2e-tests/*.playwright.spec.ts`
- **Single spec**: `yarn test:e2e:single --spec=SPEC_FILE_NAME` (see `package.json`).
- **Interactive picker**: `yarn test:e2e:list` → `testRunner_e2e.mjs`

### Full project gate

- **`yarn testbatch:ensure:nochange`** runs **`yarn testbatch:verify`** (lint + types + stylelint + **Vitest coverage** with layered gates per [vitest-tests.mdc](../../rules/vitest-tests.mdc)) + **`yarn quasar:build:electron:summarized`** + Playwright component + Playwright E2E + Storybook smoke + Storybook visual compare in one chain. **`yarn testbatch:ensure:change`** ends with **Storybook visual snapshot update** instead of compare — use only when baselines should change (see **[testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)** for when to split commands across terminals instead).

## Checklist when changing UI or Electron shell

1. **Quality gate** in one terminal: `yarn testbatch:verify` — fix issues per [eslint-typescript.mdc](../../rules/eslint-typescript.mdc) and [vitest-tests.mdc](../../rules/vitest-tests.mdc) ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)).
2. Rebuild: `yarn quasar:build:electron` (or `quasar build -m electron`) — its own terminal.
3. `yarn test:components` / `yarn test:e2e` as needed — each in its own terminal; do not chain with `yarn quasar:build:electron` or with each other in one line, unless you intentionally run **`yarn testbatch:ensure:nochange`** or **`yarn testbatch:ensure:change`**.
4. When Storybook-backed UI or VRT snapshots are in scope: run **`yarn test:storybook:smoke`** and **`yarn test:storybook:visual`** (or use **`yarn testbatch:ensure:nochange`** to cover verify + build + Playwright + Storybook in one shot). Use **`yarn testbatch:ensure:change`** only when deliberately updating committed Storybook snapshots.

## Choosing Vitest vs Playwright in renderer work

- Prefer Vitest when validating pure/data/state behavior in `src/` and keep assertions deterministic.
- Prefer Playwright when validating user-facing interaction flow, full component rendering behavior, or anything relying on the built Electron app runtime.

## Storybook smoke checks (component authoring support)

- Storybook commands: `yarn storybook:run` (interactive) and `yarn test:storybook:smoke` / `storybook dev --smoke-test --ci` (startup verification).
- **Visual regression (Playwright + static Storybook)**: after `yarn storybook:build`, run `yarn test:storybook:visual` from the repo root, or `yarn --cwd .storybook-workspace test:storybook:visual` if `storybook-static/` is already present. Update baselines with `yarn test:storybook:visual:update` (or workspace `test:storybook:visual:update`). HTML/report output and artifacts stay under repo-root **`test-results/storybook-visual-*`** locally (not run in **GitHub Actions**; use **`yarn testbatch:ensure:nochange`** or the individual scripts when you need the full gate).
- Keep **component** Storybook stories in `tests/` subfolders as `src/components/**/tests/<Component>.stories.ts`, with **`meta.title`** **`Components/<bucket>/<ComponentName>`** (same **`dialogs` / `elements` / `globals` / `other`** buckets as **`src/components/`**).
- **`src/layouts/**` and `src/pages/**` stories** (if present) live in `tests/` subfolders (`src/layouts/**/tests/*.stories.ts`, `src/pages/**/tests/*.stories.ts`) and are canvas-only previews; do **not** expect or add Storybook Docs/autodocs for them (see [`storybook-stories.mdc`](../../rules/storybook-stories.mdc)).
- When components rely on i18n-backed markdown docs, avoid importing full locale roots in Storybook mocks; use focused `L_*` locale module imports plus placeholder `documents.*` strings to prevent markdown import-analysis failures.

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
