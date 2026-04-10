# Fantasia Archive (fantasia-archive)

A worldbuilding database manager

Use Yarn 1.22.19, or things may become unstable.

Use **Node.js 22.22.0 or newer** (`package.json` `engines.node`: `>=22.22.0`; Quasar `@quasar/app-vite` v2 enforces this minimum). `nvm` / `fnm` work well to pin the version (for example **22.22** to match CI in `.github/workflows/build.yml`).

> Playwright tests run from a built, live version of FA. Therefore, to run them, you need to locally build the app on your machine first - both the first time you use them and every time something is changed in the source code.

## Install Quasar CLI for the smoothest experience
##### Details found here: https://quasar.dev/start/quasar-cli

##### Ensure that the Yarn global install location is in your PATH after installation (details in the article linked above).

```
yarn global add @quasar/cli
```

## Install the dependencies and set up the project
```
yarn
```

**Git hooks**: **`yarn`** runs **`husky`** (**`prepare`** in **`package.json`**) and installs **`.husky/commit-msg`**, which enforces conventional commit messages via **`commitlint`** (**`commitlint.config.mjs`** — same types as [AGENTS.md](AGENTS.md) **Git commits**). To bypass a hook in an emergency, use **`git commit --no-verify`** (use sparingly).

## Contributing

Fork and pull-request workflow, required **PR labels** (`novisualchange` / `visualchange`), Storybook VRT baselines on forks, and **maintainer** GitHub **Actions** settings are documented in [CONTRIBUTING.md](CONTRIBUTING.md).

## Architecture (quick reference)

