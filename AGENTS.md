# AI and agent notes — Fantasia Archive

This repository is **Fantasia Archive**: a **worldbuilding database manager** shipped as a **Quasar + Vue 3 + Electron** desktop app (GPL-3.0). Use **Yarn 1.x** and **Node.js 22.22.0 or newer** for local work (see `README.md` and `package.json` `engines.node`; Quasar `@quasar/app-vite` v2 enforces this minimum). CI uses **22.22** (see `.github/workflows/build.yml`).

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
| [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc)             | Always — ESLint, `tsc` (`yarn lint:types`), Quasar/tsconfig/Vitest alignment |
| [git-conventional-commits.mdc](.cursor/rules/git-conventional-commits.mdc) | Always — `type: subject` commits; see skill for split + approval workflow |
| [changelog-en-us.mdc](.cursor/rules/changelog-en-us.mdc)                   | Always — en-US `changeLog.md` vs `package.json` version (see skill)       |
| [plan-documents.mdc](.cursor/rules/plan-documents.mdc)                     | Always — plan files in `.cursor/plans` with timestamp + version metadata  |


## Stack (short)


| Area           | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| UI             | Vue 3, Quasar 2, TypeScript                                      |
| Desktop        | Electron, Quasar Electron mode                                   |
| State / routes | Pinia, Vue Router                                                |
| i18n           | vue-i18n (`src/i18n/`)                                           |
| Lint / types   | ESLint (`yarn lint`), `tsc` (`yarn lint:types`), Stylelint (`yarn lint:style`) — see [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc) |
| Unit tests     | Vitest (`yarn test:unit`)                                        |
| UI / E2E tests | Playwright (`yarn test:component`, `yarn test:e2e`)              |
| Component docs | Storybook 8 (`yarn storybook`, `yarn build-storybook`)           |
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

- **No TSLint** — use **ESLint** (`.eslintrc.cjs`, `plugin:@typescript-eslint/recommended`, Vue presets, `standard`) plus **`yarn lint:types`** for **`tsc -p tsconfig.json`**. Details: [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc).
- **`@typescript-eslint` v8** is pinned for **TypeScript ~5.6**; keep them in step to avoid `typescript-estree` unsupported-version warnings (including from **vite-plugin-checker** in dev).
- **`src/env.d.ts`** references **`.quasar/shims-vue.d.ts`** so `tsc` resolves `*.vue` while `tsconfig` excludes generated `.quasar` output.
- Before commits that touch lint-covered sources, run **`yarn lint`** and **`yarn lint:types`** (see commit gate in [git-conventional-commits.mdc](.cursor/rules/git-conventional-commits.mdc)).

## Git commits

- Messages: `**feat` | `fix` | `test` | `chore` | `refactor` | `style` | `docs**`, then `**:**` and an imperative subject (e.g. `fix: close window on menu exit`).
- To split work into several commits with **confirmation before each**: ask the agent to follow [git-conventional-commits skill](.cursor/skills/git-conventional-commits/SKILL.md).
- Before any commit (or changelog edit for new work), follow this order:
  1. Run `yarn lint` and `yarn lint:types` (must pass) when the change affects TypeScript, Vue, Electron TS, or other lint-scoped files — see [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc).
  2. Run unit tests with `yarn test:unit`.
  3. If tests pass, verify Storybook coverage/updates for affected user-facing **`src/components/**`** (`*.stories.ts`, mocks/placeholders as needed). Layout/page Storybook previews are canvas-only (no Docs requirement); see [storybook-stories.mdc](.cursor/rules/storybook-stories.mdc).
  4. If Storybook is aligned for touched components, update changelog if required.
  5. Commit.
- If unit tests fail, stop the commit flow, do not create a commit, and report a concise summary of what failed and where (failing suites/tests, file paths, and key error locations/messages).

## Changelog (in-app)

- English changelog: [src/i18n/en-US/documents/changeLog.md](src/i18n/en-US/documents/changeLog.md). **Version** in [package.json](package.json) is the semver source of truth; when a new top section would duplicate that version, **patch-bump** both per [fantasia-changelog-en-us skill](.cursor/skills/fantasia-changelog-en-us/SKILL.md). Do not add empty `###` sections or “none” placeholder bullets.
- For changelog updates tied to fresh work, ensure Storybook updates/checks for affected **`src/components/**`** UI are completed before editing the changelog entry.

