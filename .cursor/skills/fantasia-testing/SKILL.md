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

Match **existing** tests when adding or editing:

- Vitest: [`vitest-tests.mdc`](../../rules/vitest-tests.mdc) (`**/*.vitest.test.ts`)
- Playwright: [`playwright-tests.mdc`](../../rules/playwright-tests.mdc) (`**/*playwright*.ts`)
- Vue template hooks: [`vue-template-test-hooks.mdc`](../../rules/vue-template-test-hooks.mdc) (`**/*.vue`)

## Connected tests for any feature change

Tests = **same deliverable** as production edits.

1. **Discover** — ripgrep component/dialog folder, helpers, **`data-test-locator`**, **`T_dialogName`**, **`COMPONENT_NAME`**, action/keybind ids, store symbols, **`i18n`** keys you changed. Follow imports + menu **`_data/`** entries.
2. **Vitest** — **`yarn vitest run`** with explicit paths for **every** matching **`*.vitest.test.ts`** (feature **`_tests/`**, **`scripts/_tests/`**, **`src/scripts/**/_tests`**, **`src/stores/_tests`**, **`src-electron/**/_tests`**, **`helpers/**/_tests`**, **`i18n/_tests`** when implicated). Before commits: **`yarn test:unit`** or **`yarn testbatch:verify`**.
3. **Playwright (component)** — each matching **`src/**/_tests/*.playwright.test.ts`**: **`yarn test:components:single --component=<bucket>/<ComponentFolder>`** or **`yarn test:components`** in **own** terminal **after** **`yarn quasar:build:electron`** when bundle exercises changed renderer code ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)).
4. **Playwright (E2E)** — each matching **`e2e-tests/*.playwright.spec.ts`**: **`yarn test:e2e:single --spec=…`** or **`yarn test:e2e`** with same rebuild rule.

**CI scope**: default **Verify** workflow runs **`yarn testbatch:verify`** only — not component/E2E Playwright. Run locally (or **`yarn testbatch:ensure:nochange`**) when feature touches those flows.

## Vitest coverage tiers (CI)

