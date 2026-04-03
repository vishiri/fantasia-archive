# AI and agent notes — Fantasia Archive

This repository is **Fantasia Archive**: a **worldbuilding database manager** shipped as a **Quasar + Vue 3 + Electron** desktop app (GPL-3.0). Use **Yarn 1.x** and **Node.js 22.22.0 or newer** for local work (see `README.md` and `package.json` `engines.node`; Quasar `@quasar/app-vite` v2 enforces this minimum). CI uses **22.22** on push/PR (**`.github/workflows/verify.yml`** runs **`yarn testbatch:verify`** only) and on manual release builds (**`.github/workflows/build.yml`**).

## Where project AI guidance lives

- **Cursor rules** (path-scoped): `[.cursor/rules/](.cursor/rules/)`
- **Cursor skills** (task playbooks): `[.cursor/skills/](.cursor/skills/)` — each folder contains a `SKILL.md` with frontmatter `name` and `description`.

## Rule files (`.mdc`)


| File                                                                       | Glob / scope                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [electron-preload.mdc](.cursor/rules/electron-preload.mdc)                 | `src-electron/**/*.ts` — bridge APIs, preload boundaries                  |
| [playwright-tests.mdc](.cursor/rules/playwright-tests.mdc)                 | `**/*playwright*.ts` — test file structure, env, locators, comments       |
| [vitest-tests.mdc](.cursor/rules/vitest-tests.mdc)                         | `**/*.vitest.test.ts` — JSDoc, flat `test`/`test.skip`, imports           |
| [vue-quasar.mdc](.cursor/rules/vue-quasar.mdc)                             | `**/*.vue` — Composition API, Quasar, i18n, script size and extraction    |
| [vue-bem-scss.mdc](.cursor/rules/vue-bem-scss.mdc)                         | `**/*.vue` — BEM class names and scoped SCSS only                         |
| [vue-template-test-hooks.mdc](.cursor/rules/vue-template-test-hooks.mdc)   | `**/*.vue` — `data-test` and other Playwright-facing template attributes  |
| [storybook-stories.mdc](.cursor/rules/storybook-stories.mdc)               | `**/*.stories.ts` — Story scope, layout/page canvas-only (no Docs), `TEST_ENV` restrictions |
| [typescript-scripts.mdc](.cursor/rules/typescript-scripts.mdc)             | `src/scripts/**/*.ts` — `_utilities`, splitting modules                   |
| [project-scss.mdc](.cursor/rules/project-scss.mdc)                         | `src/css/**/*.scss` — globals, Quasar variables                           |
| [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc)             | Always — ESLint, `tsc` (`yarn lint:typescript`), Quasar/tsconfig/Vitest alignment |
| [git-conventional-commits.mdc](.cursor/rules/git-conventional-commits.mdc) | Always — `type: subject` commits; see skill for split + approval workflow |
| [changelog-en-us.mdc](.cursor/rules/changelog-en-us.mdc)                   | Always — en-US `changeLog.md` vs `package.json` version (see skill)       |
| [plan-documents.mdc](.cursor/rules/plan-documents.mdc)                     | Always — plan files in `.cursor/plans` with timestamp + version metadata  |
| [testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc) | Always — **quality gate** via `yarn testbatch:verify`; `yarn quasar:build:electron`, Playwright, and Storybook test/VRT each in their own terminal unless using **`yarn testbatch:ensure:nochange`** / **`yarn testbatch:ensure:change`** |


## Stack (short)


| Area           | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| UI             | Vue 3, Quasar 2, TypeScript                                      |
| Desktop        | Electron, Quasar Electron mode                                   |
| State / routes | Pinia, Vue Router                                                |
| i18n           | vue-i18n (`src/i18n/`)                                           |
| Lint / types   | ESLint (`yarn lint:eslint`), `tsc` (`yarn lint:typescript`), Stylelint (`yarn lint:stylelint`) — see [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc) |
| Unit tests     | Vitest (`yarn test:unit`)                                        |
| UI / E2E tests | Playwright (`yarn test:components`, `yarn test:e2e`)              |
| Component docs | Storybook 10 (`yarn storybook:run`, `yarn storybook:build`)        |
| DB (evolving)  | `sqlite3` in main process (`src-electron/electron-main.ts` stub) |