- **UI**: Vue 3 + Quasar 2 (`src/`)
- **Scroll layout**: global class **`hasScrollbar`** ([`src/css/globals/scrollbar.scss`](src/css/globals/scrollbar.scss)) — add to scroll containers that may gain or lose a vertical scrollbar so **`scrollbar-gutter: stable`** avoids horizontal layout shift; see [AGENTS.md](AGENTS.md) and [`.cursor/rules/project-scss.mdc`](.cursor/rules/project-scss.mdc).
- **Theme tokens**: shared colors, lengths, and related SCSS variables are catalogued in [`src/css/quasar.variables.scss`](src/css/quasar.variables.scss); names use a camelCase block plus **hyphen-separated** segments (no underscores in **`$` identifiers**). Conventions are in [`.cursor/rules/project-scss.mdc`](.cursor/rules/project-scss.mdc) and [AGENTS.md](AGENTS.md).
- **Desktop shell**: Electron (`src-electron/`)
- **Renderer sandbox**: The main [`BrowserWindow`](src-electron/mainScripts/windowManagement/mainWindowCreation.ts) uses **`webPreferences.sandbox: true`**, **`contextIsolation: true`**, and **`nodeIntegration: false`** (see Electron [Process Sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox) and [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)). Anything that needs **`shell`**, **`fs`**, or path resolution beyond the sandboxed preload allowance runs in **main** and is exposed over **IPC** (for example harness env via **`registerFaExtraEnvIpc`**, external URLs via **`registerFaExternalLinksIpc`**).
- **Main ↔ preload IPC**: Channel name strings are defined once in [`src-electron/electron-ipc-bridge.ts`](src-electron/electron-ipc-bridge.ts) (grouped `export const` objects). Preload helpers under `contentBridgeAPIs/` and main-process registration under [`mainScripts/ipcManagement/register*Ipc.ts`](src-electron/mainScripts/ipcManagement/) import from that module so `ipcRenderer` calls and `ipcMain` handlers stay aligned.
- **IPC style (async first)**: Prefer **async** IPC — `ipcMain.handle` with `ipcRenderer.invoke` and Promise-returning preload APIs — whenever the call path can tolerate it. **Synchronous** `sendSync` / blocking one-way patterns are **not forbidden** but are a **last resort**; avoid them whenever a remotely reasonable async design exists, and document any exception with a short comment near the handler or in review.
- **IPC payload validation (runtime)**: TypeScript types do not enforce shapes on values crossing `ipcMain.handle` / `invoke`. For **structured** payloads (objects with known fields), validate in **main** with **Zod** before persisting or acting: colocate schemas under `src-electron/shared/` (see [`faUserSettingsPatchSchema.ts`](src-electron/shared/faUserSettingsPatchSchema.ts) and [`registerFaUserSettingsIpc.ts`](src-electron/mainScripts/ipcManagement/registerFaUserSettingsIpc.ts)). Use **`.strict()`** (or equivalent) to reject unknown keys; derive key sets from shared defaults when possible so validation stays aligned with `cleanupFaUserSettings` and `FA_USER_SETTINGS_DEFAULTS`. For a **single scalar** (for example one URL string), a `typeof` check plus a domain-specific predicate (for example [`checkIfExternalUrl`](src-electron/shared/faExternalUrlPredicate.ts) in [`registerFaExternalLinksIpc.ts`](src-electron/mainScripts/ipcManagement/registerFaExternalLinksIpc.ts)) can stay as-is unless a schema materially clarifies the contract. **`zod`** is a production **`dependencies`** entry so the main bundle can load it. See [AGENTS.md](AGENTS.md) **Extending Electron APIs** and `.cursor/skills/fantasia-electron-main/SKILL.md`.
- **Main process (`mainScripts/`)**: Logic is grouped under **`appIdentity/`** (app name and Playwright-isolated `userData`), **`windowManagement/`** (main `BrowserWindow`, spell checker, and **`electron-preload` path** resolved from the **bundled** main chunk — required for `contextBridge` / `window.faContentBridgeAPIs`), **`chromiumFixes/`** (Chromium/DevTools workarounds), **`userSettings/`** (defaults + `electron-store`), **`nativeShell/`** (menu/OS tweaks), and **`ipcManagement/`** (preload channel handlers). [`appManagement.ts`](src-electron/mainScripts/appManagement.ts) composes startup; [`electron-main.ts`](src-electron/electron-main.ts) wires the ordered bootstrap.
- **State and routing**: Pinia + Vue Router
- **i18n**: vue-i18n (repo-root **`i18n/`**)
- **Tests**: Vitest (unit) + Playwright (component and E2E). Vitest workspace entry is [`vitest.config.mts`](vitest.config.mts); per-project configs, shared coverage defaults, and [`vitest/vitest.setup.ts`](vitest/vitest.setup.ts) live under [`vitest/`](vitest/) (not under **`helpers/`**). **Coverage tiers** for **`src-electron`**, **`helpers`**, **`src`** **`.ts`**, and **`.vue`** SFCs are summarized under **Quality gate** and **Scripts reference** below.
- **Component docs**: Storybook 10 (in `.storybook-workspace/`)
- **Component size and `scripts/`**: Vue SFCs must stay **≤250 lines**; TypeScript modules (non-exempt) **≤200 lines**; single functions **≤50 lines** — enforced by ESLint ([`.cursor/rules/code-size-decomposition.mdc`](.cursor/rules/code-size-decomposition.mdc)). When a dialog or other feature would exceed limits, extract logic under `src/components/<bucket>/<Feature>/scripts/*.ts` and/or split **subcomponents** in the same folder. Pulling `<style>` into a separate file is a **last resort** and needs **explicit maintainer approval** in the session where it is done.
- **Harness helpers (`helpers/`)**: Cross-cutting modules used by Playwright (and similar runners) live under top-level **`helpers/`** in named packages (today: [`helpers/playwrightHelpers/`](helpers/playwrightHelpers/)). Colocate **`_tests/*.vitest.test.ts`** next to that code; **`yarn test:unit`** runs them as Vitest project **`unit-helpers`** via **`helpers/**/*.vitest.test.ts`** in **`vitest/vitest.helpers.config.mts`** (no manual include list per file). Shared Vitest workspace configs and **`vitest.setup.ts`** live under repo-root **`vitest/`** so they are not part of the strict **`helpers/**/*.ts`** coverage gate; the repo root keeps **`vitest.config.mts`** as the multi-project entry. Add or update those Vitest files whenever you add or materially change helper logic. Specs import helpers with the **`app`** alias (for example **`app/helpers/playwrightHelpers/playwrightElectronRecordVideo`**). Strings or constants helpers must share with Electron main belong in **Electron-free** modules (for example **`src-electron/mainScripts/appIdentity/playwrightIsolatedUserDataDirName.ts`**) so Node-side loading never pulls in **`import`** from **`electron`** (see **Electron `userData` isolation** below). Do **not** put Playwright-only harness packages under **`src/`**; keep them under repo-root **`helpers/`** so **`unit-helpers`** stays scoped and **`src/`** stays app code.
- **Repository root**: Keep the repo root for configuration (**`package.json`**, **Quasar** / **Vite** / **TypeScript** / **ESLint** configs, **`vitest.config.mts`**, **`playwright.config.ts`**, **`index.html`**), the **`vitest/`** Vitest workspace folder, **`README`**, lockfiles, and the existing **`scripts/`** automation folder. Avoid adding new standalone functional **`.ts`** modules at the root; add new harness packages as subfolders under **`helpers/`** (same pattern as **`helpers/playwrightHelpers/`**).

### Renderer components (`src/components/`)

Features are grouped for navigation (each still has colocated `_tests/`, optional `_data/`, and optional `scripts/`):

