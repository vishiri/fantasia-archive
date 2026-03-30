# AI and agent notes — Fantasia Archive

This repository is **Fantasia Archive**: a **worldbuilding database manager** shipped as a **Quasar + Vue 3 + Electron** desktop app (GPL-3.0). Use **Yarn 1.x** and **Node 18** for local work (see `README.md`).

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
| [typescript-scripts.mdc](.cursor/rules/typescript-scripts.mdc)             | `src/scripts/**/*.ts` — `_utilities`, splitting modules                   |
| [project-scss.mdc](.cursor/rules/project-scss.mdc)                         | `src/css/**/*.scss` — globals, Quasar variables                           |
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
| Unit tests     | Vitest (`yarn test:unit`)                                        |
| UI / E2E tests | Playwright (`yarn test:component`, `yarn test:e2e`)              |
| DB (evolving)  | `sqlite3` in main process (`src-electron/electron-main.ts` stub) |


## Extending Electron APIs

Renderer code uses `**window.faContentBridgeAPIs`**, defined in preload (`src-electron/electron-preload.ts`) and typed in `src/globals.d.ts`. New surface area: implement in `src-electron/contentBridgeAPIs/`, register in preload, update types, add tests under `contentBridgeAPIs/tests/`. Details: `.cursor/skills/fantasia-electron-preload/SKILL.md`.

## Git commits

- Messages: `**feat` | `fix` | `test` | `chore` | `refactor` | `style` | `docs**`, then `**:**` and an imperative subject (e.g. `fix: close window on menu exit`).
- To split work into several commits with **confirmation before each**: ask the agent to follow [git-conventional-commits skill](.cursor/skills/git-conventional-commits/SKILL.md).

## Changelog (in-app)

- English changelog: [src/i18n/en-US/documents/changeLog.md](src/i18n/en-US/documents/changeLog.md). **Version** in [package.json](package.json) is the semver source of truth; when a new top section would duplicate that version, **patch-bump** both per [fantasia-changelog-en-us skill](.cursor/skills/fantasia-changelog-en-us/SKILL.md). Do not add empty `###` sections or “none” placeholder bullets.

## Testing expectations

- **Vitest** for unit coverage (including many `src-electron` modules). Follow [vitest-tests.mdc](.cursor/rules/vitest-tests.mdc) so new files match existing `*.vitest.test.ts` style.
- **Playwright** requires a **production build** before runs when source affecting the app has changed. Follow [playwright-tests.mdc](.cursor/rules/playwright-tests.mdc) for test sources; use [vue-template-test-hooks.mdc](.cursor/rules/vue-template-test-hooks.mdc) when changing locators in `.vue` templates. See `.cursor/skills/fantasia-testing/SKILL.md` and `README.md`.

## Suggested Cursor agent profiles (manual presets)

Use different instructions or @-references when starting a task:

1. **Electron and preload** — Focus on `src-electron/`, bridge security, `globals.d.ts`, Vitest for bridge modules.
2. **Tests** — Vitest vs Playwright, build order, `e2e-tests/` vs `src/components/**/tests/`.
3. **Feature / UI** — `src/` Vue + Quasar, Pinia, router, `ComponentTesting` page, i18n strings.
4. **Data / SQLite** — Main-process storage, `userData` paths, migrations, exposing data via narrow preload APIs only.

## Skill index


| Skill                           | Role                                                                |
| ------------------------------- | ------------------------------------------------------------------- |
| `fantasia-dev-setup`            | Yarn, Node, Quasar dev/build commands                               |
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


