# Changelog
----------

## 2.4.10 - Program settings, ErrorCard, theme tokens, and contributor tooling

### New features
- **Tools → Program settings** opens the **Program settings** dialog (persistent until **Close**; **Save** is reserved for later wiring).
- **Program settings** lists every persisted boolean as **category → subcategory → toggle** rows with **en-US** / **fr** copy (title, description, optional red **note**). **Category** and **subcategory** tabs follow key order except **Accessibility** (always second-to-last) and **Developer settings** (always last); **toggles** within a subcategory sort by translated **title** (ties use the setting key). **Show document IDs** is under **Developer settings → Document body**. A top-level **Accessibility** tab groups wider scrollbars, tree count dividers, strike-through hiding, and text shadow; theme and related items stay under **Visuals & App-wide functionality** without nesting that block there.
- Added persistent **user settings** in the **Electron** main process (**electron-store** under app **userData**), starting with a **theme** preference (**light** or **dark**, default **light**), exposed to the renderer as **`window.faContentBridgeAPIs.faUserSettings`** (**get** / **set**).
- Added **`S_FaUserSettings`** Pinia store for managing user settings state in the renderer: loads the full settings set once on app start via the IPC bridge, accepts patch-based updates, and shows a **Quasar** success or failure notification after each save attempt.
- **Program settings** uses vertical **category** tabs (**`q-tabs`** / **`q-tab-panels`**) and a **scrollable** main column (**`q-scrollarea`**): the **title**, tab rail, and **Close** / **Save** stay fixed while content scrolls. Subcategory toggles use a responsive grid (**one** / **two** / **three** columns by breakpoint), place the **toggle** under the title, and show descriptions from a help icon **tooltip**.
- **Program settings** reloads persisted toggle values from **`S_FaUserSettings`** when the dialog opens using a guarded **Pinia** resolve so environments without an active user-settings store (for example **Storybook**) skip hydration instead of throwing; help-icon alignment next to multi-line titles is nudged for clearer vertical alignment with the first line.
- **ErrorCard** (**`src/components/elements/ErrorCard/`**): reusable **q-card** layout for error states (**title**, optional multi-line **details**, **FantasiaMascotImage** variant, configurable **max-width**); colocated **Storybook** preview and **Vitest**. The **Error not found** route uses it with the existing **`errorNotFound`** copy instead of an inline card and page-local **SCSS**.

