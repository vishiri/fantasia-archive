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

## Architecture (quick reference)

- **UI**: Vue 3 + Quasar 2 (`src/`)
- **Desktop shell**: Electron (`src-electron/`)
- **Main ↔ preload IPC**: Channel name strings are defined once in [`src-electron/electron-ipc-bridge.ts`](src-electron/electron-ipc-bridge.ts) (grouped `export const` objects). Preload helpers under `contentBridgeAPIs/` and main-process registration under `mainScripts/register*Ipc.ts` import from that module so `ipcRenderer` calls and `ipcMain` handlers stay aligned.
- **State and routing**: Pinia + Vue Router
- **i18n**: vue-i18n (`src/i18n/`)
- **Tests**: Vitest (unit) + Playwright (component and E2E)
- **Component docs**: Storybook 10 (in `.storybook-workspace/`)

### i18n (localisation)

Locale strings live under `src/i18n/en-US/` in a fixed folder hierarchy:

| Folder | Purpose |
| --- | --- |
| `documents/` | Markdown source files (`.md`, imported with `?raw`, passed through `specialCharacterFixer`) |
| `components/<ComponentName>/` | One `T_<ComponentName>.ts` per component with user-visible strings |
| `dialogs/` | One `T_<DialogName>.ts` per dialog |
| `pages/` | One `T_<PageName>.ts` per page |
| `globalFunctionality/` | One `T_<feature>.ts` per app-wide, non-component concern (e.g. Pinia store notifications) |

`src/i18n/en-US/index.ts` composes the full locale tree; it contains only imports and the export object — no hardcoded strings.

**Key naming**: all top-level keys use camelCase with a lowercase first letter (e.g. `globalWindowButtons`, `appControlMenus`, `dialogs`, `errorNotFound`). Sub-keys follow the same rule.

**Using strings**:
- Vue templates: `$t('topLevelKey.subKey')`.
- TypeScript scripts and Pinia stores: `import { i18n } from 'app/src/i18n/externalFileLoader'` then `i18n.global.t('topLevelKey.subKey')`.

**Adding new strings**: create or update the appropriate `T_*.ts` file, then import and register it in `index.ts` under a camelCase key. Never add hardcoded prose inline to `index.ts`.

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

### Storybook (Vue components)

Use Storybook to develop/document renderer components in isolation.

```
yarn storybook:run
```

Build static Storybook output:

```
yarn storybook:build
```

Stories live under `tests/` subfolders as `*.stories.ts` (for example `src/components/**/tests/*.stories.ts`, plus `src/layouts/**/tests/*.stories.ts` and `src/pages/**/tests/*.stories.ts` for canvas-only previews).

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
- **Playwright** — Component and E2E tests drive the **built** app. Run `yarn quasar:build:electron` before `yarn test:components` / `yarn test:e2e` when you change sources those tests cover.

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

- Storybook **static build** output and **Playwright** visual config live in [`.storybook-workspace/`](.storybook-workspace/): `storybook-static/` (from `yarn storybook:build`) and [`playwright.storybook-visual.config.ts`](.storybook-workspace/playwright.storybook-visual.config.ts). Root `yarn test:storybook:visual*` runs the build then delegates to `yarn --cwd .storybook-workspace test:storybook:visual*`.
- Baselines live in [`.storybook-workspace/visual-tests/`](.storybook-workspace/visual-tests/) under `*.visual.playwright.test.ts-snapshots/`.
- Use `yarn test:storybook:visual:update` only when UI changes are intentional and approved.
- When snapshots change in a pull request, reviewers should inspect the committed image diffs (and local **`yarn test:storybook:visual`** / HTML report under **`test-results/storybook-visual-*`**) before accepting baseline updates.
- Keep snapshot updates scoped to affected stories/components; avoid broad regenerate-all updates unless there is a framework/theme-wide reason.
- First-time local setup: install nested workspace deps (`yarn --cwd .storybook-workspace install` — CI does this too), then browser binaries (for example `yarn playwright install chromium` from the **repo root** for Electron Playwright; the same cache is used for Storybook VRT).
- The following Storybook utility previews are intentionally excluded from visual snapshots because they are Playwright harness routes and do not represent meaningful visual-regression targets: `layouts-componenttestinglayout--with-social-contact-single-button`, `pages-componenttesting--social-contact-single-button`.

### Quality gate (before commit or release)

Run ESLint, the TypeScript project check (`tsc`), Stylelint, and Vitest unit tests in one shot (stops on the first failure):

```
yarn testbatch:verify
```

