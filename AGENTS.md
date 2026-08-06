# AI and agent notes — Fantasia Archive

**Fantasia Archive** — worldbuilding DB manager; **Quasar + Vue 3 + Electron** (GPL-3.0). **Yarn 1.x**, **Node 22.22.0+** (`package.json` `engines.node`). CI: **Node 22.22**, **`yarn testbatch:verify`** on push/PR ([`.github/workflows/verify.yml`](.github/workflows/verify.yml)). Agents: dev scoped gate during edits ([dev-scoped-verify.mdc](.cursor/rules/dev-scoped-verify.mdc)); full verify at commit/final cleanup. Manual **Build App** workflow ([`.github/workflows/build.yml`](.github/workflows/build.yml)) packages **Windows**/**macOS**/**Linux** only — **no CI test gate**; run **`yarn testbatch:ensure:nochange`** locally first.

## Where guidance lives

- **Rules** (path-scoped): [`.cursor/rules/`](.cursor/rules/)
- **Skills** (playbooks): [`.cursor/skills/*/SKILL.md`](.cursor/skills/) — frontmatter `name`, `description`

## Maintainer doc style (caveman — mandatory)

All edits to **`AGENTS.md`**, **`README.md`**, **`docs/database/README.md`**, **`docs/database/projectDB.md`**, **`.cursor/rules/*.mdc`** (except **`caveman-default.mdc`**), **`.cursor/skills/**/SKILL.md`** **must** follow [`.agents/skills/caveman-compress/SKILL.md`](.agents/skills/caveman-compress/SKILL.md):

- Drop articles/filler; fragments OK; keep paths, commands, versions, ESLint ids, IPC names, schema columns **exact**
- Expand only when new enforcement/workflow needs it; **link** canonical rule/skill — no copy-paste essays
- Prefer fewer bullets over duplicate prose across AGENTS / README / rules / skills

Human install for optional AI tooling: [README.md](README.md) **Optional: Caveman ecosystem**.

## Caveman ecosystem (optional)

Not required to build/ship app. **caveman** → [`.cursor/rules/caveman-default.mdc`](.cursor/rules/caveman-default.mdc). **YAGNI** minimal code inside repo guardrails → [`.cursor/rules/yagni.mdc`](.cursor/rules/yagni.mdc), [fantasia-yagni](.cursor/skills/fantasia-yagni/SKILL.md). **cavemem** → global CLI + [`.cursor/hooks.json`](.cursor/hooks.json). Hooks **fail-open**.

## Repository layout (repo root)

- **Config only** at root: **`package.json`**, Quasar/Vite/TS/ESLint/Playwright configs, **`.utility-scripts/`** (not **`src/scripts/`**). No loose functional **`.ts`** at root.
- **`i18n/`** at repo root (not **`src/i18n/`**); import **`app/i18n`**
- **`docs/database/`** — [projectDB.md](docs/database/projectDB.md), [templateCustomFields.md](docs/database/templateCustomFields.md), [appUserDataKv.md](docs/database/appUserDataKv.md); sync on schema/IPC changes ([docs-database.mdc](.cursor/rules/docs-database.mdc))
- **`helpers/`** — Playwright harness packages (**`playwrightHelpers_universal/`**, **`_e2e/`**, **`_component/`**); no Vitest coverage on Playwright trees. Non-Playwright **`helpers/<name>/`** → colocate **`_tests/*.vitest.test.ts`**. **`vitest/`** configs at repo root. Playwright helpers must not **`import`** from **`electron`** — use Electron-free shared modules (e.g. **`playwrightIsolatedUserDataDirName.ts`**)

## Rule files (`.mdc`)