| Subfolder | Contents |
| --- | --- |
| `dialogs/` | Modal dialog SFCs (`Dialog*` components). |
| `globals/` | App-chrome pieces reused across layouts (`GlobalWindowButtons`, `AppControlMenus`, `AppControlSingleMenu`). |
| `elements/` | Small reusable leaf widgets (`FantasiaMascotImage`, `SocialContactSingleButton`). |
| `other/` | Other composite or miscellaneous features (`SocialContactButtons`). |
| `foundation/` | Design-time **Storybook** catalogues only (typography, theme colors). Not product routes; no **`i18n/`** modules; no Playwright component specs; stories use **`tags: ['skip-visual']`** so VRT skips them. See **Foundation components** in [AGENTS.md](AGENTS.md). |

### i18n (localisation)

Locale strings live under `i18n/en-US/` in a fixed folder hierarchy:

| Folder | Purpose |
| --- | --- |
| `documents/` | Markdown source files (`.md`, imported with `?raw`, passed through `specialCharacterFixer`) |
| `components/<bucket>/<ComponentName>/` | Same bucket names as `src/components/` (`globals`, `elements`, `other`; **`foundation/`** has no locale tree — Storybook-only). One or more `L_*.ts` locale modules per mirrored component |
| `dialogs/` | One `L_<DialogName>.ts` per dialog |
| `pages/` | One `L_<PageName>.ts` per page |
| `globalFunctionality/` | One `L_<feature>.ts` per app-wide, non-component concern (e.g. Pinia store notifications) |

`i18n/en-US/index.ts` composes the full locale tree; it contains only imports and the export object — no hardcoded strings.

**Key naming**: all top-level keys use camelCase with a lowercase first letter (e.g. `globalWindowButtons`, `appControlMenus`, `dialogs`, `errorNotFound`). Sub-keys follow the same rule.

**Using strings**:
- Vue templates: `$t('topLevelKey.subKey')`.
- TypeScript scripts and Pinia stores: `import { i18n } from 'app/i18n/externalFileLoader'` then `i18n.global.t('topLevelKey.subKey')`.

**Adding new strings**: create or update the appropriate `L_*.ts` locale file, then import and register it in `index.ts` under a camelCase key. Never add hardcoded prose inline to `index.ts`. (TypeScript type aliases keep the separate `T_` prefix in code; `L_` is only for vue-i18n message modules.)

### Start the app in Quasar development mode (hot-code reloading, error reporting, etc.)
```
quasar dev -m electron
```

Or via `package.json`:

```
yarn quasar:dev:electron
```

### Build the app for production
```
yarn quasar:build:electron
```

For a **quieter** run (one success line; full stdout/stderr captured to **`test-results/quasar-build-electron-last.log`**, printed on failure), use **`yarn quasar:build:electron:summarized`**. The **`yarn testbatch:ensure:*`** scripts use the summarized build so long chained runs stay readable.

### Storybook (Vue components)

Use Storybook to develop/document renderer components in isolation.

```
yarn storybook:run
```

To run **Electron** dev and **Storybook** together in **one** terminal (prefixed logs; if either process exits, the other is stopped), use **`yarn app:dev`**. You can still run **`yarn quasar:dev:electron`** and **`yarn storybook:run`** in two terminals instead if you prefer separate windows.

Build static Storybook output (**`--quiet --loglevel warn`** in the workspace script; interactive **`yarn storybook:run`** stays verbose):

```
yarn storybook:build
```

Stories live under `_tests/` subfolders as `*.stories.ts` (for example `src/components/**/_tests/*.stories.ts`, plus `src/layouts/**/_tests/*.stories.ts` and `src/pages/**/_tests/*.stories.ts` for canvas-only previews).

Visual regression checks with Playwright snapshots against Storybook:

```
yarn test:storybook:visual
```

Run with visible browser (non-headless):

```
yarn test:storybook:visual:headed
```

Approve/update the current visual baseline snapshots:

```
yarn test:storybook:visual:update
```

Update snapshots with visible browser:

```
yarn test:storybook:visual:update:headed
```

#### Integration gotchas (Storybook + Electron + Playwright)

