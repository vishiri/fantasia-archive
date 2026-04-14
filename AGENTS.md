# AI and agent notes — Fantasia Archive

This repository is **Fantasia Archive**: a **worldbuilding database manager** shipped as a **Quasar + Vue 3 + Electron** desktop app (GPL-3.0). Use **Yarn 1.x** and **Node.js 22.22.0 or newer** for local work (see `README.md` and `package.json` `engines.node`; Quasar `@quasar/app-vite` v2 enforces this minimum). CI uses **22.22** on push/PR (**`.github/workflows/verify.yml`** runs **`yarn testbatch:verify`** only: lint, types, stylelint, then Vitest with coverage — see **Testing expectations** for **`src-electron`**, **`helpers`**, repo-root **`i18n/`**, **`src`** TypeScript vs **Vue** SFC rules) and on manual release builds (**`.github/workflows/build.yml`**).

## Where project AI guidance lives

- **Cursor rules** (path-scoped): `[.cursor/rules/](.cursor/rules/)`
- **Cursor skills** (task playbooks): `[.cursor/skills/](.cursor/skills/)` — each folder contains a `SKILL.md` with frontmatter `name` and `description`.

## Repository layout (repo root)

- The **repository root** is for project **configuration** (**`package.json`**, **Quasar** / **Vite** / **TypeScript** / **ESLint** / **Playwright** config files, **`index.html`**), **`README`**, lockfiles, and the existing **`scripts/`** folder for small automation (including **`quasarBuildElectronSummarized.mjs`** for **`yarn quasar:build:electron:summarized`** / **`yarn testbatch:ensure:*`**). Do **not** add new loose functional **`.ts`** modules at the root.
- **vue-i18n** locale trees (**`i18n/`** — registry **`index.ts`**, **`externalFileLoader.ts`**, **`specialCharactersFixer.ts`**, and per-locale **`en-US/`**, **`fr/`**, **`de/`**, etc.) live at the **repository root** next to **`src/`**, not under **`src/i18n/`**. Import the registry with **`app/i18n`** or **`app/i18n/...`** (the **`app`** alias resolves to the repo root).
- **Cross-cutting harness or tooling** (for example Playwright-only helpers) belongs under top-level **`helpers/`** in a dedicated package folder (today: **`helpers/playwrightHelpers/`**). Vitest project configs, shared coverage defaults, and **`vitest.setup.ts`** live under repo-root **`vitest/`** (not inside **`helpers/`**) so the **`unit-helpers`** 100% coverage gate applies only to real helper packages; the repo root keeps **`vitest.config.mts`** as the multi-project entry only. Keep implementation **`.ts`** modules and colocated **`_tests/*.vitest.test.ts`** files inside each **`helpers/<package>/`** tree; import from specs with the **`app`** alias (for example **`app/helpers/playwrightHelpers/playwrightUserDataReset`**). **`yarn test:unit`** runs those suites under the Vitest project **`unit-helpers`** via the glob **`helpers/**/*.vitest.test.ts`** in [vitest.helpers.config.mts](vitest/vitest.helpers.config.mts), so new helper packages are picked up **automatically** once they live under **`helpers/`** and use the **`*.vitest.test.ts`** suffix—**add matching Vitest coverage whenever you add or materially change helper logic** (same discipline as **`src-electron`** and **`src/scripts`**). Do **not** create parallel harness-only **`helpers/`** trees under **`src/`**; keep those packages at the repo root under **`helpers/`**. Shared constants those helpers need from main-process code must stay in **Electron-free** modules (for example **`mainScripts/appIdentity/playwrightIsolatedUserDataDirName.ts`** next to **`mainScripts/appIdentity/fixAppName.ts`**) so Node-side Playwright never imports files that **`import`** from **`electron`**.

## Rule files (`.mdc`)


| File                                                                       | Glob / scope                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [electron-preload.mdc](.cursor/rules/electron-preload.mdc)                 | `src-electron/**/*.ts` — bridge APIs, preload boundaries, IPC channel registry (`electron-ipc-bridge.ts`) |
| [playwright-tests.mdc](.cursor/rules/playwright-tests.mdc)                 | `**/*playwright*.ts` — structure, env, locators, layout size (`data-test-layout-*` / caps, optional `boundingBox`), comments |
| [vitest-tests.mdc](.cursor/rules/vitest-tests.mdc)                         | `**/*.vitest.test.ts` — JSDoc, flat `test`/`test.skip`, imports           |
| [vue-quasar.mdc](.cursor/rules/vue-quasar.mdc)                             | `**/*.vue` — Composition API, Quasar, i18n, script size and extraction    |
| [vue-bem-scss.mdc](.cursor/rules/vue-bem-scss.mdc)                         | `**/*.vue` — BEM class names and scoped SCSS only                         |
| [vue-template-test-hooks.mdc](.cursor/rules/vue-template-test-hooks.mdc)   | `**/*.vue` — `data-test-locator` and other Playwright-facing `data-test-*` template attributes  |
| [storybook-stories.mdc](.cursor/rules/storybook-stories.mdc)               | `**/_tests/*.stories.ts` — Story scope, layout/page canvas-only (no Docs), `TEST_ENV` restrictions |
| [typescript-scripts.mdc](.cursor/rules/typescript-scripts.mdc)             | `src/scripts/**/*.ts` — `_utilities`, splitting modules                   |
| [project-scss.mdc](.cursor/rules/project-scss.mdc)                         | `src/css/**/*.scss` — globals, Quasar variables                           |
| [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc)             | Always — ESLint, `vue-tsc` (`yarn lint:typescript`), Quasar/tsconfig/Vitest alignment |
| [git-conventional-commits.mdc](.cursor/rules/git-conventional-commits.mdc) | Always — `type: subject` commits; see skill for split + approval workflow |
| [changelog-en-us.mdc](.cursor/rules/changelog-en-us.mdc)                   | Always — en-US `changeLog.md` vs `package.json` version (see skill)       |
| [plan-documents.mdc](.cursor/rules/plan-documents.mdc)                     | Always — plan files in `.cursor/plans` with timestamp + version metadata; prune plans with mtime older than 30 days before saving a new one |
| [testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc) | Always — **quality gate** via `yarn testbatch:verify`; `yarn quasar:build:electron`, Playwright, and Storybook test/VRT each in their own terminal unless using **`yarn testbatch:ensure:nochange`** / **`yarn testbatch:ensure:change`** |
| [code-size-decomposition.mdc](.cursor/rules/code-size-decomposition.mdc) | Always — **Vue ≤250 lines**, **TS module ≤200 lines**, **function ≤50 lines** (ESLint); split via **`scripts/`** + subcomponents; external `<style>` import only with **explicit user approval** |


