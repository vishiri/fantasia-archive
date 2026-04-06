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
- Playwright hooks in Vue templates (`data-test`, etc.): [`vue-template-test-hooks.mdc`](../../rules/vue-template-test-hooks.mdc) (`**/*.vue`)

## Unit tests (Vitest)

- **Command**: `yarn test:unit` runs [vitest.config.mts](../../vitest.config.mts) then [vitest.components.config.mts](../../vitest.components.config.mts) (Vue SFC tests under `src/components/**`).
- **Execution policy**: in the standard pre-commit flow, `yarn test:unit` is the last step of **`yarn testbatch:verify`** ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)). When iterating on tests alone or debugging after a failed gate, run `yarn test:unit` by itself. Do not chain it with `yarn quasar:build:electron` or Playwright in one shell line.
- **Machine-readable reports**: `test-results/vitest-report/test-results-vitest.json` (core) and `test-results-vitest-components.json` (components).
- **Scope**: Logic in `src/` and `src-electron/` (including main-process modules) with `*.vitest.test.ts` co-located under `tests/` folders; component mounting tests use `@vue/test-utils` + shared [vitest.setup.ts](../../vitest.setup.ts).
- **Component baseline**: under `src/components/**`, maintain one colocated `tests/<ComponentName>.vitest.test.ts` per `.vue` component (add/rename/remove both together).
- **Renderer examples**: `src/scripts/**` helpers, store/composable state transitions, and other deterministic `src/` logic that does not require full Electron runtime wiring.
- **`_data/` is for production feeds** (not automated-test fixture blobs): do **not** add Vitest suites aimed **only** at `_data/` paths; validate production data indirectly via components or scripts. **Vitest fixtures** and **Playwright fixture objects** (props payloads, key lists, gold values) stay **inside** the respective `*.vitest.test.ts` / `*.playwright.test.ts` files as inline `const` data — **no** extra `tests/*.ts` files used only as fixture dumps. Do **not** use `tests/_data/`.
- **Style**: Flat `test` / `test.skip` only (no `describe`), JSDoc above each test naming the function under test, titles like `Test that ...` — see `src-electron/**/tests/*.vitest.test.ts` and the vitest rule above.
- **Typing**: Avoid `any` in test code and fixtures; use concrete interfaces, inferred literals, or `unknown` narrowed before assertion/use.
- **Shared type naming**: Preserve project naming conventions for imported types (`I_` interfaces, `T_` aliases) and prefer descriptive names such as `I_appMenuList` / `T_dialogName`.
- **Coverage semantics**: 1:1 component-to-suite parity means coverage **presence**; it does not imply exhaustive line/branch percentages.

## Playwright (component + E2E)

**Critical**: Playwright targets a **built, production** Electron app. After **any** source change affecting what tests exercise, run `quasar build -m electron` (or `yarn quasar:build:electron`) before Playwright. Use **Node.js 22.22.0+** locally (`package.json` `engines`) so Electron / native steps match CI.

### Cross-toolchain alignment (Storybook + Electron + same repo)

- **Storybook** — Runs from [`.storybook-workspace/`](../../../.storybook-workspace/); config must keep `staticDirs` (and related Vite `public/` wiring) in sync with the Quasar app so public assets resolve the same way in Storybook dev and `yarn storybook:build` output. See [`.storybook-workspace/.storybook/main.ts`](../../../.storybook-workspace/.storybook/main.ts). **Static build** lands in `.storybook-workspace/storybook-static/`. **Storybook VRT** uses [`.storybook-workspace/playwright.storybook-visual.config.ts`](../../../.storybook-workspace/playwright.storybook-visual.config.ts) and `.storybook-workspace/visual-tests/`; root `yarn test:storybook:visual*` chains `yarn storybook:build` with `yarn --cwd .storybook-workspace test:storybook:visual*`. `@playwright/test`, `playwright`, and `http-server` for that flow are **devDependencies of `.storybook-workspace`** (install with `yarn --cwd .storybook-workspace install`).
- **Electron `file://`** — Packaged renderer paths are not a web origin at `/`. If `import.meta.env.BASE_URL` is `'/'` or empty, building `public/` URLs as `/images/...` can fail loading; use a relative prefix (e.g. `./`) for those assets (see `SocialContactSingleButton.vue`).
- **Playwright** — Same rebuild rule as above: **`yarn quasar:build:electron` before `yarn test:components` / `yarn test:e2e`** when exercised sources changed; flaky UI in tests after a green Storybook pass often means a stale build or a `file://` URL mismatch.
- **Storybook visual snapshots** — Keep `layouts-componenttestinglayout--with-social-contact-single-button` and `pages-componenttesting--social-contact-single-button` excluded from snapshot collection; they are Playwright harness utility previews and are not meaningful VRT surfaces.
- **One-shot full suite** — **`yarn testbatch:ensure:nochange`** runs **`yarn testbatch:verify`** + **`yarn quasar:build:electron`** + **`yarn test:components`** + **`yarn test:e2e`** + **`yarn test:storybook:smoke`** + **`yarn test:storybook:visual`** (committed snapshot compare). **`yarn testbatch:ensure:change`** is the same through smoke, then **`yarn test:storybook:visual:update`** for intentional baseline refresh only.