- **Storybook** — Runs from [`.storybook-workspace/`](.storybook-workspace/) (nested Yarn project) on **Storybook 10** with **Vite 8**, aligned with the root Quasar app’s **`@quasar/app-vite`** v2 line. Config keeps `staticDirs` pointed at the repo [`public/`](public/) folder (and related Vite wiring) so asset paths match the Quasar app.
- **Electron** — The packaged renderer loads from `file://`. Root-relative `public/` URLs built from `import.meta.env.BASE_URL === '/'` can fail; prefer **relative** paths (e.g. `./images/...`) for those assets unless you control a real HTTP base.
- **Playwright** — Component and E2E tests drive the **built** app. Run `yarn quasar:build:electron` before `yarn test:components` / `yarn test:e2e` when you change sources those tests cover. Root **`playwright.config.ts`** uses the **`line`** terminal reporter (concise progress; failures in full). Their Electron **`userData`** lives under **`%APPDATA%/<package.json name>/playwright-user-data`** (here **`Roaming\fantasia-archive\playwright-user-data`**, not **`fantasia-archive-dev`**); each **`test.describe.serial`** group clears that folder in **`test.beforeAll`** via **`helpers/playwrightHelpers/playwrightUserDataReset.ts`** before that group’s launch. See **Electron `userData` isolation** under **Testing**. Screen recordings attach with the suite’s **`TestInfo`** in **`test-results/playwright-report/index.html`** (see **Playwright HTML report and screen recordings** under **Testing**); each run replaces that report folder.

#### Storybook workflow charter

Storybook is the first-stop UI quality gate for renderer components in this repo:

- Component development: iterate props/states quickly without full Electron boot.
- QA pre-check: validate visual/behavior regressions before Playwright/E2E runs.
- UX review: verify interaction and content edge-cases (including localization stress) in isolated stories.

#### Story naming taxonomy

Use the same story naming style across components for discoverability:

- `Default` for baseline rendering.
- `States/*` for deterministic state matrices (loading, empty, error, mode/flag variations).
- `Interactions/*` for `play`-driven interaction checks.
- `I18nStress/*` for localization expansion and markdown-heavy text pressure tests.

#### Story change policy

When a user-facing component changes, update its story variants in the same change scope:

- Keep `Default` aligned with the current baseline behavior.
- Add/update `States/*` when logic, data contracts, or conditional rendering changes.
- Add/update `Interactions/*` whenever controls, keyboard flow, or user actions change.

#### Storybook maintenance checklist

Run this checklist periodically (or before larger releases):

- Addons still load and match Storybook major/minor versions.
- Global decorators still provide valid Pinia/i18n/content-bridge mocks.
- Stories render with no broken controls/actions/docs panels.
- Localized stress stories still reflect realistic long/markdown-heavy content.

#### Story depth coverage tracking

Track story depth manually to prioritize upgrades:

| Coverage tier | Meaning | Priority |
| --- | --- | --- |
| Baseline | `Default` only | Upgrade next |
| Matrix | `Default` + `States/*` | Medium |
| Quality | Includes `Interactions/*` | High |
| Stress-tested | Includes `I18nStress/*` where applicable | Maintain |

Review this table against `src/components/**` stories each iteration and move highest-risk user-facing components toward at least **Quality** coverage.

#### Storybook visual baseline policy

- Storybook **static build** output and **Playwright** visual config live in [`.storybook-workspace/`](.storybook-workspace/): `storybook-static/` (from `yarn storybook:build`) and [`playwright.storybook-visual.config.ts`](.storybook-workspace/playwright.storybook-visual.config.ts). Root `yarn test:storybook:visual*` runs the build then delegates to `yarn --cwd .storybook-workspace test:storybook:visual*`. Set **`FA_STORYBOOK_VISUAL_VERBOSE=1`** if you need per-story **`[storybook-visual]`** progress lines in the terminal (default is quiet aside from warnings/errors).
- Baselines live in [`.storybook-workspace/visual-tests/`](.storybook-workspace/visual-tests/) under `*.visual.playwright.test.ts-snapshots/`.
- Use `yarn test:storybook:visual:update` only when UI changes are intentional and approved.
- When snapshots change in a pull request, reviewers should inspect the committed image diffs (and local **`yarn test:storybook:visual`** / HTML report under **`test-results/storybook-visual-*`**) before accepting baseline updates.
- Keep snapshot updates scoped to affected stories/components; avoid broad regenerate-all updates unless there is a framework/theme-wide reason.
- First-time local setup: install nested workspace deps (`yarn --cwd .storybook-workspace install` — CI does this too), then browser binaries (for example `yarn playwright install chromium` from the **repo root** for Electron Playwright; the same cache is used for Storybook VRT).
- **`toHaveScreenshot` `maxDiffPixels`** (in [`.storybook-workspace/visual-tests/storybook.visual.playwright.test.ts`](.storybook-workspace/visual-tests/storybook.visual.playwright.test.ts)): Playwright counts how many **pixels differ** between the committed baseline PNG and the new capture (per-pixel color uses a small tolerance). That number is **not** image width—it is a cap over the **whole** screenshot. Large iframes have on the order of **hundreds of thousands** of pixels, so a cap around **two thousand** differing pixels is still a **small fraction** of the image and mainly absorbs **font rasterization**, **subpixel antialiasing**, and **Chromium** differences between your machine and **GitHub Actions** **`windows-latest`** when both use committed **`-chromium-win32.png`** baselines. Real layout or copy changes usually exceed that budget quickly. If **`yarn test:storybook:visual`** is green locally but **`yarn testbatch:ensure:nochange`** fails on **GitHub** with messages like **`N pixels ... are different`** where **N** is just above the configured cap, treat it as **environment drift** first: inspect CI **actual** / **diff** attachments, then either raise **`maxDiffPixels`** with a comment citing the observed **CI** **N** (last resort) or regenerate baselines with **`yarn test:storybook:visual:update`** on **Windows** when the visual change is intentional. See [AGENTS.md](AGENTS.md) **Storybook expectations** and [.cursor/skills/fantasia-testing/SKILL.md](.cursor/skills/fantasia-testing/SKILL.md).
- The following Storybook utility previews are intentionally excluded from visual snapshots because they are Playwright harness routes and do not represent meaningful visual-regression targets: `layouts-componenttestinglayout--with-social-contact-single-button`, `pages-componenttesting--social-contact-single-button`.