## Stack (short)


| Area           | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| UI             | Vue 3, Quasar 2, TypeScript                                      |
| Desktop        | Electron, Quasar Electron mode                                   |
| State / routes | Pinia, Vue Router                                                |
| i18n           | vue-i18n (repo-root **`i18n/`**)                                 |
| Lint / types   | ESLint (`yarn lint:eslint`), `vue-tsc` (`yarn lint:typescript`), Stylelint (`yarn lint:stylelint`) — see [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc) |
| Unit tests     | Vitest — **`yarn test:unit`** (no coverage); **`yarn testbatch:verify`** runs **`yarn test:coverage:verify`** with layered gates (**`src-electron`**, **`helpers`**, **`src`** **`.ts`** vs **`.vue`** watermarks) — [vitest-tests.mdc](.cursor/rules/vitest-tests.mdc), [vitest/](vitest/) |
| UI / E2E tests | Playwright (`yarn test:components`, `yarn test:e2e`)              |
| Component docs | Storybook 10 (`yarn storybook:run`, `yarn storybook:build`)        |
| DB (evolving)  | `better-sqlite3` in main process (`src-electron/electron-main.ts` stub) |


## Extending Electron APIs

Renderer code uses `**window.faContentBridgeAPIs`**, defined in preload (`src-electron/electron-preload.ts`) and typed in `src/globals.d.ts`. New surface area: implement in `src-electron/contentBridgeAPIs/`, register in preload, extend the appropriate repository-root **`types/`** module (for example **`types/I_faElectronRendererBridgeAPIs.ts`**) plus **`src/globals.d.ts`**, and add tests under `contentBridgeAPIs/_tests/`. Details: `.cursor/skills/fantasia-electron-preload/SKILL.md`.

**Main ↔ preload IPC**: Any feature that uses `ipcRenderer` from preload and `ipcMain` in main must share channel strings from `src-electron/electron-ipc-bridge.ts` (add a new `export const` group there). Wire main-side handlers in `src-electron/mainScripts/ipcManagement/register*Ipc.ts` (see existing `registerFaDevToolsIpc` / `registerFaUserSettingsIpc`), invoke those registrars during app startup (`startApp()` in `mainScripts/appManagement.ts`, which `electron-main.ts` calls **before** `openAppWindowManager()` so handlers exist before preload runs), and use the same constants from the matching `contentBridgeAPIs/` module. Persisted user settings in main live under `src-electron/mainScripts/userSettings/` (`userSettingsStore.ts`, `faUserSettingsDefaults.ts`); `registerFaUserSettingsIpc` imports the store from there.

**IPC style (async first)**: Prefer **async** IPC (`ipcMain.handle` + `ipcRenderer.invoke`, Promise-returning bridge methods) whenever the flow can tolerate async. **Synchronous** `ipcRenderer.sendSync` and similar blocking patterns are **not forbidden** but are a **last resort** — use only when there is no remotely reasonable async alternative; add a brief comment at the handler or note it in review so the exception stays visible.

**IPC payloads and runtime validation**: Renderer and preload TypeScript types do not prove the shape of values at `ipcMain.handle` / `ipcRenderer.invoke` boundaries. Treat handler arguments as **`unknown`** (or validate immediately), then parse with **Zod** in **main** for **objects** you merge, store, or forward (strict object schemas reject extra keys; optional fields model partial patches). Keep schemas in **`src-electron/shared/`** next to other Electron-free helpers (for example `faUserSettingsPatchSchema.ts` built from `FA_USER_SETTINGS_DEFAULTS` keys). On failure, throw from the handler so `invoke` rejects and callers can surface errors (see `S_FaUserSettings` for renderer-side handling). For **one primitive** per channel (for example a single URL string), **`typeof`** plus a dedicated predicate (as in `registerFaExternalLinksIpc` with `checkIfExternalUrl`) remains appropriate; wrapping only `z.string()` adds little unless you combine it with `refine`/`superRefine` for the same rules. **`zod`** lives in **`package.json`** **`dependencies`**. Details: `.cursor/skills/fantasia-electron-main/SKILL.md`, `.cursor/rules/electron-preload.mdc`.

**Renderer sandbox**: The main window sets **`webPreferences.sandbox: true`** with **`contextIsolation: true`** and **`nodeIntegration: false`** in `mainScripts/windowManagement/mainWindowCreation.ts`. Electron’s [Process Sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox) and [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation) docs describe the model. Preload code under `contentBridgeAPIs/` must stay within the sandbox-safe surface (see `.cursor/rules/electron-preload.mdc`); use main + IPC for **`shell.openExternal`**, filesystem paths, and similar privileges (`registerFaExtraEnvIpc`, `registerFaExternalLinksIpc`, and follow the same pattern for new capabilities).

## Global keyboard shortcuts (faKeybinds)

Electron desktop builds support **app-wide** shortcuts from the **renderer**: **`src/layouts/MainLayout.vue`** registers a **capture-phase** **`window`** **`keydown`** listener after **`S_FaKeybinds().refreshKeybinds()`** succeeds (only when **`process.env.MODE === 'electron'`** and **`window.faContentBridgeAPIs.faKeybinds`** exists; skipped in Storybook canvas and non-Electron dev).