## Extending Electron APIs

Renderer code uses `**window.faContentBridgeAPIs`**, defined in preload (`src-electron/electron-preload.ts`) and typed in `src/globals.d.ts`. New surface area: implement in `src-electron/contentBridgeAPIs/`, register in preload, update types, add tests under `contentBridgeAPIs/tests/`. Details: `.cursor/skills/fantasia-electron-preload/SKILL.md`.

## Type naming conventions

- Keep the existing prefix strategy: `I_` for interfaces and `T_` for type aliases.
- Favor singular names for single-item shapes (`I_appMenuItem`, `T_documentName`) and collection-oriented names for grouped structures (`I_appMenuList`, `I_socialContactButtonSet`).
- Keep unions and function signatures consistently spaced (for example, `string | false`, `(...args: unknown[]) => unknown | void`).

## i18n convention

- In Vue templates, use `$t('...')` for translations.
- Do **not** import `useI18n` just to call `t(...)` inside SFC scripts when template `$t(...)` can be used.

## Linting and static analysis

- **No TSLint** — use **ESLint** (**`eslint.config.mjs`**, **neostandard**, **typescript-eslint**, **eslint-plugin-vue**), **`yarn lint:typescript`** for **`tsc -p tsconfig.json`**, and **`yarn lint:stylelint`** for Vue/SCSS. Details: [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc).
- In TypeScript code (including Vue `<script lang="ts">`), use `import type` for type-only imports.
- **`@typescript-eslint` v8** / **typescript-eslint** should stay aligned with **TypeScript ~6.0** in `package.json` to avoid `typescript-estree` unsupported-version warnings (including from **vite-plugin-checker** in dev).
- **`src/env.d.ts`** references **`.quasar/shims-vue.d.ts`** so `tsc` resolves `*.vue` while `tsconfig` excludes generated `.quasar` output.
- Before commits that touch lint-covered sources, run the **quality gate** in one terminal: **`yarn testbatch:verify`** (see [testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc) and commit gate in [git-conventional-commits.mdc](.cursor/rules/git-conventional-commits.mdc)).

## Git commits

- Messages: `**feat` | `fix` | `test` | `chore` | `refactor` | `style` | `docs**`, then `**:**` and an imperative subject (e.g. `fix: close window on menu exit`).
- To split work into several commits with **confirmation before each**: ask the agent to follow [git-conventional-commits skill](.cursor/skills/git-conventional-commits/SKILL.md).
- Before any commit (or changelog edit for new work), follow this order ([testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc)):
  1. Run the **quality gate** in one terminal: `yarn testbatch:verify` (must pass; run `yarn lint:eslint`, `yarn lint:typescript`, `yarn lint:stylelint`, or `yarn test:unit` individually only while debugging). When the change affects TypeScript, Vue, Electron TS, or other lint-scoped files, ESLint is required — see [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc).
  2. Verify Storybook coverage/updates for affected user-facing **`src/components/**`** (`*.stories.ts`, mocks/placeholders as needed). Layout/page Storybook previews are canvas-only (no Docs requirement); see [storybook-stories.mdc](.cursor/rules/storybook-stories.mdc).
  3. If Storybook is aligned for touched components, update changelog if required.
  4. Commit.
- If any gate fails (lint, types, stylelint, or unit tests), stop the commit flow, do not create a commit, and report a concise summary of what failed and where (failing suites/tests, file paths, and key error locations/messages).

## Changelog (in-app)

- English changelog: [src/i18n/en-US/documents/changeLog.md](src/i18n/en-US/documents/changeLog.md). **Version** in [package.json](package.json) is the only source of truth. **NEVER, EVER, UNDER ANY CIRCUMSTANCES** auto-bump any version in changelog or `package.json`; update changelog entries under the existing package version unless the user explicitly requests a manual version change. Do not add empty `###` sections or “none” placeholder bullets.
- Changelog bullets are for **user- or release-relevant changes** (features, fixes, meaningful dependency refreshes, etc.). **Do not** log internal QA as changelog text: omit lines that only say the team re-ran `yarn testbatch:verify`, `yarn testbatch:ensure:nochange`, `yarn testbatch:ensure:change`, `yarn lint:eslint`, `yarn lint:typescript`, `yarn lint:stylelint`, `yarn test:unit`, production builds, Playwright component tests, E2E, Storybook smoke/visual runs, or that “all gates passed”. Follow [changelog-en-us.mdc](.cursor/rules/changelog-en-us.mdc) and [fantasia-changelog-en-us skill](.cursor/skills/fantasia-changelog-en-us/SKILL.md).
- Changelog-edit guard: always re-open [package.json](package.json) immediately before updating changelog content and use that live `version` value for section targeting.
- For changelog updates tied to fresh work, ensure Storybook updates/checks for affected **`src/components/**`** UI are completed before editing the changelog entry.