| File | Scope |
| --- | --- |
| [electron-preload.mdc](.cursor/rules/electron-preload.mdc) | `src-electron/**` — preload, **`electron-ipc-bridge.ts`** |
| [playwright-tests.mdc](.cursor/rules/playwright-tests.mdc) | `**/*playwright*.ts` — locators, keyboard, layout hooks |
| [vitest-tests.mdc](.cursor/rules/vitest-tests.mdc) | `**/*.vitest.test.ts` |
| [vue-quasar.mdc](.cursor/rules/vue-quasar.mdc) | `**/*.vue` — Composition API, extraction |
| [vue-bem-scss.mdc](.cursor/rules/vue-bem-scss.mdc) | `**/*.vue` — BEM + scoped SCSS |
| [component-styles-folder.mdc](.cursor/rules/component-styles-folder.mdc) | `src/components/**` — **`styles/`** for extracted SCSS |
| [vue-template-test-hooks.mdc](.cursor/rules/vue-template-test-hooks.mdc) | `**/*.vue` — **`data-test-*`** |
| [storybook-stories.mdc](.cursor/rules/storybook-stories.mdc) | `**/_tests/*.stories.ts` |
| [typescript-scripts.mdc](.cursor/rules/typescript-scripts.mdc) | `src/scripts/**` |
| [project-scss.mdc](.cursor/rules/project-scss.mdc) | `src/css/**` |
| [eslint-typescript.mdc](.cursor/rules/eslint-typescript.mdc) | Always — ESLint, **`vue-tsc`** |
| [git-conventional-commits.mdc](.cursor/rules/git-conventional-commits.mdc) | Always — commits |
| [changelog-en-us.mdc](.cursor/rules/changelog-en-us.mdc) | Always — **`changeLog.md`** vs **`package.json` version** |
| [clarify-before-assume.mdc](.cursor/rules/clarify-before-assume.mdc) | Always — ask before product/UX/scope/implementation assumptions; planning emphasis |
| [plan-documents.mdc](.cursor/rules/plan-documents.mdc) | Always — **`.cursor/plans/`** |
| [testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc) | Always — dev scoped gate default; full **`testbatch:verify`** for cleanup/commit/explicit |
| [dev-scoped-verify.mdc](.cursor/rules/dev-scoped-verify.mdc) | Always — touched lint + connected Vitest after ordinary edits |
| [dev-electron-compile-check.mdc](.cursor/rules/dev-electron-compile-check.mdc) | Always — scoped gate after edits; **20s** dev compile smoke (kill agent-spawned dev) |
| [code-size-decomposition.mdc](.cursor/rules/code-size-decomposition.mdc) | Always — Vue/TS/function line caps, **`return { }`** shape |
| [yagni.mdc](.cursor/rules/yagni.mdc) | Always — reuse ladder, minimal diff inside mandatory structure + gates |
| [fa-action-manager.mdc](.cursor/rules/fa-action-manager.mdc) | `src/scripts/actionManager/**` |
| [fa-project-database-access.mdc](.cursor/rules/fa-project-database-access.mdc) | `src-electron/mainScripts/**` — **`faProjectDatabaseEnsureConnected.ts`** |
| [docs-database.mdc](.cursor/rules/docs-database.mdc) | `docs/database/**`, project IPC |
| [flatten-database-schemas.mdc](.cursor/rules/flatten-database-schemas.mdc) | Pre-release schema squash |
| [fa-template-custom-fields.mdc](.cursor/rules/fa-template-custom-fields.mdc) | Template fields design |
| [neverthrow.mdc](.cursor/rules/neverthrow.mdc) | **`Result`** / **`ResultAsync`** |
| [fa-two-level-architecture.mdc](.cursor/rules/fa-two-level-architecture.mdc) | Always — **`functions/`** vs **`*_manager.ts`** |
| [types-folder.mdc](.cursor/rules/types-folder.mdc) | Always — shared types under **`types/`** |
| [final-cleanup.mdc](.cursor/rules/final-cleanup.mdc) | Always — end-of-batch ship workflow |
| [fa-he-tree.mdc](.cursor/rules/fa-he-tree.mdc) | **`@he-tree/vue` only**; **`QTree` forbidden** |
| [fa-document-workspace-edit-state.mdc](.cursor/rules/fa-document-workspace-edit-state.mdc) | **`DocumentWorkspacePage`**, tab **`editState`** preview vs edit |
| [fa-drag-drop-lists.mdc](.cursor/rules/fa-drag-drop-lists.mdc) | List/table DnD policy |
| [fa-icon-picker.mdc](.cursor/rules/fa-icon-picker.mdc) | **`FaIconPickerInput`**, **`yarn generate:icon-catalogs`** |
| [fa-select-input.mdc](.cursor/rules/fa-select-input.mdc) | **`FaSelectInput`**, **`src/scripts/faSelectInput/`**, modes **`simple`** / **`document`** / **`otherType`** / **`tags`** (**`media`** stub) |
| [fa-locale-translations-input.mdc](.cursor/rules/fa-locale-translations-input.mdc) | **`FaLocaleTranslationsInput`**, **`src/scripts/localeTranslations/`**, Project Settings world name / template titles / world appendix / layout groups / placement nicknames |
| [fa-context-menu-dividers.mdc](.cursor/rules/fa-context-menu-dividers.mdc) | **`q-menu`** / dropdown action rows — group separator vs **separatorAlt** |
| [caveman-default.mdc](.cursor/rules/caveman-default.mdc) | Always — agent reply caveman style |
| [en-us-ui-copy-capitalization.mdc](.cursor/rules/en-us-ui-copy-capitalization.mdc) | **`en-US`** UI copy capitalization |