- **Matching and actions**: **`src/scripts/keybinds/faKeybindHandleKeydown.ts`** (**`createFaKeybindKeydownHandler`**) reads context from **`faKeybindKeydownContext.ts`** (Pinia **`S_FaKeybinds`** snapshot: overrides + platform + **`suspendGlobalKeybindDispatch`**), walks **`FA_KEYBIND_COMMAND_DEFINITIONS`** in **`faKeybindCommandDefinitions.ts`**, resolves each command’s effective chord (defaults plus user overrides), compares the event, honors **`firesInEditableFields`**, then calls **`faKeybindRunCommand`** in **`faKeybindRunCommand.ts`** for the first match.
- **Persistence**: Main stores per-command overrides under **`src-electron/mainScripts/keybinds/`** (**`faKeybindsStore.ts`**, defaults, Zod patch schema in **`src-electron/shared/`**). **`registerFaKeybindsIpc.ts`** registers **`ipcMain.handle`** using **`FA_KEYBINDS_IPC`** from **`electron-ipc-bridge.ts`**. Preload **`contentBridgeAPIs/faKeybindsAPI.ts`** exposes **`getKeybinds`** / **`setKeybinds`** on **`window.faContentBridgeAPIs`** (see **Extending Electron APIs** above).
- **Settings UI**: **`src/components/dialogs/DialogKeybindSettings/`** — the table is driven by the same **`FA_KEYBIND_COMMAND_DEFINITIONS`** list (**`dialogKeybindSettingsTable.ts`** exports **`buildDialogKeybindSettingsRows`** and related helpers). **`dialogKeybindSettingsDialogWiring.ts`** registers **`registerDialogKeybindSettingsGlobalSuspend`**, which sets **`S_FaKeybinds.setSuspendGlobalKeybindDispatch(true)`** while the main dialog or capture sheet is open so global shortcuts do not fire during capture.
- **Command ids**: **`types/I_faKeybindsDomain.ts`** (**`FA_KEYBIND_COMMAND_IDS`**, **`T_faKeybindCommandId`**) is the canonical string union for **`id`** fields across renderer, types, and IPC payloads.

**Adding a new shortcut command**: extend **`T_faKeybindCommandId`**, **`FA_KEYBIND_COMMAND_DEFINITIONS`**, **`faKeybindRunCommand`**, locale **`dialogs.keybindSettings.commands.*`**, and tests for touched modules. Full step list and file pointers: **`.cursor/skills/fantasia-keybinds/SKILL.md`**.

## Code comments (JSDoc, line comments, block comments)

When writing comments in source files (not in user-facing Markdown documents such as the in-app changelog):

- Do not use Markdown emphasis in comments (double-asterisk bold or asterisk-wrapped italic); it clutters plain text in editors and diffs.
- Use single quotes for inline code or identifier references (for example 'ipcMain.handle', 'src/components/') instead of grave accents (backticks).
- There is **no** comment line-length budget: do **not** wrap prose in the middle of a sentence across JSDoc or block-comment lines (avoid ending one ` * ` line with a half-sentence and continuing on the next). Prefer one full sentence per line, or a short opening line plus ` * - ` bullet lines for details, instead of a long paragraph split arbitrarily.

## Code size and decomposition (enforced)

- **`.vue` SFCs**: keep each file **at or under 250 lines** (ESLint `max-lines`, with blank/comment skipping per config). If growth would exceed that, split into **`scripts/*.ts`** modules and/or **subcomponents** in the same feature folder. Moving scoped CSS to a standalone file and re-importing it is a **last-resort anti-pattern** and requires **explicit user approval** before it is applied anywhere.
- **TypeScript modules** (non-exempt paths): **≤200 lines** per file; split by concern when a file would exceed that.
- **Script file count (components and shared TS):** prefer **logical grouping** in fewer modules until limits force a split — do not default to one tiny file per helper. Many **10–20 line** files are discouraged when the same code could live together and stay under **200 lines** per file and **50 lines** per function. Applies to **`src/components/<bucket>/<Feature>/scripts/*.ts`** and to **`src/scripts/`** feature folders; see [code-size-decomposition.mdc](.cursor/rules/code-size-decomposition.mdc) **Module count: prefer logical grouping** and [typescript-scripts.mdc](.cursor/rules/typescript-scripts.mdc). When production `scripts/` files merge, consolidate colocated **`scripts/_tests/*.vitest.test.ts`** where practical.
- **Functions** (JS/TS and Vue `<script>`): **≤50 lines** per function; decompose into smaller named units when a body would exceed that.
- **Exemptions** from these ESLint rules: Vitest specs, Playwright specs, Storybook stories, config modules, **`i18n/**/*.ts`**, **`types/**/*.ts`**, **`**/*.d.ts`**, **`vitest/**/*.mts`**, **`.storybook-workspace/`** (nested workspace), and root **`scripts/**/*.mjs`** (see [code-size-decomposition.mdc](.cursor/rules/code-size-decomposition.mdc) and `eslint.config.mjs`).

## Type naming conventions

- Keep the existing prefix strategy: `I_` for interfaces and `T_` for TypeScript type aliases (do not use `T_` for locale files; those use `L_` — see i18n conventions).
- Favor singular names for single-item shapes (`I_appMenuItem`, `T_documentName`) and collection-oriented names for grouped structures (`I_appMenuList`, `I_socialContactButtonSet`).
- Keep unions and function signatures consistently spaced (for example, `string | false`, `(...args: unknown[]) => unknown | void`).
- Store cross-cutting app and bridge shapes under repository-root **`types/`** in domain modules (for example **`I_faKeybindsDomain.ts`**, **`I_faElectronRendererBridgeAPIs.ts`**, **`I_dialogProgramSettings.ts`**) instead of many single-export files; follow the **TypeScript interfaces and types (`types/`)** section at the end of this file.

## Renderer components (`src/components/`)

Group new SFCs under one bucket (each feature folder still owns `_tests/`, optional `_data/`, optional `scripts/`):

- **`dialogs/`** — modal `Dialog*` components.
- **`globals/`** — shared app chrome (`GlobalWindowButtons`, `AppControlMenus`, `AppControlSingleMenu`).
- **`elements/`** — small reusable widgets (`FantasiaMascotImage`, `SocialContactSingleButton`).
- **`other/`** — other composites (`SocialContactButtons`).
- **`foundation/`** — Storybook-only design catalogues (for example **`FoundationColorPalette`**, **`FoundationTextList`**): Quasar theme reference, not in-app routes. See **Foundation components** below.