### Quality gate (before commit or release)

Run ESLint, the TypeScript project check (`vue-tsc`, includes `.vue` SFCs), Stylelint, and Vitest with coverage in one shot (stops on the first failure). **Coverage tiers:** **100%** on all four v8 metrics for **`src-electron`**, for **`helpers/**/*.ts`**, and for scoped **`i18n/`** sources (**`yarn test:coverage:i18n`** / **`unit-i18n`**); **100%** on all four metrics for renderer **`.ts`** under **`src/boot`**, **`src/scripts`**, and **`src/stores`**; **100%** statements, functions, and lines for other **`src/**/*.ts`** files collected under **`unit-components`** (branch totals are printed but do not fail CI for that slice—**v8** can count structural branch edges oddly on some loops). **`.vue`** SFCs have **no** failing threshold; reports use **watermarks** with a **60%** lower band—treat line or statement totals **below 60%** as a signal to investigate and add tests when it makes sense. See **`yarn test:coverage:verify`**, **`yarn test:coverage:i18n`**, and [vitest/](vitest/) configs. Vitest coverage runs use the **`agent`** terminal reporter (see [vitest/vitest.reporters.shared.ts](vitest/vitest.reporters.shared.ts)) so passing tests do not flood the log; JSON reports still write under **`test-results/vitest-report/`** (for example **`test-results-vitest-electron.json`**).

```
yarn testbatch:verify
```

**Changelog-only commits:** If you are committing **only** edits to per-locale in-app changelog files **`i18n/*/documents/changeLog.md`** (for example **`i18n/en-US/documents/changeLog.md`** and **`i18n/fr/documents/changeLog.md`**) **after** you already ran **`yarn testbatch:verify`** successfully on the substantive work and nothing else is dirty, you may skip running the gate again right before that commit. If the situation is **uncertain** (mixed files, unclear history), run **`yarn testbatch:verify`** anyway. See [`.cursor/rules/testing-terminal-isolation.mdc`](.cursor/rules/testing-terminal-isolation.mdc) and [`.cursor/rules/git-conventional-commits.mdc`](.cursor/rules/git-conventional-commits.mdc).

For debugging a single step, run `yarn lint:eslint`, `yarn lint:typescript`, `yarn lint:stylelint`, `yarn test:unit` (no coverage), or `yarn test:coverage:verify` / `yarn test:coverage:electron` / `yarn test:coverage:helpers` / `yarn test:coverage:i18n` / `yarn test:coverage:src` on its own, then run `yarn testbatch:verify` again before committing. Do not append `yarn quasar:build:electron`, Playwright, or Storybook smoke/visual commands to the same shell line as `yarn testbatch:verify` unless you intentionally run **`yarn testbatch:ensure:nochange`** or **`yarn testbatch:ensure:change`**.

On **Yarn 1.x**, `yarn check` is a different built-in (dependency-tree validation); use **`yarn testbatch:verify`** for this gate.

#### GitHub Actions vs local full gate

The **Verify** workflow (`.github/workflows/verify.yml`) runs **`yarn testbatch:verify`** only (lint, types, stylelint, Vitest coverage with the full **`src-electron`**, **`helpers`**, **`i18n/`**, and **`src`** TypeScript gates described above—**Vue** SFCs still have no failing threshold). It installs **`.storybook-workspace`** dependencies so ESLint can resolve that tree. It does **not** run **`yarn quasar:build:electron`**, Playwright component/E2E, **`yarn test:storybook:smoke`**, or **`yarn test:storybook:visual`**. For Storybook VRT and the full chained gate, run **`yarn test:storybook:visual`** / **`yarn testbatch:ensure:nochange`** locally (or the individual commands in separate terminals per [testing-terminal-isolation](.cursor/rules/testing-terminal-isolation.mdc)).