## Testing expectations

- **Vitest** for unit coverage: `yarn test:unit` runs the **core** config (`src-electron`, `src/scripts`, `src/boot`, `src/stores`, `src/i18n`) then the **components** config (`src/components/**` Vue SFC mounts). Use [vitest-tests.mdc](.cursor/rules/vitest-tests.mdc) for style and layout.
- For `src/components/**`, keep a **1:1 Vitest presence baseline**: each component `.vue` has a colocated `tests/<ComponentName>.vitest.test.ts` file. Add/rename/remove component + Vitest counterpart together.
- **`_data/` holds production structured feeds** (menus, lists, etc.). **Vitest** and **Playwright** fixture objects live **inside** their own `*.vitest.test.ts` / `*.playwright.test.ts` files (inline `const` / literals), not in `_data/` and **not** in extra `tests/*.ts` files whose only role is fixture storage. **Never** add `tests/_data/`. Do **not** add tests whose **only** system-under-test is a file under `_data/`; exercise production data indirectly (components, boot, scripts).
- Treat 1:1 component-test parity as **coverage presence**, not exhaustive line/branch percentage coverage.
- **Playwright** requires a **production build** before runs when source affecting the app has changed. Follow [playwright-tests.mdc](.cursor/rules/playwright-tests.mdc) for test sources; use [vue-template-test-hooks.mdc](.cursor/rules/vue-template-test-hooks.mdc) when changing locators in `.vue` templates. See `.cursor/skills/fantasia-testing/SKILL.md` and `README.md`.

## Storybook expectations

- Story files are colocated with components as `src/components/**/<Component>.stories.ts`.
- **Layouts and pages** may have `src/layouts/**/*.stories.ts` and `src/pages/**/*.stories.ts` for **canvas-only** previews (router shells, smoke checks). Do **not** add Storybook **Docs** (no `autodocs` tag, no `parameters.docs.description`, keep `parameters.docs.disable: true`). Agents should not generate or expand documentation pages for layouts/pages in Storybook.
- Prefer Storybook for isolated **component** authoring/editing feedback; use `yarn storybook` for dev and `yarn build-storybook` for static output.
- Do **not** import the full `src/i18n/en-US/index.ts` (or `src/i18n/index.ts`) in Storybook helpers/mocks; these pull markdown `documents/*.md` and can break Vite import analysis.
- For Storybook-only i18n mocks, import non-markdown `T_*` locale modules directly and provide placeholder lorem ipsum strings for `documents.*` markdown keys.
- Do **not** add Storybook stories named `A11y/*` in this project.
- Do **not** create stories that only verify `TEST_ENV === 'components'`; keep those checks in Playwright/component-test flows.

## Cross-toolchain reminders (Storybook + Electron + Playwright)

The same Vue UI runs under **dev server**, **Storybook**, **packaged Electron (`file://`)**, and **Playwright-driven Electron**. When something passes in one runner and fails in another, check these first:

- **Storybook** — CLI and config live under [`.storybook-workspace/`](.storybook-workspace/) (see `.storybook-workspace/.storybook/`). Root `yarn storybook` / `yarn build-storybook` delegate there. Keep [`staticDirs`](.storybook-workspace/.storybook/main.ts) and repo `public/` serving (including any Vite middleware for dev) aligned so assets such as `/images/...` match the Quasar app.
- **Electron packaged renderer** — Root-relative URLs like `/images/...` (common when `import.meta.env.BASE_URL` is `'/'` or empty) do **not** resolve next to `index.html` under `file://`. For files in `public/`, prefer a **relative** base (e.g. `./images/...`) when normalizing `BASE_URL`, unless the app is always served over HTTP with a matching absolute base.
- **Playwright** — Component and E2E suites use the **production** Electron build. After changes to code those tests exercise, run `yarn build` before `yarn test:component` / `yarn test:e2e`. See [fantasia-testing skill](.cursor/skills/fantasia-testing/SKILL.md).

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
| `fantasia-changelog-en-us`      | `changeLog.md`, `package.json` version, patch bumps                 |
| `fantasia-plan-documents`       | `.cursor/plans` filename and metadata format for plan files         |