### Bugfixes & Optimizations
- **SCSS** theme catalogue (**`quasar.variables.scss`**): Quasar palette, globals, **`q-*` adjustment tokens**, then per-feature sections; **`htmlAdjustments`**, **`scrollbar`**, **`quasarComponentsAdjustments`**, and matching **Vue** **`<style lang="scss">`** blocks use variables instead of scattered literals. Theme **`$`** identifiers use hyphen-separated segments only (see **`project-scss.mdc`**). Renamed the **qMarkdown** code background token to **`backgroundColor`** (was mistyped).
- **FantasiaMascotImage** uses **Quasar** **q-img** with spinner disabled; **width** and **height** props apply to **q-img**, the inner raster uses **img-class** for **user-select** parity, the duplicate **title** mirroring **alt** was removed from the wrapper, and the inner wrapper uses **`max-width: 100%`** so large **width** props do not overflow the viewport.
- In-app **changelog** and contributor docs: rephrased one **Playwright** bullet and expanded **vue-i18n** guidance so prose is not parsed as invalid placeholder syntax (curly-brace-shaped API snippets and similar).
- **Program settings** search: **vue-i18n** placeholder (**en-US** / **fr**). With a non-empty trimmed query, the vertical **category** tabs stay visible but dim behind a short **Animate.css** fade and cannot be clicked; the right column stacks **matching** settings in one scroll (case-insensitive substring on **title**, **tags**, and tooltip **description**; non-matching rows and empty sections are omitted; filtering in **`scripts/programSettingsSearching.ts`** with Vitest coverage), with major section lines inset like the separators under each subcategory block. When nothing matches, a centered card uses the same cream **Error Not Found**-style border and fill as **`ErrorNotFound`**, with **FantasiaMascotImage** in **reading** mode and a dedicated **searchNoResultsMessage** string. While search is active, the no-results card and the matching-results column stay in the document with visibility toggled (**v-show**) so the **reading** mascot can load before the empty state is shown. The search field keeps a fixed width when **clearable** shows its icon, stays usable above the dim layer, and clearing no longer throws when the control sets the model to empty. Subtle fades soften the top and bottom of the stacked results and along the search strip while search is active; scroll regions use stable scrollbar gutter so showing or hiding a vertical scrollbar does not nudge the layout sideways. **SCSS** **BEM** names for the search wrapper, sticky titles, and footer actions match the template so rules apply.
- **`rgbToHex`** and **`hexToRgb`** in **`src/scripts/_utilities/colorFormatConvertors.ts`**: **`rgbToHex`** now maps only the first three numeric channels so **rgba()**-style strings (for example from **`getComputedStyle`**) do not append an alpha nibble to the hex result, requires at least three matches before converting, and parses channel integers with an explicit radix; **`hexToRgb`** trims the input and strips a leading **`#`** before parsing. Colocated **Vitest** coverage exercises the updated paths.
- **`toggleDevTools`** (**`src/scripts/appInfo/toggleDevTools.ts`**) optional-chains through the **`toggleDevTools`** method on **`window.faContentBridgeAPIs.faDevToolsControl`** so a missing implementation does not throw when the bridge is partially stubbed (for example in tests or **Storybook**).
- Expanded **Vitest** suites across **Electron** (**contentBridgeAPIs**, **preload**, **mainScripts** including **userSettings** cleanup for nullish or partial persisted snapshots), **renderer** (**boot**, **stores**, **dialogs**, **program settings** scripts, **globals**, **pages**), repo-root **i18n** tests, and **helpers/playwrightHelpers** so layered coverage thresholds stay aligned with these fixes.
- **SocialContactButtons** **webpage** styling: **quasar.variables.scss** sets the webpage chip background to **$dark** instead of **$qCard-background** so it reads clearly on the dark toolbar.
- **Program settings**: subcategory-row and stacked-search top-level separators use shared helpers in **`scripts/programSettingsHelpers.ts`** (**`showNonLastSeparator`**, **`showNonLastTopCategorySeparator`**) with Vitest coverage; layout behavior matches the previous inline logic.
- Moved the entire **vue-i18n** locale tree from **`src/i18n/`** to repo-root **`i18n/`** (alongside **`src/`**); imports use **`app/i18n`** and **`app/i18n/...`**. **Vitest** **`unit-i18n`** (**`yarn test:coverage:i18n`**) enforces **100%** coverage on scoped **`i18n/`** entry **`.ts`** files; **README**, **AGENTS**, Cursor rules/skills, **Quasar** (**`@intlify/unplugin-vue-i18n`** include path), and **Storybook** aliases were updated.
- **vue-i18n** locale message files use an **`L_`** filename prefix (for example **`dialogs/L_programSettings.ts`**) so **`T_`** stays reserved for **TypeScript** type aliases; **Storybook** mocks, **Electron** spell-checker imports, tests, and contributor docs use the new paths.
- Local verification defaults are quieter: **Vitest** coverage uses the **agent** terminal reporter; **Playwright** component and **E2E** use the **line** reporter; **Storybook** static build and smoke use **quiet** CLI flags and calmer **Vite** production-preview logging; **Storybook** visual **Playwright** skips per-story **console** progress unless **FA_STORYBOOK_VISUAL_VERBOSE** is set; **`yarn testbatch:ensure:nochange`** and **`yarn testbatch:ensure:change`** invoke **`yarn quasar:build:electron:summarized`** so the full **Quasar** / **electron-builder** log is captured under **test-results** when a build fails. **README**, **AGENTS**, and Cursor rules and skills describe the scripts and opt-in verbose flags.
- **Playwright** runs (**`TEST_ENV`** **`components`** / **`e2e`**) use **`%APPDATA%/<package name>/playwright-user-data`** (e.g. **`fantasia-archive\playwright-user-data`**, not **`fantasia-archive-dev`**) so **user settings** (**`electron-store`**) stay separate from **`quasar dev`** and packaged profiles. Each component and **E2E** spec calls **`resetFaPlaywrightIsolatedUserData()`** in **`test.beforeEach`** so that folder is removed before every **`electron.launch`** and tests start from default persisted settings. The isolated profile folder name is shared through **`src-electron/mainScripts/appIdentity/playwrightIsolatedUserDataDirName.ts`** (no **`electron`** import) so Node-side reset and Vitest stay safe during test collection.
- Fixed packaged **Electron** **preload** path in **`mainScripts/windowManagement/mainWindowCreation`**: the main-process bundle resolves **`import.meta.url`** to the shared main chunk directory (not the **`windowManagement/`** source folder). Resolving **preload** and **icon** from that directory again loads **`electron-preload`** correctly so **`window.faContentBridgeAPIs`** (including **`extraEnvVariables`** for **`TEST_ENV`** / **`COMPONENT_NAME`**) is available; component **Playwright** runs route to **`/componentTesting/...`** instead of falling back to the default **Index** page.
- Split **`src-electron/mainScripts/`** into feature folders — **`appIdentity`**, **`chromiumFixes`**, **`ipcManagement`** (**`register*Ipc`** handlers), **`nativeShell`**, **`userSettings`**, and **`windowManagement`** — so **IPC** registration, **user settings**, window creation, and **Chromium**-adjacent fixes have stable import paths; **Vitest** and **Playwright** imports, **README**, **AGENTS**, and Cursor rules/skills follow the new layout.
- Follow-up contributor docs: **README** **Architecture** notes bundled **`electron-preload`** resolution under **`windowManagement/`**; **AGENTS** and **`electron-preload`** point **`faUserSettings`** **`electron-store`** to **`mainScripts/userSettings/`**; **`vitest-tests`** lists every **`mainScripts/<area>/tests/`** bucket; **`fantasia-electron-main`** warns against an extra **`..`** when resolving preload from **`import.meta.url`** in packaged builds.
- Cross-cutting **Playwright** harness modules (**`playwrightElectronRecordVideo`**, **`playwrightUserDataReset`**, and their Vitest suites) live under **`helpers/playwrightHelpers/`**; specs import **`app/helpers/playwrightHelpers/...`**. **Vitest** **`unit-helpers`** runs **`helpers/**/*.vitest.test.ts`** via **`vitest/vitest.helpers.config.mts`**; shared Vitest workspace configs live under repo-root **`vitest/`** so the strict **`helpers/**/*.ts`** coverage gate applies only to real helper packages. Contributor docs (**README**, **AGENTS**, Cursor rules/skills) describe **`helpers/`** for future harness packages so the repository root stays for config, **`README`**, lockfiles, and **`scripts/`**.
- **Vitest** coverage tiers are documented and wired in **`vitest/`**: **100%** v8 thresholds on **src-electron** and **helpers** packages; **100%** on all four metrics for scoped repo-root **`i18n/`** entry **.ts** files in **unit-i18n** (**`specialCharactersFixer`**, registry **`index.ts`**, **`externalFileLoader.ts`**, and per-locale **`en-US`**, **`fr`**, **`de`** index modules — see **`vitest/vitest.i18n.config.mts`**); **100%** on all four metrics for **src** renderer **.ts** in **unit-src-renderer** (**src/boot**, **src/scripts**, **src/stores** only — **`specialCharactersFixer`** moved out with the **`i18n/`** tree); **100%** statements, functions, and lines for **.ts** under **src/components**, **src/layouts**, and **src/pages** in **unit-components** (branch totals still print; that **.ts** slice skips a failing branch gate because **v8** can over-count iterator edges). **Vue** SFCs have no threshold; reports use **60%** watermarks so weak totals prompt review. **Program settings** render-tree **.ts** builds optional **note** leaves with an explicit assignment (not a conditional object spread); tests cover empty snapshots and reuse when two settings share a category and subcategory; Vitest imports sorting helpers from **programSettingsTreeSorting** directly. **README**, **AGENTS**, **.github/workflows/verify.yml** comments, **eslint-typescript**, **vitest-tests**, **testing-terminal-isolation**, **git-conventional-commits**, **playwright-tests**, **vue-quasar**, and skills (**fantasia-testing**, **fantasia-dev-setup**, **fantasia-changelog-en-us**, **fantasia-electron-preload**, **fantasia-quasar-vue**, **git-conventional-commits**) describe the same policy.
- **Root** **vitest.config.mts** registers **five** projects with **extends** into **vitest/** so the workspace **root** stays the repository and globs such as **src-electron/** resolve correctly. **package.json** **test:coverage:electron**, **test:coverage:helpers**, **test:coverage:i18n**, and **test:coverage:src** load those files; **tsconfig.json** excludes **vitest/vitest.components.config.mts** from the app typecheck. Former root-level **vitest.*.config.mts** / **vitest.setup.ts** fragments moved into **vitest/**.
- **Vitest** **`unit-components`** now includes **`src/layouts/**/*.vitest.test.ts`** and **`src/pages/**/*.vitest.test.ts`** alongside **`src/components/**`**, with a **1:1** **`tests/<Name>.vitest.test.ts`** baseline for each **`MainLayout`**, **`ComponentTestingLayout`**, **`IndexPage`**, **`ErrorNotFound`**, and **`ComponentTesting`** SFC. **Program settings** tree Vitest covers **`toSortedRecord`**, **`buildProgramSettingsRenderTree`**, category ordering, **`showDocumentID`** mapping, and local-settings management. **Electron** main Vitest adds coverage for **`suppressChromiumDevtoolsAutofillStderrNoise`**, **`registerFaDevToolsIpc`**, **`PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME`**, **`fixAppName`** when the product name is empty, expanded **mainWindowCreation** and **spellChecker** behavior, and **tweaks**; **`mainWindowCreation`** exposes **`assignAppWindowRefForTesting`** for unit tests only.
- **Renderer** and harness **Vitest** expansions: **boot** (**qmarkdown**, broader **externalLinkManager** cases), **stores** index module, **scripts** utility tests (**colorFormatConvertors**, **mdListArrayConverter**), **AppControlMenus**; **Playwright** helper packages gained deeper **`playwrightElectronRecordVideo`** and **`playwrightUserDataReset`** unit tests. **eslint.config.mjs** includes **vitest/** in the lint scope; **yarn.lock** reflects dependency updates from this work cycle.
- **Playwright** Electron **WebM** attachments can show a **synthetic red cursor dot** that follows scripted pointer moves (optional **`FA_PLAYWRIGHT_CURSOR_MARKER=0`** to disable); **Program settings** component spec retries **Quasar** live **tooltip** hover with **`expect().toPass`**, **`locator.hover`** with the **`force`** option enabled, and a slightly longer tab-panel settle delay to cut flakiness under **Electron**.
- **Program settings** help tooltip for the pronounced count divider now shows the vertical bar in the sentence: **vue-i18n** treats a bare **pipe** as message-format syntax, so the en-US string uses the documented backslash escape so the character renders literally.
- **Quasar** **ripple** is on by default again; **window** controls (**GlobalWindowButtons**) and the **AppControlSingleMenu** toolbar **`q-btn`** disable **ripple** so chrome and the menu strip stay visually steady.
- **DialogMarkdownDocument** increases the content **max-height** offset so tall dialogs still leave room for header and footer chrome when scrolling.
- Reorganized renderer **Vue** components under **`src/components/`** buckets — **`dialogs/`** (modal **`Dialog*`** SFCs), **`globals/`** (**`GlobalWindowButtons`**, **`AppControlMenus`**, **`AppControlSingleMenu`**), **`elements/`** (**`FantasiaMascotImage`**, **`SocialContactSingleButton`**), and **`other/`** (**`SocialContactButtons`**); mirrored locale modules under **`i18n/*/components/<bucket>/...`**, refreshed imports and **Storybook** mocks, fixed **`SocialContactSingleButton`** story imports after the move, updated **Storybook** VRT baseline for **Program settings**, and revised contributor docs (**README**, **AGENTS**, Cursor rules/skills).
- Stopped optional **program settings** **note** strings from triggering **vue-i18n** missing-key warnings when no **note** key exists for a setting (resolve notes only after a key-existence check).
- Added a startup cleanup pass for the persisted **user settings** store so legacy or unknown keys that no longer exist in **`src-electron/mainScripts/userSettings/faUserSettingsDefaults.ts`** are removed and the sanitized config is auto-saved.
- Extracted all hardcoded **en-US** locale strings from **`i18n/en-US/index.ts`** into dedicated per-feature locale modules per component, dialog, page, and global feature; normalized all top-level and sub-level i18n keys to **camelCase** with a lowercase first letter across the app.
- Aligned **Storybook**'s **`externalFileLoader`** mock (**`.storybook-workspace/.storybook/mocks/externalFileLoader.ts`**) with that **camelCase** message tree (including **`globalFunctionality`**) and wired non-markdown copy through the same locale modules the app uses, so component and layout previews—and local **`yarn test:storybook:visual`**—render real strings instead of raw translation key paths.
- Centralized **main ↔ preload** **IPC** channel names in **`src-electron/electron-ipc-bridge.ts`** (including **DevTools** sync channels) so **Electron** handlers and **preload** helpers cannot drift to mismatched strings; removed the older **DevTools**-only channel module.
- Documented **`electron-ipc-bridge.ts`**, **`mainScripts/ipcManagement/register*Ipc.ts`**, and **IPC** registration during **`startApp()`** (**`mainScripts/appManagement.ts`**) in **README**, **AGENTS**, and Cursor **`electron-preload`** / **`fantasia-electron-preload`** / **`fantasia-electron-main`** / **`fantasia-sqlite-main`** guidance so contributors and agents follow one end-to-end pattern.
- Added **`src/vue-i18n-shim.d.ts`** so **vue-i18n** injected globals (**`$t`**, **`$d`**, **`$n`**, and related **`$*`** helpers) are declared on **`@vue/runtime-core`**, aligning **Vue** SFC template typing with **`tsc`** and clearing spurious missing-**`$t`** diagnostics in editors that resolve **`ComponentCustomProperties`** through the runtime-core path.
- Replaced the main-process **`sqlite3`** dependency with **`better-sqlite3`** (synchronous **SQLite** bindings for the planned database layer; still a native addon—rebuild after **Electron**/**Node** bumps as documented in **README**). **AGENTS**, **`fantasia-sqlite-main`**, and the **`electron-main`** stub comment now refer to **`better-sqlite3`**.
- Renamed Storybook-related **Yarn** scripts under **`test:storybook:*`**: **`yarn test:storybook:visual`** (with **`:headed`**, **`:update`**, **`:update:headed`**) replaces **`yarn visual:storybook:*`**; **`yarn test:storybook:smoke`** replaces **`yarn storybook:smoke`**. **`.storybook-workspace`** script keys match. Updated **README**, **AGENTS**, Cursor rules/skills, and plan notes.
- Split the full-project gate: **`yarn testbatch:ensure:nochange`** runs **`testbatch:verify`**, production **Electron** build, **Playwright** component + **E2E**, **`yarn test:storybook:smoke`**, and **`yarn test:storybook:visual`** (snapshot compare). **`yarn testbatch:ensure:change`** is the same through smoke, then **`yarn test:storybook:visual:update`** for intentional baseline refresh. Removed **`yarn testbatch:ensure`**. Updated **README**, **AGENTS**, **testing-terminal-isolation**, **fantasia-testing**, **fantasia-dev-setup**, **fantasia-release-build**, and **changelog-en-us** guidance.
- Removed the **GitHub Actions** Storybook visual-regression job from **`.github/workflows/verify.yml`** and renamed the workflow to **Verify** (push/PR runs **`yarn testbatch:verify`** only; **`.storybook-workspace`** install kept for ESLint). Storybook VRT stays **local** or via **`yarn testbatch:ensure:nochange`**. Updated **README**, **AGENTS**, **testing-terminal-isolation**, **fantasia-testing**, **fantasia-dev-setup**, and **fantasia-changelog-en-us** (omit-list wording).
- Set **`actions/upload-artifact@v5`** on the manual **Build** workflow (**`.github/workflows/build.yml`**) for **Linux**, **macOS**, and **Windows** release artifacts, alongside **`actions/checkout@v5`** and **`actions/setup-node@v5`**, so artifact uploads stay on supported **GitHub Actions** runtimes.
- Bumped **Vue** to **`^3.5.32`** (root and **`.storybook-workspace`**), **`@types/node`** to **`^22.19.17`**, refreshed **root** and **`.storybook-workspace`** lockfiles with **`yarn upgrade`**, and set Storybook VRT **`toHaveScreenshot`** **`maxDiffPixels: 150`** so compare runs stay stable across rebuilds. Refreshed one **Win32** chromium snapshot affected by the toolchain bump.
- Renamed the markdown bullet-list helper to **`mdListArrayConverter`** (standard spelling) and normalized loop variable naming in **`specialCharacterFixer`**; **tips, tricks, and trivia** notifications and markdown document escaping are unchanged in behavior.
- Polished **en-US** copy in the **Advanced search guide**, **Tips, Tricks & Trivia**, and the **en-US** app name string for grammar, spelling, and clarity; fixed a missing article in the **README** Quasar CLI heading.
- Relocated every **`*.stories.ts`** file under the matching feature **`tests/`** tree (**`src/components/**/tests`**, **`src/layouts/**/tests`**, **`src/pages/**/tests`**) and pointed **`.storybook-workspace/.storybook/main.ts`** story globs at those paths so **Storybook** sits beside **Vitest** and **Playwright**; refreshed **Storybook** VRT snapshots (including **DialogProgramSettings** default and **DialogMarkdownDocument** previews).
- Enforced expanded multi-line object literals project-wide via **ESLint** (**`object-curly-newline`**, **`object-property-newline`**) for **JavaScript**, **TypeScript**, **Vue**, and **JSON**, with **`yarn lint:eslint`** running **`eslint .`** from the repo root.
- Extracted small file-local interfaces and type aliases from **Vue** and **TypeScript** sources into colocated **`<filename>.types.ts`** modules where applicable (renderer boot, Pinia typings, **Electron** tests, **Storybook** mocks) and recorded the convention in **README**, **AGENTS**, and Cursor rules/skills.
- Extended **Stylelint** with **`stylelint-order`** so **CSS custom properties** and regular **declarations** stay in **alphabetical** order (autofix via **`yarn lint:stylelint:fix`**); widened **`yarn lint:stylelint`** to scan **`vue`**, **`css`**, **`scss`**, and **`sass`** under **`src/`** and under **`.storybook-workspace/.storybook/`** (build output under **`storybook-static/`** stays ignored).
- **Electron Playwright** runs attach **WebM** screen recordings per test; open **`test-results/playwright-report/index.html`** after **`yarn test:components`** or **`yarn test:e2e`** (or the **`:single`** scripts) to review videos under each test’s **Attachments** (files under **`test-results/playwright-report/data/`**). Each Playwright run **replaces** that HTML report; **`scripts/playwrightWithArtifactTrim.mjs`** removes **`test-results/playwright-artifacts`** after those yarn commands so scratch output is not kept between runs. Documented in **README**, **AGENTS**, and Cursor **fantasia-testing** / **playwright-tests** guidance; optional **`FA_PLAYWRIGHT_NO_VIDEO`** skips recording.

## 2.4.9 - Contributor tooling, Pinia dialogs, and CI hardening

### Bugfixes & Optimizations
- Removed **`yarn visual:storybook:test:local`** and **`yarn visual:storybook:update:local`** (and matching **`.storybook-workspace`** **`storybook:visual:*:local`** scripts). For build + headed compare or snapshot refresh, use **`yarn test:storybook:visual:headed`** / **`yarn test:storybook:visual:update:headed`**; to run Playwright only when **`storybook-static/`** is already current, use **`yarn --cwd .storybook-workspace test:storybook:visual`** or **`test:storybook:visual:headed`** / **`test:storybook:visual:update`** / **`:update:headed`**. Updated **README**.
- Fixed **Pinia 3** dialog flow: **`S_DialogMarkdown`** and **`S_DialogComponent`** are now standard setup stores (call **`S_DialogMarkdown()`** / **`S_DialogComponent()`** at use sites). **`openDialogMarkdownDocument`**, **`DialogMarkdownDocument`**, and **`DialogAboutFantasiaArchive`** use guarded watchers when a store is not active (e.g. **Storybook**). **`ComponentTesting`** handles missing **`componentName`** routes safely and renders the harness only after a matching SFC is resolved.
- Simplified the **Index** preview page by removing the extra **Fantasia Mascot** block from the default **`IndexPage`** route (keeps the route as a lightweight shell for local links/testing).
- Renamed and grouped **Yarn** contributor scripts for clarity: quality gates **`yarn testbatch:verify`** / **`yarn testbatch:ensure`**; lint **`yarn lint:eslint`**, **`yarn lint:typescript`**, **`yarn lint:stylelint`**; Quasar Electron **`yarn quasar:build:electron`** / **`yarn quasar:dev:electron`**; Playwright **`yarn test:components`** and colon-suffixed **`test:components:*`**, **`test:e2e:*`**; Storybook dev **`yarn storybook:run`** and static **`yarn storybook:build`** (formerly **`build-storybook`**). Removed obsolete **`yarn test:full`** and duplicate **`yarn visual:storybook:ci`**; **GitHub Actions** call **`yarn visual:storybook:test`** directly. Updated **README**, **AGENTS**, Cursor rules/skills, **`package.json`**, **`testRunner_*.mjs`**, and workflows.
- Colocated Storybook **static output** (**`.storybook-workspace/storybook-static/`**), **Playwright** visual-regression config, **`visual-tests/`** (including committed snapshots), workspace **`storybook:visual:*`** scripts, and VRT devDependencies (**`http-server`**, **`@playwright/test`**) under **`.storybook-workspace/`**; root **`yarn visual:storybook:*`** delegates with **`yarn --cwd .storybook-workspace`**. Updated **`.gitignore`**, **`tsconfig.json`**, and **`lint:eslint`** paths.
- Set explicit least-privilege **`permissions`** (`contents: read`) on **`verify`** and manual **`build`** **GitHub Actions** workflows; added **Dependency Review**, **OSV Scanner** (reusable workflows + weekly schedule on **`master`**), and **Gitleaks** for PR/push hygiene.

## 2.4.8 - Pinia 3 and Vue Router 5

### Bugfixes & Optimizations
- Refreshed **Sass** to **1.99.x** under **`^1.78.0`** in **root** and **`.storybook-workspace`** lockfiles so the desktop app and **Storybook** use the same resolved Dart Sass line for styles.
- Upgraded **Pinia** to **v3** and **Vue Router** to **v5** for the desktop app and **`.storybook-workspace`** (explicit **`vue-router`** there for **`StoryRouterShell`**); did not add optional **`@pinia/colada`**. Refreshed **root** and **`.storybook-workspace`** lockfiles with **`yarn upgrade`** within existing semver ranges (**Storybook** remains pinned at **10.3.4** on that line).
- Upgraded **`uuid`** to **v13** for markdown and component dialog UUIDs (**`S_Dialog`**) and **`@quasar/cli`** to **v3** for the **`quasar`** CLI used with **`@quasar/app-vite`** v2.
- Upgraded **Electron** to **41.x** (from **33.x**); **`electron-builder`** still runs **`@electron/rebuild`** so **`sqlite3`** matches the bundled runtime. **`@electron/remote`** **2.1.x** and the known UnPackaged production-install peer warning for **`electron`** are unchanged.
- Standardized type-only imports across the TypeScript and Vue codebase (`import type`) to align with strict linting and keep runtime bundles free of type-only import noise.
- Added a new `yarn ensure` command for full-project validation (`verify` + production build + Playwright component + Playwright E2E) and aligned contributor guidance in **README**, **AGENTS**, and Cursor rules/skills to document the quick gate vs full gate workflow clearly.
- Reduced non-actionable Vue warning noise in component Vitest output by filtering known Quasar-resolution and test-only injection warnings in shared test setup, keeping signal focused on actionable failures.
- Fixed CI TypeScript resolution for Vue SFC imports by replacing the generated `.quasar` shim reference in `src/env.d.ts` with an in-repo `declare module '*.vue'` declaration, so `yarn verify` succeeds on clean GitHub runners without requiring local/generated `.quasar` shim files.

## 2.4.7 - Storybook 10 and Vite 8 alignment

### Bugfixes & Optimizations
- Upgraded **`.storybook-workspace`** to **Storybook 10** and **Vite 8** so component previews run on the same major bundler line as the desktop app (**`@quasar/app-vite`**), refreshed the nested **Yarn** lockfile for reproducible installs (including **CI** frozen installs), and aligned root **Storybook** / **`eslint-plugin-storybook`** versions with that release family.
- Refreshed **root** and **`.storybook-workspace`** lockfiles with **`yarn upgrade`** within existing semver ranges (notably **Quasar**, **Vue**, **vue-i18n**, **Playwright**, **Sass**, and related tooling); kept **`@types/node`** on the **22.x** typings line for the **Node 22** engine. Updated **README** and **AGENTS** so contributors see **Storybook 10** on **Vite 8** instead of the old split-Vite wording.
- Added **`debug-storybook.log*`** to **`.gitignore`** so local Storybook diagnostic logs are not picked up as untracked files.

## 2.4.6 - Window chrome, Storybook, Stylelint, and DevTools

### Bugfixes & Optimizations
- Applied **`getCurrentWindow()`** from **`@electron/remote`** to **window chrome** bridge helpers (**minimize**, **maximize**, **resize**, **close**, **maximized state**) so controls stay tied to the app window when OS focus moves to menus or other surfaces.
- Aligned **`.storybook-workspace`** with the main app on **Vue 3.5**, **vue-i18n 11**, **Quasar 2.16+**, **Pinia 2.3+**, and **@quasar/extras 1.17**; removed stray **`package-lock.json`** there so only **Yarn** lockfiles are used.
- Refreshed **root** and **`.storybook-workspace`** lockfiles with **`yarn upgrade`** within existing semver ranges; pinned root **Storybook** addons to **8.6.18** so they match **`@storybook/vue3-vite`** and the nested workspace (notably newer **Playwright**, **Sass**, and other compatible tooling).
- Migrated **`src/css/app.scss`** and **`globals/*.scss`** to Sass **`@use`** with explicit **`quasar.variables.scss`** imports in partials, replacing deprecated **`@import`** chains for app-owned global styles ahead of Dart Sass 3.
- Storybook’s Vite **`additionalData`** prepends **`quasar.variables.scss`** for project **`.vue` / `.scss`** (via **`file://`** URLs so Windows paths with spaces resolve). For **`quasar/src/css/index.sass`** it uses **`@import`** (not **`@use`**) ahead of Quasar’s own imports—the same effective ordering as **`@quasar/vite-plugin`’s `sassVariables`** transform—so **`!default`** theme entries resolve to your palette and framework CSS variables (**`--q-dark`**, **`--q-primary`**, and related tokens) match the desktop app; other **`node_modules`** Sass stays untouched.
- Extended the root **Stylelint** setup with **`@stylistic/stylelint-config`** so stylistic rules dropped from **Stylelint 17**’s core keep enforcing familiar CSS/SCSS formatting; updated **`.vscode`** recommendations and settings so the Stylelint extension can use the project config, **fix on save**, and format standalone **`.scss`** files consistently.
- Routed **DevTools** control (**toggle**, **open**, **close**, and **status**) through small **main-process IPC** handlers instead of **`@electron/remote`** **`getCurrentWindow()`**, so **Help → Toggle developer tools** stays reliable in packaged **Electron** builds; the **E2E** check now waits until DevTools finish attaching instead of asserting immediately after the menu closes.
- Updated **GitHub Actions** on **`verify`** and manual **build** workflows (**`actions/checkout`**, **`actions/setup-node`**, **`actions/upload-artifact`**) to current major versions.
- Noted in **`quasar.config.ts`** that **`@electron/remote`**’s **`electron`** peer is expected to show as unmet during UnPackaged **`yarn install --production`**; packaging still succeeds because the app runs on the bundled Electron runtime.
- Storybook preview registers Quasar’s **`Dark`** plugin, the **`@quasar/quasar-ui-qmarkdown`** app plugin (after Quasar, matching boot order), **Roboto (latin-ext)**, and **`preview-body.html`** / **`Dark.set(true)`** so **`body--dark`** stays aligned with the app; Sass **`additionalData`** skips **`app.scss`** to avoid double-loading variables. **Dialog** and **top-menu** component Docs use **`parameters.docs.story.inline: false`** again so Autodocs does not mount every story in one document (each **`q-dialog`** auto-opens on mount, which stacked modals when **`inline: true`**); each nested Docs iframe still loads the same preview CSS stack.

## 2.4.5 - Contributor workflow and CI

### Bugfixes & Optimizations
- Added **`yarn verify`** to run ESLint, TypeScript (`tsc`), Stylelint, and unit tests in one command (named **`verify`** because Yarn 1 reserves **`yarn check`** for dependency verification); documented it in the README and dev-setup guidance, aligned Cursor rules/skills, and run it in the manual GitHub Actions build workflow before the production Electron build.
- Fixed the combined unit-then-Playwright helper so it runs unit tests then Playwright over component and E2E paths (removed the broken `concurrently` invocation and dropped the unused **`concurrently`** dependency).
- Cleared the French locale changelog markdown so release notes are not maintained per locale until translations return.
- Upgraded **`@intlify/unplugin-vue-i18n`** to v11 for the Quasar/Vite locale pipeline, **`uuid`** to v11 (built-in TypeScript types; removed **`@types/uuid`**), and **`sqlite3`** to v6 for the Electron main-process dependency line.
- Added a **GitHub Actions** workflow that runs **`yarn verify`** on **push** and **pull request** to **`master`** / **`main`** (including installing the Storybook workspace so ESLint can resolve `.storybook-workspace/.storybook`).
- Refreshed **root** and **`.storybook-workspace`** lockfiles with **`yarn upgrade`** within existing semver ranges (notably newer **Playwright**, **Quasar**, **Vue**, **vue-i18n**, **Sass**, and related tooling where ranges allowed).
- Made **DevTools** bridge helpers use **`getCurrentWindow()`** instead of **`BrowserWindow.getFocusedWindow()`** so **toggle / status** stay tied to the app window when menus or DevTools change OS focus, stabilizing the DevTools **E2E** check.

## 2.4.4 - Dependencies and dev tooling

### Bugfixes & Optimizations
- Refreshed the dependency lockfile with `yarn upgrade` under the existing semver ranges so installs resolve to the latest compatible releases (including Quasar, Vue, `vue-i18n`, Sass, Playwright, and the Vite tooling pulled in by Quasar).
- Upgraded `jsdom` to v29 for the Vitest DOM environment, `eslint-plugin-n` to v17, and refreshed `@types/node` on the Node 22 typings line.
- Migrated lint and types tooling to **ESLint 9** flat config (**neostandard**, **eslint-plugin-vue** v10, **typescript-eslint**), **TypeScript** 6, and **Stylelint** 17 with updated shareable configs; small source tweaks match stricter defaults (import attributes, union spacing, dev window URL guard, QMarkdown CSS shim).
- Aligned **AGENTS**, Cursor rules, and skills so the standard pre-commit and pre-changelog workflow always runs **ESLint**, **TypeScript (`tsc`)**, **Stylelint**, and **unit tests** in that order; the **quality gate** may run as one chained terminal command for efficiency, with individual commands reserved for debugging failures. **Build** and **Playwright** checks stay one command per terminal.

## 2.4.3 - Additional dependency updates and improved testing workflow

### Bugfixes & Optimizations
- Upgraded `vitest` to v4 and adjusted Electron main-process unit-test mocks to constructor-compatible implementations so `BrowserWindow`, `Menu`, and `MenuItem` mocking remains stable under the newer runner.
- Refreshed additional low-risk dependencies (`sqlite3`, `lodash-es`, `stylelint`, `stylelint-config-standard-scss`, and `eslint-plugin-promise`) and revalidated the complete lint/test/build pipeline after the updates.
- Added persistent agent/testing guidance to run each validation command in an isolated terminal invocation to keep long test outputs readable and easier to audit.
- Aligned the `2.4.3` changelog block with the canonical `package.json` version and strengthened contributor guidance so changelog edits always re-read live `package.json` first, avoiding section/version drift.

## 2.4.2 - Core dependency refresh and Quasar/Vite workflow validation

### Bugfixes & Optimizations
- Upgraded `vue-i18n` to v11 and removed legacy TypeScript suppression in i18n bootstrapping now that current typings compile cleanly.
- Refreshed core app and tooling dependencies (including Quasar extras/qmarkdown, Axios, Pinia, Vue Router, Vitest, and selected ESLint plugins) to reduce maintenance risk while staying within the current project architecture.
- Applied a follow-up tooling refresh for the Quasar/Vite workflow (`@quasar/app-vite`, `@intlify/unplugin-vue-i18n`, `vite-plugin-checker`, `eslint-plugin-vue`, and `@types/node`) with full lint, typecheck, unit, component, E2E, and build validation.

## 2.4.1 - Changelog policy lock and component test stability

### Bugfixes & Optimizations
- Fixed Playwright component-test discovery for `DialogAboutFantasiaArchive` by avoiding full i18n loader imports that pull markdown documents into Node-side test loading.
- Updated the dialog social-button assertions to compare rendered labels, matching current UI output and keeping component tests stable.
- Locked project guidance to **never auto-bump versions**; changelog sections now strictly follow the existing `package.json` version unless a manual change is explicitly requested.

## 2.4.0 - Quasar CLI Vite v2 and Node 22 toolchain

### Bugfixes & Optimizations
- Upgraded the desktop app toolchain to `@quasar/app-vite` v2 (Vite 8), ESM `quasar.config.ts`, TypeScript 5.6, and ESLint feedback via `vite-plugin-checker` during dev/build.
- Standardized contributor and CI Node.js on **22.22.0 or newer** (required by the current Quasar CLI), refreshed GitHub Actions `setup-node`, and documented native-module rebuild expectations for `sqlite3` after Electron/Node bumps.
- Replaced the QMarkdown app extension with direct `@quasar/quasar-ui-qmarkdown` registration, Vite-native `*.md?raw` locale imports, and Vue template `isPreTag` handling so markdown dialogs stay stable without the extension’s Vite plugin.
- Migrated vue-i18n bundling to `@intlify/unplugin-vue-i18n`, bumped Electron and electron-builder for ESM main-process output, and aligned Sass with the Storybook subproject; Storybook remains on Vite 6 until its supported peer range includes Vite 8. *(Superseded in **2.4.7**: Storybook now runs on **Vite 8** with **`@quasar/app-vite`**.)*
- Bumped **`@electron/remote`** to 2.1.x so Electron 33 keeps a working preload (avoids removed Chromium feature probes that previously broke preload load and the bridge APIs).
- Fixed **Playwright component-testing** routing: `ComponentTesting` now globs `../components/**/*.vue` from `src/pages`, so production Electron runs mount the requested SFC instead of an empty harness.
- Raised **`@typescript-eslint`** to v8 for TypeScript 5.6, added **`yarn lint:types`** (full-project `tsc`), and expanded AGENTS/Cursor guidance for ESLint and typecheck gates (TSLint is not used).
- Reduced noisy **DevTools Autofill** CDP stderr lines in development by filtering those specific messages in the Electron main process (harmless protocol mismatches only).
- Hardened renderer code paths that call **`window.faContentBridgeAPIs`** when the preload bridge is missing, and aligned Vitest **`vi.stubEnv`** usage with Vitest 3 boolean rules for `DEV` / `PROD` / `SSR`.
- Tuned **Quasar/electron-builder** config for stricter typings and packaging: PWA `workboxMode` casing (`GenerateSW`), empty **`bex`** block matching current Quasar types, Linux **`desktop.entry`** for electron-builder 26, plus TypeScript project glue (`env.d.ts` Vue shim reference, vue-i18n augmentation handling) so `lint:types` stays reliable.
- Addressed **Dart Sass 2** deprecation noise in shared SCSS via `sass:color` in Quasar variables and scrollbar styles (replacing legacy color helpers).
- **Install reminder:** the **`electron`** package needs its **postinstall** download; skipping lifecycle scripts (for example `npm install --ignore-scripts`) can leave a broken binary until you reinstall or run `node node_modules/electron/install.js`.

## 2.3.2 - Storybook layouts, pages, and contributor tooling

### New features
- Added canvas-only Storybook previews for main layouts and representative app pages using a shared in-memory router (`StoryRouterShell`), a single `STORYBOOK_APP_ROUTES` table, and colocated `src/layouts/**` and `src/pages/**` stories.
- Wired a Storybook-only Vite transform that rewrites `import.meta.globEager` to eager `import.meta.glob` so the component-testing page loads under the Storybook workspace toolchain.
- Extended Storybook i18n mocks so the not-found page shows real copy instead of raw translation keys; simplified index and single-component story labels (dropped the redundant index-only preview).
- Documented layout and page Storybook expectations in `AGENTS.md` and Cursor rules/skills, including canvas-only previews and changelog ordering alongside component stories.

### Bugfixes & Optimizations
- Pointed root ESLint at intentional source and config paths instead of the whole repository; added `yarn lint:style` with Stylelint for `src` Vue and SCSS plus a root Stylelint config.
- Enabled TypeScript `skipLibCheck` and excluded build artifacts, Storybook static output, the Vitest components config, and colocated `*.stories.ts` from the root `tsconfig` project for cleaner checks.
- Removed an empty scoped style block from `SocialContactButtons` surfaced by style linting.
- Refreshed Vitest and Playwright coverage (external link manager, mascot image, window controls) to match current behavior and selectors.

## 2.3.1 - Electron packaging icon and favicon coverage

### Bugfixes & Optimizations
- Added explicit Electron Builder icon configuration for Windows, macOS, and Linux, including Linux desktop-entry metadata and Linux target setup.
- Linked all generated favicon sizes in `index.html` so renderer icon declarations cover the full `public/icons/` set.
- Updated changelog markdown wording to avoid build-time parsing failures in the qmarkdown/Vite pipeline during Electron production builds.

## 2.3.0 - Storybook workspace and desktop polish

### New features
- Moved Storybook into a nested `.storybook-workspace` package with its own toolchain, removed the root `.storybook` tree, and refreshed colocated stories (menus, dialogs, mascot, window controls, and social buttons) for stable addons, `public/` assets, and authoring workflows.
- Tuned global Quasar variable tokens and shared component SCSS adjustments for more consistent window chrome, controls, and markdown/dialog surfaces.
- Added Fantasia mascot image label strings for en-US and German locales to support accessible naming.
- Documented Storybook, Electron `file://`, and Playwright rebuild expectations for contributors in `AGENTS.md`, `README.md`, and Cursor skills/rules (including a dedicated Storybook stories rule).

### Bugfixes & Optimizations
- Fixed social contact button icons not loading in packaged Electron builds by resolving public image URLs with a relative base when the app base URL is "/" or empty, instead of root-relative URLs under file://.
- Updated Playwright component coverage for window controls to match current markup and accessibility labels.

## 2.2.1 - Type naming and consistency sweep

### New features
- Added explicit component test-governance guidance across AGENTS/rules/skills: each `src/components/**` Vue component keeps a colocated `*.vitest.test.ts` suite, with parity treated as coverage presence (not exhaustive branch/line percentages).
- Standardized fixture placement policy for future test authoring: Vitest and Playwright fixtures stay inline in their respective test files, while `_data/` remains production-only.
- Refactored shared menu and dialog/document type declarations into clearer singular and collection naming while preserving the `I_` / `T_` prefix conventions.
- Added reusable menu item and submenu type building blocks to keep menu configuration typing easier to maintain.
- Expanded renderer-side Vitest coverage under `src/` for scripts and store state transitions using deterministic mocks.
- Added a tracked renderer test-strategy inventory under `.cursor/plans/` to map `src/` TS/Vue targets across Vitest and Playwright responsibilities.
- Split Vitest into a Node/core config and a jsdom components config with shared setup so `yarn test:unit` covers boot, i18n, scripts, stores, and colocated smoke tests for every `src/components/*.vue`.
- Colocated `AppControlSingleMenu` and `SocialContactSingleButton` as top-level components (paths and imports updated).
- Routed initial navigation through a dedicated `appStartupRouting` helper consumed from `App.vue`.

### Bugfixes & Optimizations
- Fixed trigger callback typing mismatches in help menu data by wrapping typed handlers in zero-argument callbacks compatible with generic menu trigger signatures.
- Normalized typo-prone comments and wording across component tests, E2E tests, and selected source files for consistent naming and grammar.
- Updated README test command examples to match actual script names and usage patterns in `package.json`.
- Separated Playwright artifact output from the HTML report folder in `playwright.config.ts` to remove reporter output-directory clash warnings.
- Re-aligned testing guidance to keep `yarn test:unit` as the baseline unit-test workflow in project docs and Cursor guidance files.
- Clarified AGENTS/rules/skills guidance so Vitest explicitly treats both `src/` and `src-electron/` as first-class unit-testing surfaces while keeping Playwright as the integration/runtime layer.
- Clarified test-data rules: automated-test fixtures stay inline in each `*.vitest.test.ts` / `*.playwright.test.ts`, component-testing payloads use `COMPONENT_PROPS` where possible, and embedded component-mode menu data stays inline in `AppControlMenus` for dialog triggers.
- Resolved ESLint findings in boot external-link Vitest mocks (`Event` listener typing and padded blocks).

## 2.2.0 - Testing and agent tooling

### New features
- Expanded Vitest coverage for Electron preload bridge modules and main-process scripts (window controls, devtools, external links, app management, spell checker, and main window creation) using deterministic mocks.
- Playwright component tests for DialogAboutFantasiaArchive (replaces the previous TODO placeholder file).
- Cursor rule and skill for local plan documents in `.cursor/plans/` (gitignored), plus changelog guidance to read version-matching plan files for release context.

### Bugfixes & Optimizations
- Replaced remaining TypeScript `any` annotations in shared type declarations with `unknown` to keep menu trigger and Vue component typing stricter.
- Added explicit anti-`any` guidance to Vue, TypeScript scripts, Vitest, and Playwright rules/skills to keep future code strongly typed.

## 2.1.0 - Tooling and AI-assisted development

### New features
- Cursor project rules and skills for Vue/Quasar, BEM and scoped SCSS, Playwright and Vitest, Electron preload, global SCSS, conventional Git commits, and en-US changelog upkeep tied to the app version.
- AGENTS.md as the project entry point for AI-assisted development.

## 2.0.0 - The Big Rewrite

### New features
- A whole plethora since this is a full rewrite!

### Known issues
- No issues at the date of release.

### Bugfixes & Optimizations
- Too many optimizations to list since this is a rewrite.
- No bugs at the date of release.