## Stack (short)

| Area | Technology |
| --- | --- |
| UI | Vue 3, Quasar 2, TS; trees **`@he-tree/vue` only**; lists **`vue-draggable-plus`**; **`QTable`** rows **`quasar-ui-q-draggable-table`** |
| Desktop | Electron |
| State | Pinia, Vue Router |
| i18n | vue-i18n — repo-root **`i18n/`** |
| Boot | **`src/boot/`** — **`tooltip-defaults`** patches global **`q-tooltip`** delay (**`FA_Q_TOOLTIP_DELAY_MS`**, 500 ms) |
| Lint/types | ESLint, **`vue-tsc`** (**`quasar.config.ts`** **`typescript.strict: true`**), Stylelint |
| Unit | Vitest — **`yarn test:unit`**; **`coverage.thresholds.perFile: true`** — each instrumented file **95/80/100/95** (stmts/branches/funcs/lines); dev edits → [fantasia-dev-scoped-verify](.cursor/skills/fantasia-dev-scoped-verify/SKILL.md); full **`yarn testbatch:verify`** at cleanup/commit |
| UI/E2E | Playwright — rebuild Electron before runs |
| Storybook | 10 — **`.storybook-workspace/`** |
| DB | **`better-sqlite3`**; **`.faproject`** SQLite **`user_version` max 6** — see [projectDB.md](docs/database/projectDB.md) |

## Subsystems (pointers)