### Full suite gates (everything + Storybook)

Run **`yarn testbatch:verify`**, **`yarn quasar:build:electron:summarized`**, Playwright component + E2E, Storybook smoke, then Storybook visual regression — in one chain:

**Compare against committed Storybook VRT snapshots** (default full gate; fails if snapshots drift):

```
yarn testbatch:ensure:nochange
```

**Refresh Storybook VRT baselines** after approved UI changes (writes new snapshots; review and commit diffs):

```
yarn testbatch:ensure:change
```

### Testing

#### Unit test - via Vitest

Use Vitest for deterministic unit logic in both app layers: renderer code under `src/` (boot, scripts, stores, extracted component **`.ts`** and shallow-mounted **`.vue`** files), repo-root **`i18n/`** (vue-i18n registry and helpers), Electron/runtime code under `src-electron/`, and Playwright harness code under **`helpers/`**. The default [vitest.config.mts](vitest.config.mts) sets the repo **`root`** and lists five projects that each **`extends`** a file under [vitest/](vitest/): [vitest.electron.config.mts](vitest/vitest.electron.config.mts) (**unit-electron**), [vitest.src-renderer.config.mts](vitest/vitest.src-renderer.config.mts) (**unit-src-renderer**), [vitest.helpers.config.mts](vitest/vitest.helpers.config.mts) (**unit-helpers**), [vitest.i18n.config.mts](vitest/vitest.i18n.config.mts) (**unit-i18n**), [vitest.components.config.mts](vitest/vitest.components.config.mts) (**unit-components**). See [AGENTS.md](AGENTS.md) and [.cursor/rules/vitest-tests.mdc](.cursor/rules/vitest-tests.mdc) for the same **coverage tier** rules the CI gate enforces.

```
yarn test:unit
```

Coverage mirrors CI when you run **`yarn test:coverage:verify`** (same chain as the end of **`yarn testbatch:verify`**). Scan the **`unit-components`** table for **`.vue`** rows under **60%** lines or statements when you touch those SFCs; **`unit-src-renderer`**, **`unit-i18n`**, and **`unit-components`** **`.ts`** rows should stay at **100%** on the enforced metrics.

#### Component test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.

Use Playwright component/E2E tests for rendered behavior and integration flows that rely on the built app runtime.

**Electron `userData` isolation:** Specs set **`TEST_ENV`** to **`components`** or **`e2e`**. The main process then uses **`userData`** under **`%APPDATA%/<package.json name>/playwright-user-data`** (for this repo: **`…\Roaming\fantasia-archive\playwright-user-data`**, not inside **`fantasia-archive-dev`**). The folder name is **`PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME`** in **`src-electron/mainScripts/appIdentity/playwrightIsolatedUserDataDirName.ts`** (shared with **`appIdentity/fixAppName.ts`**, which applies it in Electron). **`electron-store`** and other persisted **`userData`** files from tests live there so they do not overlap **`quasar dev`** (which uses **`…\fantasia-archive-dev`** when **`DEBUGGING`** is set) or a normal packaged run. Component and E2E specs group tests in **`test.describe.serial`**; each group’s **`test.beforeAll`** calls **`resetFaPlaywrightIsolatedUserData()`** from **`helpers/playwrightHelpers/playwrightUserDataReset.ts`** **before** the group’s single **`electron.launch`**, so disk matches that session (do not reset in **`beforeEach`** while the same Electron app stays open). Rebuild Electron after changing **`appIdentity/fixAppName`** so Playwright picks up the main-process logic. Structure and video teardown are documented in **`.cursor/rules/playwright-tests.mdc`**.
```
yarn test:components
```

**Locators (component and E2E specs):** Prefer stable hooks from `.vue` templates — **`data-test-locator`** for primary ids plus any other `data-test-*` attributes the component defines — and centralize values in each spec’s `selectorList` (see `.cursor/rules/playwright-tests.mdc`). Do **not** use bare `data-test`. Rare exceptions (for example Quasar portaled tooltips with no project hook on the overlay) still use a **named `selectorList` entry whose value is the full locator string** (such as `quasarTooltip: '[role="tooltip"]'`), not an inline literal in the test. For many identical tooltips, duplicate the tooltip string on the trigger (for example `data-test-tooltip-text` on a help icon) for fast assertions, and keep at least one hover-based tooltip check per suite so real display stays verified.