For debugging a single step, run `yarn lint:eslint`, `yarn lint:typescript`, `yarn lint:stylelint`, or `yarn test:unit` on its own, then run `yarn testbatch:verify` again before committing. Do not append `yarn quasar:build:electron`, Playwright, or Storybook smoke/visual commands to the same shell line as `yarn testbatch:verify` unless you intentionally run **`yarn testbatch:ensure:nochange`** or **`yarn testbatch:ensure:change`**.

On **Yarn 1.x**, `yarn check` is a different built-in (dependency-tree validation); use **`yarn testbatch:verify`** for this gate.

#### GitHub Actions vs local full gate

The **Verify** workflow (`.github/workflows/verify.yml`) runs **`yarn testbatch:verify`** only (lint, types, stylelint, unit tests). It installs **`.storybook-workspace`** dependencies so ESLint can resolve that tree. It does **not** run **`yarn quasar:build:electron`**, Playwright component/E2E, **`yarn test:storybook:smoke`**, or **`yarn test:storybook:visual`**. For Storybook VRT and the full chained gate, run **`yarn test:storybook:visual`** / **`yarn testbatch:ensure:nochange`** locally (or the individual commands in separate terminals per [testing-terminal-isolation](.cursor/rules/testing-terminal-isolation.mdc)).

### Full suite gates (everything + Storybook)

Run **`yarn testbatch:verify`**, production Electron build, Playwright component + E2E, Storybook smoke, then Storybook visual regression — in one chain:

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

Use Vitest for deterministic unit logic in both app layers: renderer code under `src/` (helpers, store/composable logic, extracted component-facing transforms), Electron/runtime code under `src-electron/`, and shallow-mounted `.vue` files under `src/components/` (second Vitest config; see `vitest.components.config.mts`).

```
yarn test:unit
```

#### Component test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.

Use Playwright component/E2E tests for rendered behavior and integration flows that rely on the built app runtime.
```
yarn test:components
```

#### Component list test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.

> Opens a CLI prompt listing available component tests.
```
yarn test:components:list
```

#### Component single test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.
```
yarn test:components:single --component=COMPONENT_FOLDER_NAME
```

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

#### One-shot verification (full project gate)

**`yarn testbatch:ensure:nochange`** runs **`yarn testbatch:verify`**, a production Electron build, **`yarn test:components`**, **`yarn test:e2e`**, **`yarn test:storybook:smoke`**, and **`yarn test:storybook:visual`** in sequence—the intentional way to chain lint, unit tests, build, both Playwright suites, and Storybook smoke plus snapshot compare. **`yarn testbatch:ensure:change`** is the same through smoke, then **`yarn test:storybook:visual:update`** instead of compare; use only when you mean to regenerate baselines. For lighter checks, run **`yarn test:unit`** and individual commands in their own terminals (see [testing-terminal-isolation](.cursor/rules/testing-terminal-isolation.mdc) in this repo).

### Scripts reference (`package.json`)

| Script | Purpose |
| --- | --- |
| `yarn quasar:build:electron` | Build/package the Electron app (`--publish never`). |
| `yarn quasar:dev:electron` | Run the app in Quasar Electron development mode. |
| `yarn lint:eslint` | Run ESLint on project source/config paths. |
| `yarn lint:stylelint` | Run Stylelint for Vue/SCSS styles. |
| `yarn lint:typescript` | Run TypeScript project check (`tsc`, no emit). |
| `yarn testbatch:verify` | Quick gate: lint + typecheck + stylelint + unit tests. |
| `yarn testbatch:ensure:nochange` | Full gate: `testbatch:verify` + `quasar:build:electron` + Playwright component + E2E + Storybook smoke + `test:storybook:visual` (snapshot compare). |
| `yarn testbatch:ensure:change` | Same through smoke, then `test:storybook:visual:update` (refresh VRT baselines; use only when intentional). |
| `yarn test:unit` | Run Vitest core then component unit suites. |
| `yarn test:components` | Run all Playwright component tests. |
| `yarn test:components:single --component=...` | Run a single component Playwright test by folder path. |
| `yarn test:components:single:ci --component=...` | Run a single component Playwright test by direct path. |
| `yarn test:components:list` | Open interactive picker for component Playwright tests. |
| `yarn test:e2e` | Run all Playwright E2E tests. |
| `yarn test:e2e:single --spec=...` | Run one E2E spec by spec file name. |
| `yarn test:e2e:single:ci --spec=...` | Run one E2E spec by direct path. |
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