### Config highlights (`playwright.config.ts`)

- Single **`outputDir`**: `test-results/playwright-artifacts` (per-test subfolders; Playwright copies `testInfo.attach` path-based files into each test's `attachments/`). **`testMatch`** limits runs to `src/components/**` and `e2e-tests/**`. HTML report: **`test-results/playwright-report`** (attachment bytes are duplicated into `playwright-report/data/`). **`yarn test:components`** / **`yarn test:e2e`** (and single-spec variants) run via **`scripts/playwrightWithArtifactTrim.mjs`**, which deletes **`test-results/playwright-artifacts`** after the run so only the HTML report tree (including `data/*.webm`) remains. Raw `recordVideo` output uses an OS temp dir and is removed after attach ([`playwrightElectronRecordVideo.ts`](../../../playwrightElectronRecordVideo.ts)).
- `workers: 1`, `fullyParallel: false` — assume sequential, single-worker runs unless you change config.
- Electron component and E2E specs use `getFaPlaywrightElectronRecordVideoPartial(testInfo)` in `electron.launch` and `closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)` instead of raw `electronApp.close()`. Recordings use **1920×1080** via `recordVideo.size`. Set env `FA_PLAYWRIGHT_NO_VIDEO` to `'1'` or `'true'` to skip recording and attachment scan.

### Videos and HTML report (human review and agents)

- Each Electron Playwright test can produce a **usable WebM** recording attached to that test in the **HTML report**. After **`yarn test:components`**, **`yarn test:e2e`**, or the **`:single`** / **`:single:ci`** variants, open **`test-results/playwright-report/index.html`** in a browser, drill into a test, and use **Attachments** to play or save the video. Files the UI plays from live under **`test-results/playwright-report/data/`** (content-addressed names).
- **Report and scratch output are ephemeral across runs:** every Playwright invocation **regenerates** **`test-results/playwright-report/`**. Running a **different** suite (component vs E2E) or **re-running** the same suite **replaces** the previous report—nothing is accumulated there. The yarn Playwright scripts also remove **`test-results/playwright-artifacts`** after each run via **`scripts/playwrightWithArtifactTrim.mjs`** so duplicate on-disk copies are not kept beside the report.
- **LLMs / agents:** do not assume you can meaningfully “analyze” full motion video from repo context alone. Prefer telling the user to open **`test-results/playwright-report/index.html`** (or to share a screenshot or textual failure) rather than treating raw **`.webm`** blobs as inspectable prose.

### Component tests

- **Structure**: Match imports, header constants (`extraEnvSettings`, `electronMainFilePath`, `faFrontendRenderTimer`, `selectorList`), JSDoc per test, inline `// Prepare` / `// Check` / `// Close the app` comments, and `electron.launch` / `closeFaElectronAppWithRecordedVideoAttachments` flow — see [`.cursor/rules/playwright-tests.mdc`](../../rules/playwright-tests.mdc) and any existing test beside the component.
- **Typing**: Keep selectors, props payloads, and helper arguments strongly typed; avoid `any`.

- **Command**: `yarn test:components`
- **Execution policy**: run this command in its own terminal invocation; never combine it with other verification commands in one chained shell command.
- **Location**: Under `src/components/`, files ending in `.playwright.test.ts` (often in a `tests/` subfolder next to the component).
- **Single test**: `yarn test:components:single --component=FOLDER_NAME` (see `package.json` for Windows `%npm_config_*%` variants).
- **Interactive picker**: `yarn test:components:list` → runs `testRunner_component.mjs` (discovers `*.playwright.test.ts` under `src/components/`).

### E2E tests

- **Structure**: Same Playwright rule as components; e2e files use `TEST_ENV: 'e2e'`, may use numeric `faFrontendRenderTimer`, and sometimes `getByText` with visible labels — see `e2e-tests/*.playwright.spec.ts` in the repo.

- **Command**: `yarn test:e2e`
- **Execution policy**: run this command in its own terminal invocation; keep E2E output isolated from other command logs.
- **Location**: `e2e-tests/*.playwright.spec.ts`
- **Single spec**: `yarn test:e2e:single --spec=SPEC_FILE_NAME` (see `package.json`).
- **Interactive picker**: `yarn test:e2e:list` → `testRunner_e2e.mjs`

### Full project gate

- **`yarn testbatch:ensure:nochange`** runs **lint + types + style + unit + production build + Playwright component + Playwright E2E + Storybook smoke + Storybook visual compare** in one chain. **`yarn testbatch:ensure:change`** ends with **Storybook visual snapshot update** instead of compare — use only when baselines should change (see **[testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)** for when to split commands across terminals instead).

## Checklist when changing UI or Electron shell

1. **Quality gate** in one terminal: `yarn testbatch:verify` — fix issues per [eslint-typescript.mdc](../../rules/eslint-typescript.mdc) ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)).
2. Rebuild: `yarn quasar:build:electron` (or `quasar build -m electron`) — its own terminal.
3. `yarn test:components` / `yarn test:e2e` as needed — each in its own terminal; do not chain with `yarn quasar:build:electron` or with each other in one line, unless you intentionally run **`yarn testbatch:ensure:nochange`** or **`yarn testbatch:ensure:change`**.
4. When Storybook-backed UI or VRT snapshots are in scope: run **`yarn test:storybook:smoke`** and **`yarn test:storybook:visual`** (or use **`yarn testbatch:ensure:nochange`** to cover verify + build + Playwright + Storybook in one shot). Use **`yarn testbatch:ensure:change`** only when deliberately updating committed Storybook snapshots.