| Topic | Rule / skill |
| --- | --- |
| Neverthrow | [neverthrow.mdc](.cursor/rules/neverthrow.mdc), [fantasia-neverthrow](.cursor/skills/fantasia-neverthrow/SKILL.md) |
| YAGNI / minimal diffs | [yagni.mdc](.cursor/rules/yagni.mdc), [fantasia-yagni](.cursor/skills/fantasia-yagni/SKILL.md) — orthogonal to [caveman-default.mdc](.cursor/rules/caveman-default.mdc) |
| Electron preload + IPC | [electron-preload.mdc](.cursor/rules/electron-preload.mdc), [fantasia-electron-preload](.cursor/skills/fantasia-electron-preload/SKILL.md), [fantasia-electron-main](.cursor/skills/fantasia-electron-main/SKILL.md) — **`app://`**, IPC sender, navigation allowlist, path hardening; **packaged DevTools required** (not a security disable target) |
| Domain script barrels | **`faDragDrop_manager`**, **`dom_manager`**, **`faColorContrast_manager`**, **`documentAppearance_manager`**, **`faColorPicker_manager`**, **`faSelectInput_manager`**, **`openedDocuments_manager`** — [typescript-scripts.mdc](.cursor/rules/typescript-scripts.mdc), [fa-two-level-architecture.mdc](.cursor/rules/fa-two-level-architecture.mdc) |
| Global keybinds | [fantasia-keybinds](.cursor/skills/fantasia-keybinds/SKILL.md) |
| Action manager | [fa-action-manager.mdc](.cursor/rules/fa-action-manager.mdc), [fantasia-action-manager](.cursor/skills/fantasia-action-manager/SKILL.md) |
| Project Settings | [fantasia-sqlite-main](.cursor/skills/fantasia-sqlite-main/SKILL.md), [projectDB.md](docs/database/projectDB.md) — IPC-read on open; **`saveProjectSettings`**; worlds + template layout + document templates |
| Workspace sidebar | **`/home`** **`QSplitter`**, **`S_FaProjectSidebar`**, **`project_data.sidebar_width`** — **`ProjectHierarchyTree`**, **`S_FaProjectHierarchyTree`**, **`ProjectHierarchyTreeSearch`**, **`ProjectAppControlBar`**, **`ProjectWorkspaceWorldList`**, **`S_FaProjectWorkspaceWorlds`**; **`project_data.hierarchy_tree_ui_state`**; [projectDB.md](docs/database/projectDB.md); E2E [checkWorkspaceSidebar.playwright.spec.ts](e2e-tests/checkWorkspaceSidebar.playwright.spec.ts) |
| Document workspace **`editState`** | Per-tab preview vs edit — **`I_faOpenedDocumentTab.editState`**, **`DocumentWorkspacePage`**, [fa-document-workspace-edit-state.mdc](.cursor/rules/fa-document-workspace-edit-state.mdc), [fantasia-document-workspace-edit-state](.cursor/skills/fantasia-document-workspace-edit-state/SKILL.md) |
| Floating **`Window*`** | [fantasia-floating-windows](.cursor/skills/fantasia-floating-windows/SKILL.md) — shared **`_sharedWindowStyling/`**, **`_sharedWindowNoteboard/`**; noteboard content presence → **`FaCornerContentDot`** on menus + app control bar |
| Dialog open/dismiss | **`dialogManagement_manager`** — **`tryDismissFaComponentDialogIfOpen`** / **`tryDismissFaMarkdownDocumentIfOpen`**; open-action handlers toggle-dismiss; App/Project/Keybind Settings **`:persistent="isDirty"`** |
| Trees / DnD | [fa-he-tree.mdc](.cursor/rules/fa-he-tree.mdc), [fa-drag-drop-lists.mdc](.cursor/rules/fa-drag-drop-lists.mdc), skills **fantasia-he-tree**, **fantasia-drag-drop** — vertical tabs: JS **pointerHover** (not CSS `:hover`) after Sortable reorder |
| App theme | **`appTheme`** enum (**`types/faUserSettingsAppThemeRegistry.ts`**) — flat/fantasy × light/dark; **`applyFaAppThemeToDocument`** → **`body.fa-appTheme--flat|fantasy`**, **`body--dark|light`**, **`data-fa-app-theme`**, Quasar **`Dark`**; store **`S_FaUserSettings`**; palette **`$fantasy-dark`** / **`$fantasy-medium`**; ripples on globally, fantasy hides via CSS |
| Hide dead strike-through | **`hideDeadCrossThrough`** → **`applyFaHideDeadCrossThroughToDocument`** → **`body.fa-userSetting--hideDeadCrossThrough`**; CSS **`src/css/globals/faUserSettingsAccessibility.scss`** (dead tree + tab labels only); App Settings live preview |
| Placement count badges | Hierarchy + Project Settings layout: **`disableDocumentCounts`**, **`disableCategoryCount`**, **`invertCategoryPosition`**, **`doubleDashDocCount`** via **`projectHierarchyTreePlacementCount*`** |
| Component-testing seed | **`I_faComponentTestingStoreSeed`** + **`faComponentTestingStoreSeedPatchWiring`**; optional **`projectContentOverrides`** (entity maps / placement children / search) — Playwright **`TEST_ENV=components`** |
| Packaged DevTools | **Help / keybind Toggle developer tools** must work when **`app.isPackaged`** — [fantasia-electron-main](.cursor/skills/fantasia-electron-main/SKILL.md) **Packaged DevTools**; never no-op **`registerFaDevToolsIpc`** for packaging |
| **`FaIconPickerInput`** | [fa-icon-picker.mdc](.cursor/rules/fa-icon-picker.mdc), [fantasia-icon-picker](.cursor/skills/fantasia-icon-picker/SKILL.md) |
| **`FaSelectInput`** | [fa-select-input.mdc](.cursor/rules/fa-select-input.mdc), [fantasia-select-input](.cursor/skills/fantasia-select-input/SKILL.md) — QSelect chips; modes **`simple`** / **`document`** / **`otherType`** / **`tags`** (**`media`** stub); whole-word filter highlight; menu **600px** centered; separatorAlt between options |
| **`FaColorPickerInput`** | **`src/components/elements/FaColorPickerInput/`** + **`src/scripts/faColorPicker/`** + **`faColorContrast_manager`** + **`types/I_faColorPickerInput.ts`** — hex color field + popover (no dedicated rule/skill yet) |
| **`FaLocaleTranslationsInput`** | [fa-locale-translations-input.mdc](.cursor/rules/fa-locale-translations-input.mdc), [fantasia-locale-translations-input](.cursor/skills/fantasia-locale-translations-input/SKILL.md) |
| Vue / Quasar / SCSS | [vue-quasar.mdc](.cursor/rules/vue-quasar.mdc), [vue-bem-scss.mdc](.cursor/rules/vue-bem-scss.mdc), [project-scss.mdc](.cursor/rules/project-scss.mdc), [fantasia-quasar-vue](.cursor/skills/fantasia-quasar-vue/SKILL.md), [fa-context-menu-dividers.mdc](.cursor/rules/fa-context-menu-dividers.mdc), [fantasia-context-menu-dividers](.cursor/skills/fantasia-context-menu-dividers/SKILL.md) |
| i18n | [fantasia-i18n](.cursor/skills/fantasia-i18n/SKILL.md), [en-us-ui-copy-capitalization.mdc](.cursor/rules/en-us-ui-copy-capitalization.mdc) |
| Testing | [dev-scoped-verify.mdc](.cursor/rules/dev-scoped-verify.mdc), [testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc), [dev-electron-compile-check.mdc](.cursor/rules/dev-electron-compile-check.mdc), [vitest-tests.mdc](.cursor/rules/vitest-tests.mdc), [playwright-tests.mdc](.cursor/rules/playwright-tests.mdc), [fantasia-dev-scoped-verify](.cursor/skills/fantasia-dev-scoped-verify/SKILL.md), [fantasia-testing](.cursor/skills/fantasia-testing/SKILL.md) |
| Storybook | [storybook-stories.mdc](.cursor/rules/storybook-stories.mdc) |
| Git / changelog / cleanup | [git-conventional-commits.mdc](.cursor/rules/git-conventional-commits.mdc), [changelog-en-us.mdc](.cursor/rules/changelog-en-us.mdc), [fantasia-final-cleanup](.cursor/skills/fantasia-final-cleanup/SKILL.md) |
| Two-level architecture | [fa-two-level-architecture.mdc](.cursor/rules/fa-two-level-architecture.mdc), [fantasia-two-level-architecture](.cursor/skills/fantasia-two-level-architecture/SKILL.md) |
| Types | [types-folder.mdc](.cursor/rules/types-folder.mdc) only |