### Foundation components (`src/components/foundation/`)

- **Purpose**: Visual guidance in **Storybook** for typography, palette, and similar cross-cutting **Quasar** + Fantasia tokens. Maintainers use them to compare class scales and **SCSS** variables without hunting the main app.
- **Not product UI**: Do not import these into production pages, dialogs, or menus. Keep copy in **English** inside the SFC (no **`i18n/`** locale modules for **`foundation/`**).
- **Storybook**: One canvas-only story per feature (**`parameters.docs.disable: true`**), **`meta.title`** **`Components/foundation/<ComponentName>`**, and **`tags: ['skip-visual']`** so **`yarn test:storybook:visual`** skips long or unstable catalogue pages (same mechanism as other **skip-visual** stories).
- **Tests**: Colocated **`_tests/*.vitest.test.ts`** for mount smoke checks; **do not** add **`*.playwright.test.ts`** under **`foundation/`** (no Electron component-test coverage for catalogues).
- **Adding a new catalogue**: Create **`src/components/foundation/<Name>/`** with the **`.vue`**, optional **`scripts/*.ts`** for static tables, shared typings in **`types/`** (for example **`types/I_foundationCatalogues.ts`**), **`_tests/<Name>.stories.ts`**, and **`_tests/<Name>.vitest.test.ts`**. Mirror **`FoundationColorPalette`** / **`FoundationTextList`** for **SCSS** tokens, **skip-visual**, and viewport globals when the page is wide.

## Global CSS: `hasScrollbar`

The app defines a global class **`hasScrollbar`** in [`src/css/globals/scrollbar.scss`](src/css/globals/scrollbar.scss). Add it to elements that **act as scroll containers** (or will when content overflows) when a vertical scrollbar may **appear or disappear** depending on content or viewport, so **`scrollbar-gutter: stable`** reserves space and avoids **horizontal layout shift**. Use for dialogs, side panels, long lists, or similar. Details: [project-scss.mdc](.cursor/rules/project-scss.mdc), [vue-quasar.mdc](.cursor/rules/vue-quasar.mdc), [fantasia-quasar-vue skill](.cursor/skills/fantasia-quasar-vue/SKILL.md).

## Theme tokens (`quasar.variables.scss`)

Central **SCSS variables** for colors, sizes, and related design tokens live in [`src/css/quasar.variables.scss`](src/css/quasar.variables.scss). When adding or editing styles in **`src/css/**/*.scss`** or Vue **`<style lang="scss">`** under **`src/`**, extract new literals into that file under the correct group and section (Quasar colors, Globals, Quasar components, then custom component/page/layout). Use **hyphen-separated** segments after the camelCase block in every **`$` name** (no underscores). Naming, section banners, and exceptions are defined in [project-scss.mdc](.cursor/rules/project-scss.mdc) and [vue-bem-scss.mdc](.cursor/rules/vue-bem-scss.mdc). Template-only dimensions and colors are out of scope unless policy changes.

## i18n conventions

### File structure (`i18n/en-US/`)

Locale strings live under `i18n/en-US/` in a fixed folder hierarchy:

- `documents/` — Markdown source files (`.md`, imported with `?raw` and passed through `specialCharacterFixer`).
- `components/<bucket>/<ComponentName>/` — same buckets as `src/components/` (`globals`, `elements`, `other`); one or more `L_*.ts` locale modules per component with user-visible strings. The **`foundation/`** bucket is **not** mirrored under **`i18n/`** (Storybook-only catalogues use inline English).
- `dialogs/` — one `L_<DialogName>.ts` per dialog.
- `pages/` — one `L_<PageName>.ts` per page.
- `globalFunctionality/` — one `L_<feature>.ts` per app-wide, non-component concern (e.g. store notifications).

`index.ts` composes the full locale tree. It must contain **only imports and the composed export object** — no hardcoded user-visible strings. The only intentionally inline section is `quasarNotify` (a single, stable key).

### Key naming

- All top-level keys in `index.ts` use **camelCase with a lowercase first letter** (e.g. `globalWindowButtons`, `appControlMenus`, `dialogs`, `errorNotFound`, `globalFunctionality`).
- Sub-keys within `L_*.ts` locale modules also use camelCase with a lowercase first letter.
- `index.ts` must contain no hardcoded user-visible strings; every string lives in a dedicated `L_*.ts` file.
- The `documents` section is the only one that uses `specialCharacterFixer`; do not add plain string keys there.
- App-wide strings that do not belong to a specific component, dialog, or page go in `globalFunctionality/`. Uncategorised strings live in `globalFunctionality/L_unsortedAppTexts.ts` under the `globalFunctionality.unsortedAppTexts` key.

### Usage

- In Vue templates, use `$t('camelCaseKey.subKey')` for translations. Do **not** import `useI18n` just to call `t(...)` inside SFC scripts when template `$t(...)` can be used.
- In TypeScript scripts and Pinia stores, import `{ i18n } from 'app/i18n/externalFileLoader'` and call `i18n.global.t('camelCaseKey.subKey')`.
- Never hardcode user-visible prose in `.vue` templates, `_data/` files, or scripts; always route through an i18n key. **Exception**: **`src/components/foundation/**`** catalogue SFCs (Storybook-only reference) use fixed English in templates, like **`FoundationColorPalette`** and **`FoundationTextList`**.

### Storybook i18n

- Do **not** import the full `i18n/en-US/index.ts` (or `i18n/index.ts`) in Storybook helpers/mocks — markdown `documents/*.md` imports can break Vite import analysis.
- For Storybook-only i18n mocks, import non-markdown `L_*` locale modules directly and provide placeholder lorem ipsum strings for `documents.*` markdown keys.

## Linting and static analysis