#### Component list test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.

> Opens a CLI prompt listing available component tests (labels **`dialogs/…`**, **`elements/…`**, **`globals/…`**, **`other/…`**, **`foundation/…`** when present — same buckets as **`src/components/`**). **`foundation/`** features do not ship **`*.playwright.test.ts`** files by policy.
```
yarn test:components:list
```

#### Component single test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.
```
yarn test:components:single --component=dialogs/DialogProgramSettings
```

> **`--component`** is the path under **`src/components/`** to the feature folder: **`<bucket>/<ComponentName>`** (for example **`elements/ErrorCard`**), matching the Storybook **`meta.title`** segment after **`Components/`** ( **`Components/<bucket>/<ComponentName>`** ).

#### E2E test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.
```
yarn test:e2e
```

#### E2E list test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.

> Opens a CLI prompt listing available E2E tests.
```
yarn test:e2e:list
```

#### E2E single test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.
```
yarn test:e2e:single --spec=SPEC_FILE_NAME
```

#### Playwright HTML report and screen recordings (Electron component + E2E)

Each Electron component and E2E Playwright **serial suite** (**`test.describe.serial`**) records a **WebM** screen capture (full HD by default) and attaches it via that suite’s **`TestInfo`** (one attachment per group launch, not per nested **`test`** step). After **`yarn test:components`**, **`yarn test:e2e`**, or the matching **`:single`** / **`:single:ci`** scripts, open **`test-results/playwright-report/index.html`** in a browser, open a test, and use the **Attachments** section to play or download the video. The report bundles playable files under **`test-results/playwright-report/data/`** (hashed names).

**Lifecycle:** Every Playwright run **regenerates** **`test-results/playwright-report/`** (and its **`data/`** tree). Running component tests and then E2E tests (or the reverse, or the same suite again) **replaces** the previous report—there is no merge of old and new runs. The **`yarn test:components`** and **`yarn test:e2e`** scripts run through **`scripts/playwrightWithArtifactTrim.mjs`**, which deletes **`test-results/playwright-artifacts`** after the run so intermediate attachment copies are not kept on disk; only the HTML report folder remains useful for videos. If you invoke **`playwright test`** directly without that wrapper, **`test-results/playwright-artifacts`** may persist until you remove it.

Set environment variable **`FA_PLAYWRIGHT_NO_VIDEO`** to **`1`** or **`true`** to skip recording and attachment scanning (faster local iterations).

**Synthetic cursor in videos:** Specs call **`installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)`** (from **`helpers/playwrightHelpers/playwrightElectronRecordVideo.ts`**) right after **`electronApp.firstWindow()`** so WebM captures include a high-contrast dot that tracks Playwright-driven pointer position (the real OS cursor is often missing from window-buffer video). Set **`FA_PLAYWRIGHT_CURSOR_MARKER`** to **`0`** or **`false`** to turn that overlay off while keeping **`recordVideo`** enabled.

**Note for tooling and assistants:** Automated models generally **cannot reliably “watch”** binary video the way a human does in a browser; treat **`test-results/playwright-report/index.html`** as the human-facing index of per-test recordings, and point people (or specialized video-aware tools) there rather than expecting inference from raw **`.webm`** bytes alone.

#### One-shot verification (full project gate)

**`yarn testbatch:ensure:nochange`** runs **`yarn testbatch:verify`**, **`yarn quasar:build:electron:summarized`**, **`yarn test:components`**, **`yarn test:e2e`**, **`yarn test:storybook:smoke`**, and **`yarn test:storybook:visual`** in sequence—the intentional way to chain lint, unit tests, build, both Playwright suites, and Storybook smoke plus snapshot compare. **`yarn testbatch:ensure:change`** is the same through smoke, then **`yarn test:storybook:visual:update`** instead of compare; use only when you mean to regenerate baselines. For lighter checks, run **`yarn test:unit`** and individual commands in their own terminals (see [testing-terminal-isolation](.cursor/rules/testing-terminal-isolation.mdc) in this repo).

### Scripts reference (`package.json`)