## Testing expectations

- **Vitest** for unit coverage: `yarn test:unit` runs the **core** config (`src-electron`, `src/scripts`, `src/boot`, `src/stores`, `src/i18n`) then the **components** config (`src/components/**` Vue SFC mounts). Use [vitest-tests.mdc](.cursor/rules/vitest-tests.mdc) for style and layout.
- For `src/components/**`, keep a **1:1 Vitest presence baseline**: each component `.vue` has a colocated `tests/<ComponentName>.vitest.test.ts` file. Add/rename/remove component + Vitest counterpart together.
- **`_data/` holds production structured feeds** (menus, lists, etc.). **Vitest** and **Playwright** fixture objects live **inside** their own `*.vitest.test.ts` / `*.playwright.test.ts` files (inline `const` / literals), not in `_data/` and **not** in extra `tests/*.ts` files whose only role is fixture storage. **Never** add `tests/_data/`. Do **not** add tests whose **only** system-under-test is a file under `_data/`; exercise production data indirectly (components, boot, scripts).
- Treat 1:1 component-test parity as **coverage presence**, not exhaustive line/branch percentage coverage.
- **Playwright** requires a **production build** before runs when source affecting the app has changed. Follow [playwright-tests.mdc](.cursor/rules/playwright-tests.mdc) for test sources; use [vue-template-test-hooks.mdc](.cursor/rules/vue-template-test-hooks.mdc) when changing locators in `.vue` templates. See `.cursor/skills/fantasia-testing/SKILL.md` and `README.md`.
- Storybook visual snapshots intentionally ignore these Playwright-harness-only utility stories (not meaningful VRT targets): `layouts-componenttestinglayout--with-social-contact-single-button`, `pages-componenttesting--social-contact-single-button`.
- **Terminal use**: run the **quality gate** with **`yarn testbatch:verify`** unless debugging a single step ([testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc)). Run **`yarn quasar:build:electron`**, **`yarn test:components`**, **`yarn test:e2e`**, **`yarn test:storybook:smoke`**, and **`yarn test:storybook:visual`** (or **`:update`**) each in its own terminal; do not chain those with each other or append them to the quality gate in one line unless you intentionally run **`yarn testbatch:ensure:nochange`** or **`yarn testbatch:ensure:change`**.
- **Full-suite one-shot**: use **`yarn testbatch:ensure:nochange`** when you want one command to run `testbatch:verify` + `quasar:build:electron` + Playwright component + Playwright E2E + **`yarn test:storybook:smoke`** + **`yarn test:storybook:visual`** (snapshot compare). Use **`yarn testbatch:ensure:change`** only when deliberately refreshing Storybook VRT baselines (ends with **`yarn test:storybook:visual:update`**); commit the resulting snapshot diffs with care. See [testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc).

## Storybook expectations

- Story files are colocated with components as `src/components/**/<Component>.stories.ts`.
- **Layouts and pages** may have `src/layouts/**/*.stories.ts` and `src/pages/**/*.stories.ts` for **canvas-only** previews (router shells, smoke checks). Do **not** add Storybook **Docs** (no `autodocs` tag, no `parameters.docs.description`, keep `parameters.docs.disable: true`). Agents should not generate or expand documentation pages for layouts/pages in Storybook.
- Prefer Storybook for isolated **component** authoring/editing feedback; use `yarn storybook:run` for dev and `yarn storybook:build` for static output.
- Do **not** import the full `src/i18n/en-US/index.ts` (or `src/i18n/index.ts`) in Storybook helpers/mocks; these pull markdown `documents/*.md` and can break Vite import analysis.
- For Storybook-only i18n mocks, import non-markdown `T_*` locale modules directly and provide placeholder lorem ipsum strings for `documents.*` markdown keys.
- Do **not** add Storybook stories named `A11y/*` in this project.
- Do **not** create stories that only verify `TEST_ENV === 'components'`; keep those checks in Playwright/component-test flows.