- **No TSLint** — use **ESLint** (**`eslint.config.mjs`**, **neostandard**, **typescript-eslint**, **eslint-plugin-vue**), **`yarn lint:typescript`** for **`vue-tsc -p tsconfig.json --noEmit`** (type-checks **`.vue`** SFCs and `.ts`; plain **`tsc`** alone does not check `<script setup>` bodies), and **`yarn lint:stylelint`** for Vue/CSS/SCSS/Sass (see [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc)). **ESLint** does not run full type-checking on Vue scripts unless configured with type-aware **`parserOptions.project`**; **`yarn lint:typescript`** is what catches TS errors inside SFCs.
- In TypeScript code (including Vue `<script lang="ts">`), use `import type` for type-only imports.
- **`@typescript-eslint` v8** / **typescript-eslint** should stay aligned with **TypeScript ~6.0** in `package.json` to avoid `typescript-estree` unsupported-version warnings (including from **vite-plugin-checker** in dev).
- **`src/env.d.ts`** declares **`*.vue`** modules and **`/// <reference types="vite/client" />`** so **`import.meta.env`** and Vite’s **`ImportMeta`** augmentation resolve in the IDE and in **`vue-tsc`**. Root **`tsconfig.json`** excludes generated **`.quasar`** output from the repo tree; Quasar still emits **`.quasar/tsconfig.json`** for path aliases.
- Before commits that touch lint-covered sources, run the **quality gate** in one terminal: **`yarn testbatch:verify`** (see [testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc) and commit gate in [git-conventional-commits.mdc](.cursor/rules/git-conventional-commits.mdc)).

## Git commits

- Messages: `**feat` | `fix` | `test` | `chore` | `refactor` | `style` | `docs**`, then `**:**` and an imperative subject (e.g. `fix: close window on menu exit`).
- **`yarn install`** runs **`husky`** (**`prepare`** in **`package.json`**) so **`.husky/commit-msg`** validates the message with **`commitlint`** and **`commitlint.config.mjs`** (same types as above; lines starting with **`Merge `** or **`Revert `** are skipped). Smoke-check without committing: **`echo "feat: example" | yarn lint:commit`**.
- To split work into several commits with **confirmation before each**: ask the agent to follow [git-conventional-commits skill](.cursor/skills/git-conventional-commits/SKILL.md).
- Before any commit (or changelog edit for new work), follow this order ([testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc)):
  1. Run the **quality gate** in one terminal: `yarn testbatch:verify` (must pass; run `yarn lint:eslint`, `yarn lint:typescript`, `yarn lint:stylelint`, `yarn test:unit`, or `yarn test:coverage:verify` / `yarn test:coverage:electron` / `yarn test:coverage:helpers` / `yarn test:coverage:src` individually only while debugging). **Exception**: if the **only** pending commit contents are **`i18n/*/documents/changeLog.md`** (per-locale in-app changelog Markdown) and **`yarn testbatch:verify` already succeeded** on the current tree **after** the last substantive code or product edits with **no** other uncommitted changes since then, you may skip re-running the gate before that commit; if **anything is uncertain**, run **`yarn testbatch:verify`** anyway. When the change affects TypeScript, Vue, Electron TS, or other lint-scoped files, ESLint is required — see [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc).
  2. Verify Storybook coverage/updates for affected user-facing **`src/components/**`** (`_tests/*.stories.ts`, mocks/placeholders as needed). Layout/page Storybook previews are canvas-only (no Docs requirement); see [storybook-stories.mdc](.cursor/rules/storybook-stories.mdc). Skip when the commit is **changelog-only** under the same exception as step 1 and Storybook was already satisfied for the prior work.
  3. If Storybook is aligned for touched components, update changelog if required (and mirror **`documents/changeLog.md`** under other locales when you maintain translations).
  4. Commit.
- If any gate fails (lint, types, stylelint, or Vitest/coverage), stop the commit flow, do not create a commit, and report a concise summary of what failed and where (failing suites/tests, file paths, and key error locations/messages).

## Changelog (in-app)

- English changelog: [i18n/en-US/documents/changeLog.md](i18n/en-US/documents/changeLog.md). **Version** in [package.json](package.json) is the only source of truth. **NEVER, EVER, UNDER ANY CIRCUMSTANCES** auto-bump any version in changelog or `package.json`; update changelog entries under the existing package version unless the user explicitly requests a manual version change. Do not add empty `###` sections or “none” placeholder bullets. Changelog Markdown is compiled as a **vue-i18n** message: **do not** use stray **`{...}`** — not only shell globs like **`.*.{vue,css}`**, but also **object-literal-shaped** text (for example Playwright **`locator.hover({ force: true })`**) which triggers **message compilation** errors such as **invalid token in placeholder**. Rephrase without literal braces; see [changelog-en-us.mdc](.cursor/rules/changelog-en-us.mdc) and [fantasia-changelog-en-us skill](.cursor/skills/fantasia-changelog-en-us/SKILL.md).
- Changelog bullets are for **user- or release-relevant changes** (features, fixes, meaningful dependency refreshes, etc.). **Do not** log internal QA as changelog text: omit lines that only say the team re-ran `yarn testbatch:verify`, `yarn testbatch:ensure:nochange`, `yarn testbatch:ensure:change`, `yarn lint:eslint`, `yarn lint:typescript`, `yarn lint:stylelint`, `yarn test:unit`, production builds, Playwright component tests, E2E, Storybook smoke/visual runs, or that “all gates passed”. Follow [changelog-en-us.mdc](.cursor/rules/changelog-en-us.mdc) and [fantasia-changelog-en-us skill](.cursor/skills/fantasia-changelog-en-us/SKILL.md).
- Changelog-edit guard: always re-open [package.json](package.json) immediately before updating changelog content and use that live `version` value for section targeting.
- For changelog updates tied to fresh work, ensure Storybook updates/checks for affected **`src/components/**`** UI are completed before editing the changelog entry.

## Testing expectations

