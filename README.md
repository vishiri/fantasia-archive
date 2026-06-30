# Fantasia Archive (fantasia-archive)

Worldbuilding database manager — **Quasar + Vue 3 + Electron** (GPL-3.0).

**Yarn 1.x** (CI pins **`yarn@1.22.19`**). **Node.js 22.22.0+** (`package.json` `engines.node`). Match **22.22** locally to align with CI (`.github/workflows/build.yml`).

> **Playwright** runs against **production build** under **`dist/electron`**, not **`quasar dev`**. Rebuild after **`src/`**, **`src-electron/`**, **`src/stores/`**, or **`i18n/*/documents/*.md`** changes:
>
> **`yarn quasar:build:electron`**

Agent/maintainer guidance: [AGENTS.md](AGENTS.md). Architecture depth → AGENTS + [`.cursor/skills/`](.cursor/skills/).

## Install Quasar CLI

https://quasar.dev/start/quasar-cli — ensure Yarn global bin is on **PATH**.

```
yarn global add @quasar/cli
```

## Install dependencies

```
yarn
```

**Git hooks:** **`prepare`** runs **husky**; **`.husky/commit-msg`** → **`yarn lint:commit`**. Emergency bypass: **`git commit --no-verify`** (sparingly).

## Optional: Caveman ecosystem (AI)

Not required to build/run app. **caveman** compressed agent replies — [`.cursor/rules/caveman-default.mdc`](.cursor/rules/caveman-default.mdc). **YAGNI** minimal implementation — [`.cursor/rules/yagni.mdc`](.cursor/rules/yagni.mdc). **cavemem** cross-session memory — global install + [`.cursor/hooks.json`](.cursor/hooks.json). Setup:

```bash
npm install -g cavemem
cavemem install --ide cursor
cavemem doctor
```

Restart Cursor. Details: [AGENTS.md](AGENTS.md).

## Contributing

[CONTRIBUTING.md](CONTRIBUTING.md) — fork/PR workflow, labels, Storybook VRT on forks.

## Architecture (pointers)

| Topic | Where |
| --- | --- |
| Two-level **`functions/`** + **`*_manager.ts`**; **`*Wiring.ts`** for DOM/`window`/`fs`; domain barrels (**`faDragDrop_manager`**, **`dom_manager`**) | [fa-two-level-architecture.mdc](.cursor/rules/fa-two-level-architecture.mdc), [fantasia-two-level-architecture](.cursor/skills/fantasia-two-level-architecture/SKILL.md) |
| TypeScript strict (**`quasar.config.ts`**) | [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc) |
| YAGNI / minimal diffs | [yagni.mdc](.cursor/rules/yagni.mdc), [fantasia-yagni](.cursor/skills/fantasia-yagni/SKILL.md) |
| Trees (**`@he-tree/vue` only**; **`QTree` forbidden**) | [fa-he-tree.mdc](.cursor/rules/fa-he-tree.mdc), [fantasia-he-tree](.cursor/skills/fantasia-he-tree/SKILL.md) |
| Floating **`Window*`** shared families | [fantasia-floating-windows](.cursor/skills/fantasia-floating-windows/SKILL.md) (**`_sharedWindowStyling/`**, **`_sharedWindowNoteboard/`**) |
| List/table DnD | [fa-drag-drop-lists.mdc](.cursor/rules/fa-drag-drop-lists.mdc), [fantasia-drag-drop](.cursor/skills/fantasia-drag-drop/SKILL.md) |
| Electron / IPC / preload; main security hardening | [AGENTS.md](AGENTS.md), [fantasia-electron-main](.cursor/skills/fantasia-electron-main/SKILL.md), [fantasia-electron-preload](.cursor/skills/fantasia-electron-preload/SKILL.md) |
| Keybinds, actions, Project Settings | [AGENTS.md](AGENTS.md) subsystem table |
| SCSS / theme tokens | [project-scss.mdc](.cursor/rules/project-scss.mdc) |
| **`types/`** shared interfaces | [types-folder.mdc](.cursor/rules/types-folder.mdc) only |

