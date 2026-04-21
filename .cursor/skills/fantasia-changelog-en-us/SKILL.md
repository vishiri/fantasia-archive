---
name: fantasia-changelog-en-us
description: >-
  Maintains the English in-app changelog at i18n/en-US/documents/changeLog.md
  in strict sync with package.json version, without any automatic version
  bumping. Changelog text must be user- or release-relevant only—never
  internal QA, Git meta (commits/pushes), or “updated changelog”. Prefer editing
  the log in the same commit as the work, before push. Use after substantive
  app, UX, or user-facing docs changes, or when the user asks for release notes.
---

# Changelog and version (`changeLog.md` + `package.json`)

## Files

- **Changelog (Markdown)**: [changeLog.md](../../../i18n/en-US/documents/changeLog.md) — shown in-app via i18n `documents.changeLog`.
- **Translations**: other locales may ship the same document path (for example [changeLog.md (fr)](../../../i18n/fr/documents/changeLog.md)); mirror structure and version headings with the active locale’s prose.
- **Canonical semver**: [package.json](../../../package.json) field **`version`** (e.g. `2.1.0`).
- **Planning context**: local `.cursor/plans/` files, especially those matching the current package version in filename or metadata.

## When to update

After **substantive** work that users or operators should know about, for example:

- `feat` / user-visible behavior, UI, Electron flows, i18n copy
- `fix` / bugs, regressions, crashes
- Notable dependency or tooling updates **when they matter to the product** (e.g. upgraded stack that ships with the app), described as the change itself — not as a test report
- Notable `test` / tooling only if it **changes how users or contributors run the app or the repo** (e.g. new required command, broken/renamed script). Routine `chore` / `refactor` / `style` usually **omit** unless the user asks

Skip trivial-only edits (typo in a comment, pure format) unless the user wants everything logged.

### What must **not** go into `changeLog.md`

The English changelog is shown **in the app** to end users. **Do not** add bullets that only record internal verification or maintainer QA, for example:

- Re-running `yarn testbatch:verify`, `yarn lint:eslint`, `yarn lint:typescript`, `yarn lint:stylelint`, `yarn test:unit`, `yarn quasar:build:electron`, `yarn test:components`, `yarn test:e2e`, `yarn testbatch:ensure:nochange`, `yarn testbatch:ensure:change`, `yarn test:storybook:smoke`, or `yarn test:storybook:visual` / **`:update`**
- Phrases like “revalidated the pipeline”, “all tests passed”, “Playwright/E2E/component suite green”, “full quality gates”, or “packaging succeeded after QA”
- Git or housekeeping meta: “committed”, “pushed”, “split into multiple commits”, “updated the changelog”, or any line whose purpose is to describe the merge/commit process rather than product change

Those steps may be **required before** you edit the changelog (see repo rules), but they are **not** changelog content. Put verification detail in commit messages or PR descriptions instead.

When you **do** document a dependency refresh, describe **what** was refreshed (ranges, notable packages), not the full test matrix you ran afterward.

## Changelog timing vs Git

- **Default**: Update `changeLog.md` in the **same working tree** as the feature/fix/docs work and include it in the **same commit** when practical. Finish changelog text **before** `git commit` and **before** `git push` when you push that batch right away.
- **Avoid**: A trailing **changelog-only** commit after substantive commits or after a push—it creates extra history and was a recurring source of noise. Use a changelog-only commit only for rare fixes (wrong heading, typo) per [testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc).

## Pre-changelog workflow gate (required)

Before editing `changeLog.md` for new work, keep this order ([`testing-terminal-isolation.mdc`](../../rules/testing-terminal-isolation.mdc)):

1. Run the **quality gate** in one terminal: `yarn testbatch:verify` (run `yarn lint:eslint`, `yarn lint:typescript`, `yarn lint:stylelint`, `yarn test:unit`, or `yarn test:coverage:verify` / per-slice `yarn test:coverage:*` scripts individually only while debugging a failure). Layered Vitest coverage rules: [vitest-tests.mdc](../../rules/vitest-tests.mdc). **Exceptional follow-up** that touches **only** **`i18n/*/documents/changeLog.md`**: you may **skip** re-running **`yarn testbatch:verify`** if it **already passed** after the substantive edits and the working tree is otherwise unchanged; prefer folding changelog into the feature commit instead; if **uncertain**, run the gate anyway.
2. For affected user-facing **`src/components/**`**, verify Storybook updates are complete (`_tests/*.stories.ts`, relevant mocks/placeholders) and Storybook starts cleanly (**`yarn storybook:run`**). Layout/page Storybook previews do not require Docs/autodocs ([`storybook-stories.mdc`](../../rules/storybook-stories.mdc)). **Skip** when you are only adjusting **`documents/changeLog.md`** files after prior verified work, as in step 1.
3. Then draft/update changelog entries.