## Renderer components (`src/components/`)

Buckets: **`dialogs/`**, **`floatingWindows/`** (incl. **`_sharedWindowStyling/`**, **`_sharedWindowNoteboard/`**), **`globals/`**, **`elements/`** (e.g. **`FaSelectInput`**, **`FaIconPickerInput`**, **`FaLocaleTranslationsInput`**, **`FaColorPickerInput`**, **`FaLabeledBooleanToggle`**, **`FaVerticalDraggableTabList`**, **`FaDeleteConfirmButton`**, **`FaCornerContentDot`**), **`projectUI/`**, **`other/`**, **`foundation/`** (Storybook-only). Five infrastructure helpers use **`_` prefix**: **`_FaFloatingWindowBodyTeleport`**, **`_FaFloatingWindowFrameResizeHandles`**, **`_FaUserCssInjector`**, **`_FaProjectUserCssInjector`**, **`_FaModalAndFloatingWindowHost`**. SFC order: **`<template>`**, **`<script>`**, **`<style>`**. Size limits: [code-size-decomposition.mdc](.cursor/rules/code-size-decomposition.mdc).

## Code comments

No Markdown bold/italic in comments. Single quotes for inline refs. No mid-sentence JSDoc wraps.

## Cross-toolchain

- **Storybook** — **`.storybook-workspace/`**; VRT **`yarn test:storybook:visual`**
- **Electron packaged** — **`file://`**; use relative **`public/`** paths when needed
- **Playwright** — production build under **`dist/electron`**; isolated **`userData`** — see [playwright-tests.mdc](.cursor/rules/playwright-tests.mdc)