- **Vitest**: **`yarn test:unit`** runs the workspace (**`unit-electron`**, **`unit-src-renderer`**, **`unit-helpers`**, **`unit-i18n`**, **`unit-components`**) without coverage. **`yarn testbatch:verify`** runs **`yarn test:coverage:verify`**: **100%** v8 thresholds on all four metrics for **`src-electron`**, for **`helpers/**/*.ts`** packages (**`unit-helpers`**), and for scoped **`i18n/`** entry modules (**`unit-i18n`** — see [vitest.i18n.config.mts](vitest/vitest.i18n.config.mts)); **100%** on all four metrics for renderer **`.ts`** in **`src/boot`**, **`src/scripts`**, and **`src/stores`** (**`unit-src-renderer`**); **100%** statements, functions, and lines (branch totals reported but not gated) for **`.ts`** under **`src/components`**, **`src/layouts`**, and **`src/pages`** in **`unit-components`** coverage — see [vitest/](vitest/) configs. **`.vue`** SFCs have **no** CI threshold; **`unit-components`** uses **watermarks** (~**60%** lower band)—totals **below ~60%** lines or statements should trigger review. Add or extend **`_tests/*.vitest.test.ts`** when you change **`helpers/`**, **`i18n/`**, or any covered **`src`** surface. Coverage projects use the **`agent`** terminal reporter plus **`json`** (see **`vitest/vitest.reporters.shared.ts`**) so passing tests do not spam the terminal. [vitest-tests.mdc](.cursor/rules/vitest-tests.mdc) covers **`*.vitest.test.ts`** style and the **Vitest coverage tiers (CI)** section lists the same gates in order.
- For **`src/components/**`**, **`src/layouts/**`**, and **`src/pages/**`**, keep a **1:1 Vitest presence baseline**: each feature **`.vue`** has a colocated **`_tests/<Name>.vitest.test.ts`** (same **`_tests/`** tree pattern as Storybook previews for layouts and pages). Add/rename/remove SFC + Vitest counterpart together. **Extracted `scripts/*.ts`** beside a component must stay within enforced **`.ts`** metrics when those files are in the **`unit-components`** coverage **`include`** list; add **`scripts/_tests/*.vitest.test.ts`** when they contain non-trivial logic (Pinia sync, tree updates, etc.).
- **`_data/` holds production structured feeds** (menus, lists, etc.). **Vitest** and **Playwright** fixture objects live **inside** their own `*.vitest.test.ts` / `*.playwright.test.ts` files (inline `const` / literals), not in `_data/` and **not** in extra `_tests/*.ts` files whose only role is fixture storage. **Never** add `_tests/_data/`. Do **not** add tests whose **only** system-under-test is a file under `_data/`; exercise production data indirectly (components, boot, scripts).
- Treat 1:1 component-test parity as **coverage presence** for **`.vue`** files (no CI percentage gate); still treat colocated **`.ts`** logic as subject to the strict **`.ts`** metrics above when it appears in the **`unit-components`** coverage **`include`** list.
- **Playwright** requires a **production build** before runs when source affecting the app has changed. Follow [playwright-tests.mdc](.cursor/rules/playwright-tests.mdc) for test sources; use [vue-template-test-hooks.mdc](.cursor/rules/vue-template-test-hooks.mdc) when changing locators in `.vue` templates. See `.cursor/skills/fantasia-testing/SKILL.md` and `README.md`. Component and E2E specs set **`TEST_ENV`** so the main process uses **`%APPDATA%/<package name>/playwright-user-data`** (e.g. **`Roaming\fantasia-archive\playwright-user-data`**, not **`fantasia-archive-dev`**). Electron applies that layout in **`src-electron/mainScripts/appIdentity/fixAppName.ts`**; the shared folder segment **`PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME`** lives in **`src-electron/mainScripts/appIdentity/playwrightIsolatedUserDataDirName.ts`** (no **`electron`** import). **`helpers/playwrightHelpers/playwrightUserDataReset.ts`** imports only the latter so Playwright’s Node loader never pulls in **`appIdentity/fixAppName`** (which would fail on **`import { app } from 'electron'`** during test discovery). Specs use **`test.describe.serial`**; each group’s **`test.beforeAll`** calls **`resetFaPlaywrightIsolatedUserData()`** before that group’s **`electron.launch`** so disk matches the shared session (avoid **`beforeEach`** reset while one Electron app stays alive). That keeps **`electron-store`** and future **`userData`** files off your **`quasar dev`** profile and normal packaged use.
- **Playwright locators**: Prefer **`data-test-locator`** for primary ids and additional **`data-test-*`** attributes from `.vue` templates when tests need extra semantics (`[data-test-locator="..."]`, `[data-test-menu-any="..."]`, `[data-test-tooltip-text]`, etc.). Do **not** use bare `data-test`. Avoid BEM or Quasar class selectors unless no hook exists. Exceptions (ARIA, portaled UI, E2E copy): still **centralize the string in `selectorList`** — for example a full locator `'[role="tooltip"]'` under a name such as `quasarTooltip`, not a raw literal in the test body. E2E `getByText` labels likewise belong in `selectorList` when used as stable locators. For many identical tooltip triggers, duplicate tooltip body text on the trigger (for example `data-test-tooltip-text`) and assert that attribute for bulk checks; keep at least one hover + live tooltip assertion per spec so tooltips still prove out. Component specs use a documented `selectorList` (and optional small helpers for dynamic `data-test-locator` suffixes), matching patterns in existing `*.playwright.test.ts` files. For **declared width, height, or max-width caps**, assert **`data-test-layout-width`**, **`data-test-layout-height`**, or **`data-test-error-card-width`** (bound from the same source as props or markup) so narrow Electron windows do not shrink **`boundingBox()`** below the numeric cap; use **`locator.boundingBox()`** only when you need **rendered** pixels and the harness guarantees space, or for inequalities (see **Layout size (width and height)** in [playwright-tests.mdc](.cursor/rules/playwright-tests.mdc)).
- **Playwright Electron screen recordings:** Component and E2E serial suites attach **WebM** video for each **`electron.launch`** using the suite **`TestInfo`** from **`test.beforeAll`** (see **`helpers/playwrightHelpers/playwrightElectronRecordVideo.ts`**). After **`yarn test:components`** / **`yarn test:e2e`** (or **`:single`** / **`:single:ci`**), open **`test-results/playwright-report/index.html`** and drill into each test’s **Attachments** to play or download recordings; playable bytes live under **`test-results/playwright-report/data/`**. Each Playwright invocation **replaces** that report folder—running a different suite or re-running the same one overwrites the previous HTML report. **`scripts/playwrightWithArtifactTrim.mjs`** deletes **`test-results/playwright-artifacts`** after those yarn scripts so scratch output does not accumulate. Specs call **`installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)`** after **`firstWindow()`** so videos show a synthetic pointer dot (disable with **`FA_PLAYWRIGHT_CURSOR_MARKER=0`**). For agents: prefer pointing humans to the HTML report index rather than assuming reliable analysis of raw **`.webm`** files from context alone.
- Storybook visual snapshots intentionally ignore these Playwright-harness-only utility stories (not meaningful VRT targets): `layouts-componenttestinglayout--with-social-contact-single-button`, `pages-componenttesting--social-contact-single-button`.
- **Terminal use**: run the **quality gate** with **`yarn testbatch:verify`** unless debugging a single step ([testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc)). Run **`yarn quasar:build:electron`**, **`yarn test:components`**, **`yarn test:e2e`**, **`yarn test:storybook:smoke`**, and **`yarn test:storybook:visual`** (or **`:update`**) each in its own terminal; do not chain those with each other or append them to the quality gate in one line unless you intentionally run **`yarn testbatch:ensure:nochange`** or **`yarn testbatch:ensure:change`**. Root Playwright (**`playwright.config.ts`**) uses the **`line`** reporter; Storybook VRT uses the same pattern and optional **`FA_STORYBOOK_VISUAL_VERBOSE=1`** for per-story console progress ([storybook-stories.mdc](.cursor/rules/storybook-stories.mdc)).
- **Full-suite one-shot**: use **`yarn testbatch:ensure:nochange`** when you want one command to run **`testbatch:verify`** + **`yarn quasar:build:electron:summarized`** + Playwright component + Playwright E2E + **`yarn test:storybook:smoke`** + **`yarn test:storybook:visual`** (snapshot compare). Use **`yarn testbatch:ensure:change`** only when deliberately refreshing Storybook VRT baselines (ends with **`yarn test:storybook:visual:update`**); commit the resulting snapshot diffs with care. See [testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc).