## Plan-context check (required before drafting notes)

1. Read current `package.json.version` (`pkg`).
2. Inspect `.cursor/plans/` for plan documents with matching version context:
   - filename contains `v{pkg}` or `{pkg}`
   - file body contains `Project version: {pkg}`
3. Use matching plans only as supporting context for release notes and change grouping.
4. If no matching plan files exist, continue with code and git diff context only.

## Version policy (strict)

1. Immediately before editing changelog text, re-read **`version`** from `package.json` (fresh file read, no cached value) → call it `pkg`.
2. Parse the **topmost** changelog heading: first line matching `## X.Y.Z` (semver) below the file title, e.g. `## 2.1.0 - Tooling and AI-assisted development` → `2.1.0`.
3. **NEVER, EVER, UNDER ANY CIRCUMSTANCES** auto-bump or infer a new version.
4. Changelog heading versions must follow `package.json` exactly unless the user explicitly requests a manual version change.

### If there is **no** semver heading yet

- Add `## {pkg} - Short title` (imperative or product tone; user may supply title).

### If top heading version **equals** `pkg`

Append bullets under the right `###` subsection only if that category has real items to add (see **Section headings** below). **Do not** bump version.

### If top heading version **is lower than** `pkg` (semver)

- Add a **new** top section `## {pkg} - Short title` with bullets; keep older sections below.

### If top heading version **is higher than** `pkg`

- Treat `package.json` as source of truth. Fix changelog headings/content to align with `pkg`, and do not change `package.json` unless the user explicitly requests it.

## Section headings (`###`)

- Use **only** headings that have **at least one real changelog bullet** (e.g. `### New features`, `### Known issues`, `### Bugfixes & Optimizations`, or other titles consistent with the file).
- **Do not** add an empty category.
- **Do not** add placeholder bullets such as “None”, “Nothing at release”, or “No issues” solely to keep a section — if there is nothing to say for that category, **omit the entire `###` block** for this release.
- Older releases in the file may still show historical structure; apply this rule to **new edits** and when cleaning up a release block you are touching.

## Bullet style

- One line per item, `- ` prefix, imperative or past tense consistent with existing entries.
- Add a `###` heading only when you are adding one or more bullets under it.
- Prefer **product-facing** wording; avoid appending “and then we ran …” verification clauses unless the user explicitly asks for that style.

## vue-i18n and `changeLog.md` (required)

`changeLog.md` is loaded as a **vue-i18n message string**, not plain static text. The compiler treats **`{` … `}`** as **message placeholders** (interpolation). Anything inside a pair of braces is parsed as placeholder syntax; invalid tokens (for example a **colon** in something meant to look like an object property) produce runtime errors such as **`Message compilation error: Invalid token in placeholder`** when the changelog opens.

- **Do not** put literal **`{...}`** groups in changelog prose unless they are valid vue-i18n placeholder syntax you intend to use (you almost never should in this file).
- **Avoid code-shaped snippets that use braces**, including **JavaScript / TypeScript object literals** and **API option objects**. Bad: **`locator.hover({ force: true })`** (breaks compilation). Good: describe the call in words (**`locator.hover`** with the **`force`** option enabled) or omit the snippet.
- Describe file globs in **words** or list extensions (**`vue`**, **`css`**, **`scss`**, **`sass`**) without curly-brace grouping.
- A bare **pipe** **`|`** is also special in message format; use the **vue-i18n** documented escape when you need a literal pipe in locale copy (see existing **Program settings** tooltip notes in the codebase).
- If you must mention braces for documentation reasons, spell them out (for example “open brace … close brace”) or use phrasing that avoids the characters.

## Related

- Commit messages: [git-conventional-commits](../git-conventional-commits/SKILL.md) (e.g. `docs:` only for rare changelog-only repair commits; prefer `feat`/`fix`/… plus changelog in one commit).
- Product tone: [fantasia-worldbuilding-domain](../fantasia-worldbuilding-domain/SKILL.md).

## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