## Suggested agent profiles

| Profile | Focus |
| --- | --- |
| Electron / preload | `src-electron/`, IPC, [fantasia-electron-preload](.cursor/skills/fantasia-electron-preload/SKILL.md); packaged **Toggle developer tools** required — [fantasia-electron-main](.cursor/skills/fantasia-electron-main/SKILL.md) **Packaged DevTools** |
| Keybinds | [fantasia-keybinds](.cursor/skills/fantasia-keybinds/SKILL.md) |
| Tests | Vitest + Playwright — [fantasia-testing](.cursor/skills/fantasia-testing/SKILL.md) |
| Feature / UI | `src/` Vue — [fantasia-quasar-vue](.cursor/skills/fantasia-quasar-vue/SKILL.md) |
| SQLite / schema | [projectDB.md](docs/database/projectDB.md), [fantasia-sqlite-main](.cursor/skills/fantasia-sqlite-main/SKILL.md) |

## Skill index

| Skill | Role |
| --- | --- |
| `fantasia-dev-setup` | Install, dev, build |
| `fantasia-dev-scoped-verify` | Default post-edit gate — connected Vitest + touched lint |
| `fantasia-testing` | Vitest, Playwright |
| `fantasia-electron-preload` | Preload, IPC names |
| `fantasia-electron-main` | Main process, **`mainScripts/`** |
| `fantasia-keybinds` | Global shortcuts |
| `fantasia-action-manager` | Central action dispatch + toasts |
| `fantasia-quasar-vue` | Vue/Quasar structure |
| `fantasia-context-menu-dividers` | **`q-menu`** row dividers — group separator vs **separatorAlt** |
| `fantasia-two-level-architecture` | **`functions/`** + **`*_manager.ts`** |
| `fantasia-floating-windows` | In-renderer **`Window*`** |
| `fantasia-he-tree` | **`@he-tree/vue`**; DnD scroll playbook **`.cursor/plans/he-tree-dnd-scroll-playbook_*.plan.md`** |
| `fantasia-drag-drop` | List/table DnD |
| `fantasia-icon-picker` | **`FaIconPickerInput`** |
| `fantasia-select-input` | **`FaSelectInput`**, multi-mode QSelect chips |
| `fantasia-locale-translations-input` | **`FaLocaleTranslationsInput`**, per-locale strings in Project Settings |
| `fantasia-i18n` | Locale trees |
| `fantasia-sqlite-main` | Main-process SQLite |
| `fantasia-flatten-database-schemas` | Schema squash |
| `fantasia-template-custom-fields` | Template fields (design; next schema **v7+**) |
| `fantasia-worldbuilding-domain` | Product vocabulary |
| `fantasia-document-workspace-edit-state` | Opened tab **`editState`**, preview vs edit fields on **`DocumentWorkspacePage`** |
| `fantasia-markdown-dialogs` | QMarkdown dialogs |
| `fantasia-release-build` | Production packaging |
| `git-conventional-commits` | Commit workflow |
| `fantasia-changelog-en-us` | In-app changelog |
| `fantasia-plan-documents` | **`.cursor/plans/`** |
| `fantasia-neverthrow` | **`Result`** patterns |
| `fantasia-yagni` | YAGNI ladder, minimal diff inside gates |
| `fantasia-final-cleanup` | Verify → docs → changelog → commit → push |

Types policy: [types-folder.mdc](.cursor/rules/types-folder.mdc). Contributor commands: [README.md](README.md).