## Storybook expectations

- Story files are stored in `_tests/` subfolders (for example `src/components/**/_tests/<Component>.stories.ts`). For **`src/components/**`**, set **`meta.title`** to **`Components/<bucket>/<ComponentName>`** where **`<bucket>`** is **`dialogs`**, **`elements`**, **`foundation`**, **`globals`**, or **`other`** (the parent folder under **`src/components/`**). **`Layouts/...`** and **`Pages/...`** titles stay at those roots only.
- **Layouts and pages** may have `src/layouts/**/_tests/*.stories.ts` and `src/pages/**/_tests/*.stories.ts` for **canvas-only** previews (router shells, smoke checks). Do **not** add Storybook **Docs** (no `autodocs` tag, no `parameters.docs.description`, keep `parameters.docs.disable: true`). Agents should not generate or expand documentation pages for layouts/pages in Storybook.
- Prefer Storybook for isolated **component** authoring/editing feedback; use `yarn storybook:run` for dev and `yarn storybook:build` for static output.
- Do **not** import the full `i18n/en-US/index.ts` (or `i18n/index.ts`) in Storybook helpers/mocks — see i18n conventions above.
- Do **not** add Storybook stories named `A11y/*` in this project.
- Do **not** create stories that only verify `TEST_ENV === 'components'`; keep those checks in Playwright/component-test flows.
- **Storybook VRT pixel budget** — Captures use **`expect(page).toHaveScreenshot(..., { maxDiffPixels })`** in **`.storybook-workspace/visual-tests/storybook.visual.playwright.test.ts`**. **`maxDiffPixels`** limits how many **pixels may differ** across the **entire** screenshot (not viewport width). Typical Storybook iframe shots have hundreds of thousands of total pixels; a cap on the order of **two thousand** differing pixels stays a **tight** gate while absorbing **GitHub Actions** **`windows-latest`** vs local **Windows** variance (**fonts**, **subpixel**, **Chromium**). If CI fails **`yarn test:storybook:visual`** with diffs **just above** the cap, read the log pixel counts and CI **diff** images before changing product UI—often the fix is adjusting the cap with a short comment, or running **`yarn test:storybook:visual:update`** when the visual change is deliberate. **README** **Storybook visual baseline policy** and **fantasia-testing** spell this out for contributors.
- **`GlobalLanguageSelector` Storybook story** — The **`Components/globals/GlobalLanguageSelector`** story uses **`tags: ['skip-visual']`** so **`yarn test:storybook:visual`** skips it: the static capture pipeline does not reliably show the fixed chrome control. Interactive **`yarn storybook:run`** still displays it for manual review when preview mocks and mode flags align. See **README** **Storybook visual baseline policy** and [storybook-stories.mdc](.cursor/rules/storybook-stories.mdc).

## Cross-toolchain reminders (Storybook + Electron + Playwright)

The same Vue UI runs under **dev server**, **Storybook**, **packaged Electron (`file://`)**, and **Playwright-driven Electron**. When something passes in one runner and fails in another, check these first:

- **Storybook** — CLI, Vite/Storybook config, **static build output** (`storybook-static/`), **Playwright** visual-regression config, and **`visual-tests/`** all live under [`.storybook-workspace/`](.storybook-workspace/) (see `.storybook-workspace/.storybook/`). Root `yarn storybook:run` / `yarn storybook:build` / `yarn test:storybook:visual*` delegate there. **`yarn storybook:build`** and **`yarn test:storybook:smoke`** use quiet CLI flags in the nested workspace; **`yarn storybook:run`** stays verbose for authoring. The default **Verify** workflow (`.github/workflows/verify.yml`) does **not** run Storybook VRT; optional maintainer workflows may run **`yarn testbatch:ensure:nochange`** on **`windows-latest`**. Use local **`yarn test:storybook:visual`** or **`yarn testbatch:ensure:nochange`** when validating snapshots. **Storybook VRT pixel budget** (above) matters when CI and local **Windows** disagree slightly. Keep [`staticDirs`](.storybook-workspace/.storybook/main.ts) and repo `public/` serving (including any Vite middleware for dev) aligned so assets such as `/images/...` match the Quasar app.
- **Electron packaged renderer** — Root-relative URLs like `/images/...` (common when `import.meta.env.BASE_URL` is `'/'` or empty) do **not** resolve next to `index.html` under `file://`. For files in `public/`, prefer a **relative** base (e.g. `./images/...`) when normalizing `BASE_URL`, unless the app is always served over HTTP with a matching absolute base.
- **Playwright** — Component and E2E suites use the **production** Electron build. After changes to code those tests exercise, run `yarn quasar:build:electron` before `yarn test:components` / `yarn test:e2e`. See [fantasia-testing skill](.cursor/skills/fantasia-testing/SKILL.md) and [playwright-tests.mdc](.cursor/rules/playwright-tests.mdc). Isolated test **`userData`** is **`%APPDATA%/<package name>/playwright-user-data`** (e.g. **`Roaming\fantasia-archive\playwright-user-data`**, not **`fantasia-archive-dev`**); **`mainScripts/appIdentity/fixAppName.ts`** wires it in Electron, and **`mainScripts/appIdentity/playwrightIsolatedUserDataDirName.ts`** shares the folder name with **`playwrightUserDataReset.ts`**. Specs use **`test.describe.serial`**; each group’s **`test.beforeAll`** calls **`resetFaPlaywrightIsolatedUserData()`** before that group’s launch (**`helpers/playwrightHelpers/playwrightUserDataReset.ts`**). Suite-scoped **WebM** recordings and report replacement / **`playwright-artifacts`** trim are summarized in **Testing expectations** above and **`README.md`**.

## Suggested Cursor agent profiles (manual presets)

Use different instructions or @-references when starting a task:

1. **Electron and preload** — Focus on `src-electron/`, bridge security, `globals.d.ts`, `electron-ipc-bridge.ts` for IPC channel names, Vitest for `contentBridgeAPIs`, `mainScripts/ipcManagement/register*Ipc`, and other `mainScripts/<area>/` modules (see **Architecture** in `README.md`).
2. **Global keyboard shortcuts (faKeybinds)** — Focus on `src/scripts/keybinds/`, `src/stores/S_FaKeybinds.ts`, `src/layouts/MainLayout.vue`, `src/components/dialogs/DialogKeybindSettings/`, `src-electron/mainScripts/keybinds/`, `contentBridgeAPIs/faKeybindsAPI.ts`, `registerFaKeybindsIpc.ts`, and `types/I_faKeybindsDomain.ts` (command ids, chords, snapshot, bridge types). Playbook: `.cursor/skills/fantasia-keybinds/SKILL.md`.
3. **Tests** — Vitest unit coverage in `src/` (including **`src/components/**`**, **`src/layouts/**`**, **`src/pages/**`**) + `src-electron/`, Playwright integration flows, build order, `e2e-tests/` vs `src/components/**/_tests/`.
4. **Feature / UI** — `src/` Vue + Quasar, Pinia, router, `ComponentTesting` page, i18n strings. Place SFCs under **`src/components/dialogs/`**, **`globals/`**, **`elements/`**, **`other/`**, or **`foundation/`** (design catalogues only — see **Foundation components** above) per [README](README.md) and this file. For **large production menu/config data**, split across **`src/components/<bucket>/<Feature>/_data/*.ts`**. When the **user explicitly requests** moving bulky **SFC script** logic out of a `.vue`, place those modules **only** under **`src/components/<bucket>/<Feature>/scripts/*.ts`**. Rare **embedded** component-mode-only payloads may live as **`const` inside the `.vue`**; Playwright passes isolated props via **`COMPONENT_PROPS`** defined inline in each spec. Details: [vue-quasar.mdc](.cursor/rules/vue-quasar.mdc).
5. **Data / SQLite** — Main-process storage, `userData` paths, migrations, exposing data via narrow preload APIs only.

## Skill index


| Skill                           | Role                                                                |
| ------------------------------- | ------------------------------------------------------------------- |
| `fantasia-dev-setup`            | Yarn, Node.js 22.22+, Quasar dev/build commands                     |
| `fantasia-testing`              | Vitest and Playwright workflows                                     |
| `fantasia-electron-preload`     | `faContentBridgeAPIs`, preload, and `electron-ipc-bridge.ts` IPC names |
| `fantasia-electron-main`        | Main process lifecycle, `mainScripts/` feature folders (`appIdentity`, `windowManagement`, `chromiumFixes`, `userSettings`, `nativeShell`, `ipcManagement`), and `appManagement.ts`   |
| `fantasia-keybinds`             | Global shortcuts: `src/scripts/keybinds/`, `S_FaKeybinds`, `MainLayout`, Keybind settings dialog, main `keybinds/` store, `faKeybindsAPI`, `registerFaKeybindsIpc` |
| `fantasia-quasar-vue`           | Vue/Quasar app structure                                            |
| `fantasia-i18n`                 | Repo-root **`i18n/`** and **`L_`* locale modules                    |
| `fantasia-sqlite-main`          | SQLite in main process                                              |
| `fantasia-worldbuilding-domain` | Product vocabulary and scope                                        |
| `fantasia-markdown-dialogs`     | QMarkdown dialogs and document markdown                             |
| `fantasia-release-build`        | Production build and packaging                                      |
| `git-conventional-commits`      | Logical commits, conventional `type:` messages, per-commit approval |
| `fantasia-changelog-en-us`      | `changeLog.md` strictly aligned to existing `package.json` version  |
| `fantasia-plan-documents`       | `.cursor/plans` filename, metadata, and 30-day mtime prune before new plans |
| `horse-around`                  | Parallel AI sessions coordinated with file-based orders and answers |


## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