**Component buckets** under **`src/components/`**: **`dialogs/`**, **`floatingWindows/`**, **`globals/`**, **`elements/`**, **`projectUI/`**, **`other/`**, **`foundation/`** (Storybook-only). Three infra helpers use **`_` prefix** — see [AGENTS.md](AGENTS.md).

## Dev and build

```
quasar dev -m electron
# or
yarn quasar:dev:electron
```

Production build:

```
yarn quasar:build:electron
```

Quiet build (log → **`test-results/quasar-build-electron-last.log`** on failure):

```
yarn quasar:build:electron:summarized
```

Electron + Storybook in one terminal:

```
yarn app:dev
```

**Release build (CI):** the manual **Build App** workflow (`.github/workflows/build.yml`, `workflow_dispatch` with a `version` input) packages the production Electron app for **Windows**, **macOS**, and **Linux** (AppImage, deb, rpm) and uploads the installers. It runs **no test gate** — verify, Playwright, and Storybook VRT are not executed in CI. Run the full local gate first:

```
yarn testbatch:ensure:nochange   # or testbatch:ensure:change when refreshing VRT baselines
```

Only trigger the CI build after that passes on your machine. Push/PR testing stays in `.github/workflows/verify.yml` (`yarn testbatch:verify`) and the `pr-full-suite-*` labeled-PR workflows.

## Storybook

```
yarn storybook:run
yarn storybook:build
yarn test:storybook:visual
yarn test:storybook:visual:update
```

Stories: **`src/**/_tests/*.stories.ts`**. Workspace: **`.storybook-workspace/`**. VRT policy: [fantasia-testing](.cursor/skills/fantasia-testing/SKILL.md), [storybook-stories.mdc](.cursor/rules/storybook-stories.mdc).

## Quality gate (before commit)

```
yarn testbatch:verify
```

Lint + **`vue-tsc`** + Stylelint + Vitest coverage (**95%** on **`src-electron`**, instrumented **`helpers/`**, scoped **`i18n/`**, renderer **`src` `.ts`**, component **`.ts`**; **`.vue`** watermarks ~60%). Debug one step, then re-run full gate.

**Changelog-only** exception: only **`i18n/*/documents/changeLog.md`** after gate passed on substantive work — see [testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc).

**CI Verify** (`.github/workflows/verify.yml`): **`yarn testbatch:verify`** only — not Playwright, Electron prod build, or Storybook VRT.

Full chained gate:

```
yarn testbatch:ensure:nochange   # compare VRT snapshots
yarn testbatch:ensure:change     # refresh VRT baselines (intentional UI only)
```

## Testing

### Vitest

```
yarn test:unit
yarn test:coverage:verify
```

Workspace: **`vitest.config.mts`** → **`vitest/`** projects (**unit-electron**, **unit-src-renderer**, **unit-helpers**, **unit-i18n**, **unit-components**).

### Playwright (rebuild first)

Isolated **`userData`**: **`%APPDATA%/fantasia-archive/playwright-user-data`**. Serial suites reset via **`helpers/playwrightHelpers_universal/playwrightUserDataReset.ts`**.

```
yarn test:components
yarn test:components:single --component=dialogs/DialogAppSettings
yarn test:components:list
yarn test:e2e
yarn test:e2e:single --spec=checkDevToolsFunctionality
yarn test:e2e:single:ci --spec=checkDevToolsFunctionality.playwright.spec.ts
yarn test:e2e:list
```

**Locators:** **`data-test-locator`** + **`selectorList`** — [playwright-tests.mdc](.cursor/rules/playwright-tests.mdc). **Keyboard:** **`faPlaywrightKeyboardChords`** for cross-OS chords.

**Report/videos:** **`test-results/playwright-report/index.html`**. **`FA_PLAYWRIGHT_NO_VIDEO=1`** to skip recording.

## Scripts reference (`package.json`)