See [vitest-tests.mdc](../../rules/vitest-tests.mdc) **Vitest coverage tiers (CI)**: **99%** all metrics on **`src-electron`**; **99%** on **`helpers/**/*.ts`** that **`unit-helpers`** instruments (**`helpers/playwrightHelpers_*`** excluded); **99%** on **`unit-src-renderer`** **`src`** **`.ts`**; **99%** on scoped **`i18n/`** (**`unit-i18n`**); **99%** on **`unit-components`** **`.ts`** under **`src/components`**, **`src/layouts`**, **`src/pages`**; **`.vue`** SFCs — **~60%** watermarks only (**`src/components/foundation/**`** excluded). Configs: [**vitest/**](../../../vitest/); entry [**vitest.config.mts**](../../../vitest.config.mts).

## Unit tests (Vitest)

- **Commands**: **`yarn test:unit`** — multi-project root ([vitest.config.mts](../../vitest.config.mts): **`unit-electron`**, **`unit-src-renderer`**, **`unit-helpers`**, **`unit-i18n`**, **`unit-components`**) without coverage. **`yarn testbatch:verify`** ends with **`yarn test:coverage:verify`**. Debug slices: **`yarn test:coverage:electron`**, **`yarn test:coverage:helpers`**, **`yarn test:coverage:i18n`**, **`yarn test:coverage:src`**. Full tier detail: [vitest-tests.mdc](../../rules/vitest-tests.mdc).
- **Execution**: **`yarn test:unit`** while iterating; **`yarn testbatch:verify`** before commits ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)). Do not chain unit/coverage with `yarn quasar:build:electron` or Playwright in one shell line.
- **Reports**: `test-results/vitest-report/test-results-vitest-*.json` per project.
- **Scope**: `src/` + `src-electron/` with `*.vitest.test.ts` under `_tests/`; component mounts use `@vue/test-utils` + [vitest.setup.ts](../../../vitest/vitest.setup.ts).
- **`helpers/`**: **`playwrightHelpers_*`** = Playwright harness only — extend with **`yarn test:components`** / **`yarn test:e2e`** after **`yarn quasar:build:electron`**; **no** **`*.vitest.test.ts`** there. Non-Playwright **`helpers/<name>/`**: colocate **`_tests/*.vitest.test.ts`**.
- **SFC baseline**: one **`_tests/<Name>.vitest.test.ts`** per feature **`.vue`** under **`src/components/**`**, **`src/layouts/**`**, **`src/pages/**`**. Extracted **`scripts/*.ts`** → **`scripts/_tests/*.vitest.test.ts`** when real logic. Merge tests when merging modules ([code-size-decomposition.mdc](../../rules/code-size-decomposition.mdc)).
- **Return object literals**: same project-wide rule — identifiers/literals only in **`return { ... }`** ([code-size-decomposition.mdc](../../rules/code-size-decomposition.mdc)).
- **Floating `Window*` mounts**: stub **`FaFloatingWindowBodyTeleport`** or query **`document.body`** — see [fantasia-floating-windows](../fantasia-floating-windows/SKILL.md).
- **`_data/`**: production feeds only — no Vitest suites aimed only at **`_data/`**. Fixtures inline in test files; **no** **`_tests/_data/`**.
- **Style**: flat **`test`** / **`test.skip`** (no **`describe`**), JSDoc per test, titles **`Test that ...`** — see [vitest-tests.mdc](../../rules/vitest-tests.mdc).
- **Typing**: no **`any`**; use **`I_`** / **`T_`** naming for imported types.

## Playwright (component + E2E)

**Critical**: Playwright targets **built, production** Electron app. After **any** source change affecting exercised code: `quasar build -m electron` or **`yarn quasar:build:electron`** before Playwright. **Node.js 22.22.0+** locally.

**Stale packaged bundle** — Harness starts **`Fantasia Archive.exe`** from **`dist/electron/Packaged`**, not live Vite dev server. IPC still matching pre-change behavior → rebuild before next Playwright run.

**Electron `userData` isolation**: **`TEST_ENV`** **`components`** / **`e2e`** → **`%APPDATA%/<package.json name>/playwright-user-data`** (here: **`fantasia-archive/playwright-user-data`**, not **`fantasia-archive-dev`**). [`appIdentity_manager.ts`](../../../src-electron/mainScripts/appIdentity/appIdentity_manager.ts), [`playwrightIsolatedUserDataDirName.ts`](../../../src-electron/mainScripts/appIdentity/playwrightIsolatedUserDataDirName.ts), [`playwrightUserDataReset.ts`](../../../helpers/playwrightHelpers_universal/playwrightUserDataReset.ts). Specs use **`test.describe.serial`**; **`test.beforeAll`** **`await`**s **`launchFaPlaywrightComponentHarnessWindow`** / **`launchFaPlaywrightE2eAppWindow`** (owns **`resetFaPlaywrightIsolatedUserData()`** ordering — **not** in **`test.beforeEach`**). Helpers: **`helpers/playwrightHelpers_universal`** / **`_e2e`** / **`_component`**. No **`test.describe.parallel`** unless user asks.

### Playwright `keyboard.press` and app keybinds (cross-OS)

- **Module**: [`faPlaywrightKeyboardChords.ts`](../../../helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords.ts)
- **Defaults with `primary`**: use getters (**`getFaPlaywrightDefaultToggleDevtoolsPressString()`**, etc.) — not hardcoded **Control+F12** / **Meta+F12**.
- **Overrides storing `ctrl`**: physical **Control** on every OS — **`FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12`**, etc.
- **Monaco select all**: **`getFaPlaywrightMonacoSelectAllPressString()`**
- Full policy: [playwright-tests.mdc](../../rules/playwright-tests.mdc) **Keyboard strings**; product: [fantasia-keybinds](../fantasia-keybinds/SKILL.md).

### Cross-toolchain (Storybook + Electron)

- **Storybook** — [`.storybook-workspace/`](../../../.storybook-workspace/); **`staticDirs`** sync with Quasar **`public/`**. VRT: **`yarn test:storybook:visual*`** chains **`yarn storybook:build`**. Verbose: **`FA_STORYBOOK_VISUAL_VERBOSE=1`**.
- **Electron `file://`** — relative **`public/`** paths when **`BASE_URL`** is **`'/'`** or empty (see **`SocialContactSingleButton.vue`**).
- **Playwright** — same rebuild rule; flaky UI after green Storybook often = stale build or **`file://`** mismatch.
- **Storybook VRT** — **`EXCLUDED_STORY_IDS`** in **`.storybook-workspace/visual-tests/storybook.visual.playwright.test.ts`**; empty iframe root = failure unless **`tags: ['skip-visual-render-check']`** or excluded id. **`#storybook-root`** and **`#root`** checked separately.
- **VRT `maxDiffPixels`** — whole-image differing-pixel cap, not width. CI vs local: see **README** **Storybook visual baseline policy**, [storybook-stories.mdc](../../rules/storybook-stories.mdc).
- **Full suite** — **`yarn testbatch:ensure:nochange`** / **`yarn testbatch:ensure:change`** — see [testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc).

### Config highlights (`playwright.config.ts`)

- **`outputDir`**: `test-results/playwright-artifacts`. **`testMatch`**: `src/components/**`, `e2e-tests/**`. HTML: **`test-results/playwright-report`**. Yarn scripts trim artifacts via **`.utility-scripts/playwrightWithArtifactTrim.mjs`**.
- `workers: 1`, `fullyParallel: false`
- Serial suites: **`launchFaPlaywright*`** + **`tearDownFaPlaywrightElectronSerialSuite`**. Video: **`FA_PLAYWRIGHT_NO_VIDEO`**; cursor: **`FA_PLAYWRIGHT_CURSOR_MARKER=0`**.

### Videos and HTML report

- WebM attached per serial suite. Report **regenerates** each run — ephemeral. Agents: prefer user opens **`test-results/playwright-report/index.html`** over analyzing raw **`.webm`**.

### Component tests

- **Renderer readiness**: **`waitForFaRendererContentBridgeApis`** — not bare **`page.evaluate`** for bridge globals. E2E on **`#/`**: **`waitForFaE2eRendererDomReady`**.
- **Structure/locators/layout**: [playwright-tests.mdc](../../rules/playwright-tests.mdc)
- **Command**: `yarn test:components` — own terminal
- **Location**: `src/components/**/_tests/*.playwright.test.ts`
- **Single**: `yarn test:components:single --component=<bucket>/<ComponentName>`
- **Picker**: `yarn test:components:list`

### E2E tests

- **Structure**: same serial pattern; **`TEST_ENV: 'e2e'`**
- **Project management**: [`checkProjectManagementFlow.playwright.spec.ts`](../../../e2e-tests/checkProjectManagementFlow.playwright.spec.ts); path staging via **`playwrightE2eProjectPaths.ts`**
- **Command**: `yarn test:e2e` — own terminal
- **Single**: `yarn test:e2e:single --spec=<stem>` (no suffix) or **`yarn test:e2e:single:ci --spec=<full file>`**
- **Picker**: `yarn test:e2e:list`

### Full project gate

- **`yarn testbatch:ensure:nochange`** / **`yarn testbatch:ensure:change`** — see [testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)

## Checklist when changing UI or Electron shell

1. **`yarn testbatch:verify`** — one terminal
2. **Connected test sweep** — grep + run implicated Vitest, then Playwright after rebuild
3. **`yarn quasar:build:electron`** — own terminal
4. **`yarn test:components`** / **`yarn test:e2e`** as needed — own terminals
5. Storybook in scope: **`yarn test:storybook:smoke`** + **`yarn test:storybook:visual`** (or **`testbatch:ensure:*`**)

## Choosing Vitest vs Playwright

- **Vitest**: pure/data/state in `src/` — deterministic
- **Playwright**: user-facing interaction, full render, built Electron runtime

## Storybook smoke checks

- **`yarn storybook:run`**, **`yarn test:storybook:smoke`**
- VRT: **`yarn test:storybook:visual`** / **`:update`**
- Stories: `src/components/**/_tests/<Component>.stories.ts`, **`meta.title`** **`Components/<bucket>/<ComponentName>`**
- Layout/page stories: canvas-only, no Docs — [storybook-stories.mdc](../../rules/storybook-stories.mdc)
- Storybook mocks: focused **`L_*`** imports + **`externalFileLoader.ts`** placeholders — mirror new keys from **`i18n/en-US/index.ts`**

## Types

Shared types → **`types/`** (**`app/types/...`**). See [types-folder.mdc](../../rules/types-folder.mdc).