## Choosing Vitest vs Playwright in renderer work

- Prefer Vitest when validating pure/data/state behavior in `src/` and keep assertions deterministic.
- Prefer Playwright when validating user-facing interaction flow, full component rendering behavior, or anything relying on the built Electron app runtime.

## Storybook smoke checks (component authoring support)

- Storybook commands: `yarn storybook:run` (interactive) and `yarn test:storybook:smoke` / `storybook dev --smoke-test --ci` (startup verification).
- **Visual regression (Playwright + static Storybook)**: after `yarn storybook:build`, run `yarn test:storybook:visual` from the repo root, or `yarn --cwd .storybook-workspace test:storybook:visual` if `storybook-static/` is already present. Update baselines with `yarn test:storybook:visual:update` (or workspace `test:storybook:visual:update`). HTML/report output and artifacts stay under repo-root **`test-results/storybook-visual-*`** locally (not run in **GitHub Actions**; use **`yarn testbatch:ensure:nochange`** or the individual scripts when you need the full gate).
- Keep **component** Storybook stories in `tests/` subfolders as `src/components/**/tests/<Component>.stories.ts`.
- **`src/layouts/**` and `src/pages/**` stories** (if present) live in `tests/` subfolders (`src/layouts/**/tests/*.stories.ts`, `src/pages/**/tests/*.stories.ts`) and are canvas-only previews; do **not** expect or add Storybook Docs/autodocs for them (see [`storybook-stories.mdc`](../../rules/storybook-stories.mdc)).
- When components rely on i18n-backed markdown docs, avoid importing full locale roots in Storybook mocks; use focused `T_*` translation module imports plus placeholder `documents.*` strings to prevent markdown import-analysis failures.

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