| Script | Purpose |
| --- | --- |
| `yarn quasar:build:electron` | Production Electron build (full log). |
| `yarn quasar:build:electron:summarized` | Same; quiet success; log file on failure. |
| `yarn quasar:dev:electron` | Electron dev mode. |
| `yarn app:dev` | Dev + Storybook parallel. |
| `yarn lint:eslint` | ESLint. |
| `yarn lint:stylelint` / `lint:stylelint:fix` | Stylelint on `src/` + Storybook SCSS. |
| `yarn lint:typescript` | **`vue-tsc`** project check. |
| `yarn testbatch:verify` | Default pre-commit gate. |
| `yarn testbatch:ensure:nochange` | Full gate + build + Playwright + Storybook VRT compare. |
| `yarn testbatch:ensure:change` | Same; update VRT snapshots. |
| `yarn test:unit` | Vitest (no coverage). |
| `yarn test:coverage:verify` | Coverage tiers (same as verify Vitest step). |
| `yarn test:coverage:electron` / `helpers` / `src` | Single coverage slice. |
| `yarn test:components` / `test:e2e` | Playwright suites. |
| `yarn test:storybook:smoke` / `visual*` | Storybook checks. |
| `yarn storybook:run` / `storybook:build` | Storybook dev/static. |
| `yarn audit:policy` | Heuristic policy report (not CI). |
| `yarn audit:scss-literals` | Consumer SCSS literal audit (not CI). |
| `yarn audit:domain-policy` | Domain policy grep (not CI). |
| `yarn audit:quasar-component-tokens` | **`$q*`** token audit. |
| `yarn audit:full` | Chained local audits (not CI). |
| `yarn audit:yagni` | YAGNI inventory + heuristic scan (not CI). |
| `yarn audit:yagni:full` | YAGNI scan + optional jscpd/depcheck. |
| `yarn audit:yagni:triage` | Mechanical per-file YAGNI triage JSON. |
| `yarn generate:icon-catalogs` | Regenerate **FaIconPickerInput** catalogs. |

## Utility scripts (`.utility-scripts/`)

| Script | Role |
| --- | --- |
| `quasarBuildElectronSummarized.mjs` | Summarized Electron build |
| `playwrightWithArtifactTrim.mjs` | Playwright wrapper + artifact trim |
| `auditQuasarComponentTokens.mjs` | Quasar component token audit |
| `auditScssConsumerLiterals.mjs` | Consumer SCSS literal audit |
| `domainPolicyGrep.mjs` | Domain policy grep |
| `runFullProjectAudit.mjs` | Chained local audits |
| `generateFaQuasarIconCatalogs.mjs` | Icon catalog generation |
| `policyComplianceAudit.mjs` | Policy audit |
| `auditYagni.mjs` / `auditYagniFullTriage.mjs` | YAGNI scan + full triage |
| `syncI18nLocaleTreeFromEnUs.mjs` | Locale tree sync (maintainer) |
| `batchTranslateI18nLocales.mjs` | Batch translate (maintainer) |

## Configuration

[Quasar config](https://quasar.dev/quasar-cli-vite/quasar-config-file) — **`quasar.config.ts`**. **`tsconfig.json`** extends **`.quasar/tsconfig.json`**.

## Native modules (better-sqlite3)

After Electron/Node version changes: clean **`yarn install`** (**`postinstall`** → **`electron-builder install-app-deps`**). If bindings missing: **`yarn rebuild:native`**, then retry dev/build.

## Project databases (`.faproject`)

SQLite per project; schema **`user_version` max 1** (flattened pre-release) — [docs/database/projectDB.md](docs/database/projectDB.md). Template custom fields design: [templateCustomFields.md](docs/database/templateCustomFields.md).

**Project settings refresh:** **`DialogProjectSettings`** IPC-reads on open (**`getProjectSettings`**, **`listWorldsForProjectSettings`**, **`listDocumentTemplatesForProjectSettings`**); save via **`saveProjectSettings`**. No Pinia-only seed. See [fa-project-database-access.mdc](.cursor/rules/fa-project-database-access.mdc), [fantasia-sqlite-main](.cursor/skills/fantasia-sqlite-main/SKILL.md).

Pre-release schema flatten: [fantasia-flatten-database-schemas](.cursor/skills/fantasia-flatten-database-schemas/SKILL.md).

Types: [types-folder.mdc](.cursor/rules/types-folder.mdc).
