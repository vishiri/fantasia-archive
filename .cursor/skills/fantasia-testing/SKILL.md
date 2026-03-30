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

- **Command**: `yarn test:unit` (alias: `vitest run`).
- **Machine-readable report**: JSON output at `test-results/vitest-report/test-results-vitest.json`.
- **Scope**: Logic in `src/` and `src-electron/` (including main-process modules) with `*.vitest.test.ts` co-located under `tests/` folders where present.
- **Style**: Flat `test` / `test.skip` only (no `describe`), JSDoc above each test naming the function under test, titles like `Test that ...` — see `src-electron/**/tests/*.vitest.test.ts` and the vitest rule above.
- **Typing**: Avoid `any` in test code and fixtures; use concrete interfaces, inferred literals, or `unknown` narrowed before assertion/use.
- **Shared type naming**: Preserve project naming conventions for imported types (`I_` interfaces, `T_` aliases) and prefer descriptive names such as `I_appMenuList` / `T_dialogName`.

## Playwright (component + E2E)

**Critical**: Playwright targets a **built, production** Electron app. After **any** source change affecting what tests exercise, run `quasar build -m electron` (or `yarn build`) before Playwright.

### Config highlights (`playwright.config.ts`)

- `testMatch`: `**/*playwright.@(spec|test).?(c|m)[jt]s?(x)`
- `workers: 1`, `fullyParallel: false` — assume sequential, single-worker runs unless you change config.

### Component tests

- **Structure**: Match imports, header constants (`extraEnvSettings`, `electronMainFilePath`, `faFrontendRenderTimer`, `selectorList`), JSDoc per test, inline `// Prepare` / `// Check` / `// Close the app` comments, and `electron.launch` / `electronApp.close()` flow — see [`.cursor/rules/playwright-tests.mdc`](../../rules/playwright-tests.mdc) and any existing test beside the component.
- **Typing**: Keep selectors, props payloads, and helper arguments strongly typed; avoid `any`.

- **Command**: `yarn test:component`
- **Location**: Under `src/components/`, files ending in `.playwright.test.ts` (often in a `tests/` subfolder next to the component).
- **Single test**: `yarn test:componentSingle --component=FOLDER_NAME` (see `package.json` for Windows `%npm_config_*%` variants).
- **Interactive picker**: `yarn test:componentList` → runs `testRunner_component.mjs` (discovers `*.playwright.test.ts` under `src/components/`).

### E2E tests

- **Structure**: Same Playwright rule as components; e2e files use `TEST_ENV: 'e2e'`, may use numeric `faFrontendRenderTimer`, and sometimes `getByText` with visible labels — see `e2e-tests/*.playwright.spec.ts` in the repo.

- **Command**: `yarn test:e2e`
- **Location**: `e2e-tests/*.playwright.spec.ts`
- **Single spec**: `yarn test:e2eSingle --spec=SPEC_FILE_NAME` (see `package.json`).
- **Interactive picker**: `yarn test:e2eList` → `testRunner_e2e.mjs`

### Full suite

- `yarn test:full` runs Vitest and Playwright together (still respect Playwright build requirement).

## Checklist when changing UI or Electron shell

1. `yarn lint` (and fix ESLint/Vue issues).
2. `yarn test:unit` for covered logic.
3. Rebuild: `yarn build` (or `quasar build -m electron`).
4. `yarn test:component` / `yarn test:e2e` as needed.