| Script | Purpose |
| --- | --- |
| `yarn quasar:build:electron` | Build/package the Electron app (`--publish never`; full log stream). |
| `yarn quasar:build:electron:summarized` | Same build via **`scripts/quasarBuildElectronSummarized.mjs`**: quiet success line; full log in **`test-results/quasar-build-electron-last.log`** (dumped on failure). |
| `yarn quasar:dev:electron` | Run the app in Quasar Electron development mode. |
| `yarn app:dev` | Run **`quasar:dev:electron`** and **`storybook:run`** in parallel via **`concurrently`** (one terminal, labeled streams; **`-k`** stops both if one exits). |
| `yarn lint:eslint` | Run ESLint on project source/config paths. |
| `yarn lint:stylelint` | Run Stylelint on Vue/CSS/SCSS/Sass under `src/` and Storybook config under `.storybook-workspace/.storybook/`. |
| `yarn lint:stylelint:fix` | Same paths as `lint:stylelint` with `--fix` (alphabetical declarations, including inside Vue `<style>` blocks). |
| `yarn lint:typescript` | Run TypeScript project check (`vue-tsc`, no emit; covers `<script setup>` in SFCs). |
| `yarn testbatch:verify` | Quick gate: lint + typecheck + stylelint + Vitest coverage (**100%** on **`src-electron`** and **`helpers`**; **`src`** **`.ts`** per [vitest/](vitest/) rules; **`.vue`** watermarks only). |
| `yarn testbatch:ensure:nochange` | Full gate: `testbatch:verify` + `quasar:build:electron:summarized` + Playwright component + E2E + Storybook smoke + `test:storybook:visual` (snapshot compare). |
| `yarn testbatch:ensure:change` | Same through smoke, then `test:storybook:visual:update` (refresh VRT baselines; use only when intentional). |
| `yarn test:unit` | Run Vitest workspace (no coverage): **unit-electron**, **unit-src-renderer**, **unit-helpers**, **unit-components**. |
| `yarn test:coverage:verify` | Same coverage sequence as **`testbatch:verify`**: electron, helpers, then **`src`** renderer **`.ts`** (strict) + components (**`.ts`** strict on statements/functions/lines; **`.vue`** reported with **60%** watermarks). |
| `yarn test:coverage:electron` | Vitest coverage for **`src-electron`** only (100% on statements, branches, functions, lines). |
| `yarn test:coverage:helpers` | Vitest coverage for **`helpers/`** packages only (100% on all four metrics). |
| `yarn test:coverage:src` | Vitest **`unit-src-renderer`** then **`unit-components`**: enforced **`src`** **`.ts`** thresholds; **`.vue`** without failing gate. |
| `yarn test:unit:coverage` | Alias for **`yarn test:coverage:verify`**. |
| `yarn test:components` | Run all Playwright component tests (via `scripts/playwrightWithArtifactTrim.mjs`; see **Playwright HTML report and screen recordings** above). |
| `yarn test:components:single --component=...` | Run a single component Playwright test by path under **`src/components/`** (**`dialogs/`**, **`elements/`**, **`foundation/`**, **`globals/`**, or **`other/`** plus the feature folder; example **`elements/ErrorCard`**; same wrapper as `test:components`). **`foundation/`** has no Playwright specs by design. |
| `yarn test:components:single:ci --component=...` | Run a single component Playwright test by direct path (same wrapper). |
| `yarn test:components:list` | Open interactive picker for component Playwright tests. |
| `yarn test:e2e` | Run all Playwright E2E tests (same wrapper and report lifecycle as `test:components`). |
| `yarn test:e2e:single --spec=...` | Run one E2E spec by spec file name (same wrapper). |
| `yarn test:e2e:single:ci --spec=...` | Run one E2E spec by direct path (same wrapper). |
| `yarn test:e2e:list` | Open interactive picker for E2E tests. |
| `yarn test:storybook:smoke` | Run Storybook smoke check in CI-friendly mode. |
| `yarn test:storybook:visual` | Compare Storybook stories with committed Playwright visual snapshots. |
| `yarn test:storybook:visual:headed` | Run visual comparisons with a visible browser window. |
| `yarn test:storybook:visual:update` | Refresh Storybook visual snapshots after approved UI changes. |
| `yarn test:storybook:visual:update:headed` | Update visual snapshots with a visible browser window. |
| `yarn storybook:run` | Start Storybook from `.storybook-workspace`. |
| `yarn storybook:build` | Build static Storybook output into `.storybook-workspace/storybook-static/`. |

### Customize the configuration
See [The quasar.config file](https://quasar.dev/quasar-cli-vite/quasar-config-file) (this repo uses `quasar.config.ts`).

The repo tracks a minimal [`.quasar/tsconfig.json`](.quasar/tsconfig.json) so TypeScript and Vitest can resolve Quasar path aliases before your first `quasar dev` / `quasar prepare`. Those commands regenerate `.quasar` contents; if the file changes locally, prefer the generated output from your machine’s Quasar version.

### Native modules (better-sqlite3)

After changing **Electron** or **Node** versions, run a clean `yarn install` on your machine. If `better-sqlite3` fails to load in the packaged app, rebuild native addons for your Electron version (for example `npx electron-rebuild` in the project root) and retry `yarn quasar:build:electron`.

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
