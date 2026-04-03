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

- **Storybook** — Runs from [`.storybook-workspace/`](../../../.storybook-workspace/); config must keep `staticDirs` (and related Vite `public/` wiring) in sync with the Quasar app so public assets resolve the same way in Storybook dev and `yarn storybook:build` output. See [`.storybook-workspace/.storybook/main.ts`](../../../.storybook-workspace/.storybook/main.ts). **Static build** lands in `.storybook-workspace/storybook-static/`. **Storybook VRT** uses [`.storybook-workspace/playwright.storybook-visual.config.ts`](../../../.storybook-workspace/playwright.storybook-visual.config.ts) and `.storybook-workspace/visual-tests/`; root `yarn visual:storybook:*` chains `yarn storybook:build` with `yarn --cwd .storybook-workspace storybook:visual:*`. `@playwright/test`, `playwright`, and `http-server` for that flow are **devDependencies of `.storybook-workspace`** (install with `yarn --cwd .storybook-workspace install`).
- **Electron `file://`** — Packaged renderer paths are not a web origin at `/`. If `import.meta.env.BASE_URL` is `'/'` or empty, building `public/` URLs as `/images/...` can fail loading; use a relative prefix (e.g. `./`) for those assets (see `SocialContactSingleButton.vue`).
- **Playwright** — Same rebuild rule as above: **`yarn quasar:build:electron` before `yarn test:components` / `yarn test:e2e`** when exercised sources changed; flaky UI in tests after a green Storybook pass often means a stale build or a `file://` URL mismatch.
- **Storybook visual snapshots** — Keep `layouts-componenttestinglayout--with-social-contact-single-button` and `pages-componenttesting--social-contact-single-button` excluded from snapshot collection; they are Playwright harness utility previews and are not meaningful VRT surfaces.
- **One-shot full suite** — `yarn testbatch:ensure` runs `yarn testbatch:verify` + `yarn quasar:build:electron` + `yarn test:components` + `yarn test:e2e` in sequence for a complete project gate.

### Config highlights (`playwright.config.ts`)

- `testMatch`: `**/*playwright.@(spec|test).?(c|m)[jt]s?(x)`
- `workers: 1`, `fullyParallel: false` — assume sequential, single-worker runs unless you change config.

### Component tests

- **Structure**: Match imports, header constants (`extraEnvSettings`, `electronMainFilePath`, `faFrontendRenderTimer`, `selectorList`), JSDoc per test, inline `// Prepare` / `// Check` / `// Close the app` comments, and `electron.launch` / `electronApp.close()` flow — see [`.cursor/rules/playwright-tests.mdc`](../../rules/playwright-tests.mdc) and any existing test beside the component.
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

- `yarn testbatch:ensure` runs **lint + types + style + unit + production build + Playwright component + Playwright E2E** in one chain (see **[testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)** for when to split commands across terminals instead).

## Checklist when changing UI or Electron shell

1. **Quality gate** in one terminal: `yarn testbatch:verify` — fix issues per [eslint-typescript.mdc](../../rules/eslint-typescript.mdc) ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)).
2. Rebuild: `yarn quasar:build:electron` (or `quasar build -m electron`) — its own terminal.
3. `yarn test:components` / `yarn test:e2e` as needed — each in its own terminal; do not chain with `yarn quasar:build:electron` or with each other in one line, unless you intentionally run `yarn testbatch:ensure`.

## Choosing Vitest vs Playwright in renderer work

- Prefer Vitest when validating pure/data/state behavior in `src/` and keep assertions deterministic.
- Prefer Playwright when validating user-facing interaction flow, full component rendering behavior, or anything relying on the built Electron app runtime.

## Storybook smoke checks (component authoring support)

- Storybook commands: `yarn storybook:run` (interactive) and `yarn storybook:smoke` / `storybook dev --smoke-test --ci` (startup verification).
- **Visual regression (Playwright + static Storybook)**: after `yarn storybook:build`, run `yarn visual:storybook:test` from the repo root, or `yarn --cwd .storybook-workspace storybook:visual:test` if `storybook-static/` is already present. Update baselines with `yarn visual:storybook:update` (or workspace `storybook:visual:update`). HTML/report output stays under repo-root `test-results/storybook-visual-*` for CI artifacts.
- Keep **component** Storybook stories colocated as `src/components/**/<Component>.stories.ts`.
- **`src/layouts/**` and `src/pages/**` stories** (if present) are canvas-only previews; do **not** expect or add Storybook Docs/autodocs for them (see [`storybook-stories.mdc`](../../rules/storybook-stories.mdc)).
- When components rely on i18n-backed markdown docs, avoid importing full locale roots in Storybook mocks; use focused `T_*` translation module imports plus placeholder `documents.*` strings to prevent markdown import-analysis failures.
