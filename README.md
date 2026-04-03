# Fantasia Archive (fantasia-archive)

A worldbuilding database manager

Use Yarn 1.22.19, or things may become unstable.

Use **Node.js 22.22.0 or newer** (`package.json` `engines.node`: `>=22.22.0`; Quasar `@quasar/app-vite` v2 enforces this minimum). `nvm` / `fnm` work well to pin the version (for example **22.22** to match CI in `.github/workflows/build.yml`).

> Playwright tests run from a built, live version of FA. Therefore, to run them, you need to locally build the app on your machine first - both the first time you use them and every time something is changed in the source code.

## Install Quasar CLI for smoothest experience
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
- **State and routing**: Pinia + Vue Router
- **i18n**: vue-i18n (`src/i18n/`)
- **Tests**: Vitest (unit) + Playwright (component and E2E)
- **Component docs**: Storybook 10 (in `.storybook-workspace/`)

### Start the app in Quasar development mode (hot-code reloading, error reporting, etc.)
```
quasar dev -m electron
```

### Build the app for production
```
yarn build
```

### Storybook (Vue components)

Use Storybook to develop/document renderer components in isolation.

```
yarn storybook
```

Build static Storybook output:

```
yarn build-storybook
```

Stories live next to components as `*.stories.ts` under `src/components/**`.

#### Integration gotchas (Storybook + Electron + Playwright)

- **Storybook** — Runs from [`.storybook-workspace/`](.storybook-workspace/) (nested Yarn project) on **Storybook 10** with **Vite 8**, aligned with the root Quasar app’s **`@quasar/app-vite`** v2 line. Config keeps `staticDirs` pointed at the repo [`public/`](public/) folder (and related Vite wiring) so asset paths match the Quasar app.
- **Electron** — The packaged renderer loads from `file://`. Root-relative `public/` URLs built from `import.meta.env.BASE_URL === '/'` can fail; prefer **relative** paths (e.g. `./images/...`) for those assets unless you control a real HTTP base.
- **Playwright** — Component and E2E tests drive the **built** app. Run `yarn build` before `yarn test:component` / `yarn test:e2e` when you change sources those tests cover.

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

### Quality gate (before commit or release)

Run ESLint, the TypeScript project check (`tsc`), Stylelint, and Vitest unit tests in one shot (stops on the first failure):

```
yarn verify
```

For debugging a single step, run `yarn lint`, `yarn lint:types`, `yarn lint:style`, or `yarn test:unit` on its own, then run `yarn verify` again before committing. Do not append `yarn build` or Playwright commands to the same shell line as `yarn verify`.

On **Yarn 1.x**, `yarn check` is a different built-in (dependency-tree validation); use **`yarn verify`** for this gate.

### Full suite gate (everything)

Run verify + production build + Playwright component + Playwright E2E in sequence:

```
yarn ensure
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
yarn test:component
```

#### Component list test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.

> Opens a CLI prompt listing available component tests.
```
yarn test:componentList
```

#### Component single test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.
```
yarn test:componentSingle --component=COMPONENT_FOLDER_NAME
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
yarn test:e2eList
```

#### E2E single test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.
```
yarn test:e2eSingle --spec=SPEC_FILE_NAME
```

#### Full test pass (unit + Playwright component and E2E)

Runs `yarn test:unit`, then Playwright over `src/components` and `e2e-tests/` in one invocation. Requires a **production build** (`yarn build`) when sources those tests cover have changed.

```
yarn test:full
```

### Scripts reference (`package.json`)

| Script | Purpose |
| --- | --- |
| `yarn dev:electron` | Run the app in Quasar Electron development mode. |
| `yarn build` | Build/package the Electron app (`--publish never`). |
| `yarn lint` | Run ESLint on project source/config paths. |
| `yarn lint:types` | Run TypeScript project check (`tsc`, no emit). |
| `yarn lint:style` | Run Stylelint for Vue/SCSS styles. |
| `yarn verify` | Quick gate: lint + typecheck + stylelint + unit tests. |
| `yarn ensure` | Full gate: `verify` + build + Playwright component + Playwright E2E. |
| `yarn test:unit` | Run Vitest core then component unit suites. |
| `yarn test:component` | Run all Playwright component tests. |
| `yarn test:componentSingle --component=...` | Run a single component Playwright test by folder path. |
| `yarn test:componentSingleAuto --component=...` | Run a single component Playwright test by direct path. |
| `yarn test:componentList` | Open interactive picker for component Playwright tests. |
| `yarn test:e2e` | Run all Playwright E2E tests. |
| `yarn test:e2eSingle --spec=...` | Run one E2E spec by spec file name. |
| `yarn test:e2eSingleAuto --spec=...` | Run one E2E spec by direct path. |
| `yarn test:e2eList` | Open interactive picker for E2E tests. |
| `yarn test:full` | Run `test:unit` then one Playwright run over components + E2E paths. |
| `yarn storybook` | Start Storybook from `.storybook-workspace`. |
| `yarn build-storybook` | Build static Storybook output. |
| `yarn storybook:smoke` | Run Storybook smoke check in CI-friendly mode. |

### Customize the configuration
See [The quasar.config file](https://quasar.dev/quasar-cli-vite/quasar-config-file) (this repo uses `quasar.config.ts`).

The repo tracks a minimal [`.quasar/tsconfig.json`](.quasar/tsconfig.json) so TypeScript and Vitest can resolve Quasar path aliases before your first `quasar dev` / `quasar prepare`. Those commands regenerate `.quasar` contents; if the file changes locally, prefer the generated output from your machine’s Quasar version.

### Native modules (sqlite3)

After changing **Electron** or **Node** versions, run a clean `yarn install` on your machine. If `sqlite3` fails to load in the packaged app, rebuild native addons for your Electron version (for example `npx electron-rebuild` in the project root) and retry `yarn build`.