## Cross-toolchain reminders (Storybook + Electron + Playwright)

The same Vue UI runs under **dev server**, **Storybook**, **packaged Electron (`file://`)**, and **Playwright-driven Electron**. When something passes in one runner and fails in another, check these first:

- **Storybook** — CLI, Vite/Storybook config, **static build output** (`storybook-static/`), **Playwright** visual-regression config, and **`visual-tests/`** all live under [`.storybook-workspace/`](.storybook-workspace/) (see `.storybook-workspace/.storybook/`). Root `yarn storybook:run` / `yarn storybook:build` / `yarn test:storybook:visual*` delegate there. **GitHub Actions** does not run Storybook VRT; use local **`yarn test:storybook:visual`** or **`yarn testbatch:ensure:nochange`**. Keep [`staticDirs`](.storybook-workspace/.storybook/main.ts) and repo `public/` serving (including any Vite middleware for dev) aligned so assets such as `/images/...` match the Quasar app.
- **Electron packaged renderer** — Root-relative URLs like `/images/...` (common when `import.meta.env.BASE_URL` is `'/'` or empty) do **not** resolve next to `index.html` under `file://`. For files in `public/`, prefer a **relative** base (e.g. `./images/...`) when normalizing `BASE_URL`, unless the app is always served over HTTP with a matching absolute base.
- **Playwright** — Component and E2E suites use the **production** Electron build. After changes to code those tests exercise, run `yarn quasar:build:electron` before `yarn test:components` / `yarn test:e2e`. See [fantasia-testing skill](.cursor/skills/fantasia-testing/SKILL.md).

## Suggested Cursor agent profiles (manual presets)

Use different instructions or @-references when starting a task:

1. **Electron and preload** — Focus on `src-electron/`, bridge security, `globals.d.ts`, Vitest for bridge modules.
2. **Tests** — Vitest unit coverage in `src/` + `src-electron/`, Playwright integration flows, build order, `e2e-tests/` vs `src/components/**/tests/`.
3. **Feature / UI** — `src/` Vue + Quasar, Pinia, router, `ComponentTesting` page, i18n strings. For **large production menu/config data**, split across **`src/components/<Feature>/_data/*.ts`** (multiple named files as needed). Rare **embedded** component-mode-only payloads may live as **`const` inside the `.vue`**; Playwright passes isolated props via **`COMPONENT_PROPS`** defined inline in each spec. Details: [vue-quasar.mdc](.cursor/rules/vue-quasar.mdc).
4. **Data / SQLite** — Main-process storage, `userData` paths, migrations, exposing data via narrow preload APIs only.

## Skill index


| Skill                           | Role                                                                |
| ------------------------------- | ------------------------------------------------------------------- |
| `fantasia-dev-setup`            | Yarn, Node.js 22.22+, Quasar dev/build commands                     |
| `fantasia-testing`              | Vitest and Playwright workflows                                     |
| `fantasia-electron-preload`     | `faContentBridgeAPIs` and preload                                   |
| `fantasia-electron-main`        | Main process lifecycle and `mainScripts/`                           |
| `fantasia-quasar-vue`           | Vue/Quasar app structure                                            |
| `fantasia-i18n`                 | Locales and `T_`* message modules                                   |
| `fantasia-sqlite-main`          | SQLite in main process                                              |
| `fantasia-worldbuilding-domain` | Product vocabulary and scope                                        |
| `fantasia-markdown-dialogs`     | QMarkdown dialogs and document markdown                             |
| `fantasia-release-build`        | Production build and packaging                                      |
| `git-conventional-commits`      | Logical commits, conventional `type:` messages, per-commit approval |
| `fantasia-changelog-en-us`      | `changeLog.md` strictly aligned to existing `package.json` version  |
| `fantasia-plan-documents`       | `.cursor/plans` filename and metadata format for plan files         |


