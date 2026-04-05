---
name: fantasia-changelog-en-us
description: >-
  Maintains the English in-app changelog at src/i18n/en-US/documents/changeLog.md
  in strict sync with package.json version, without any automatic version
  bumping. Changelog text must be user- or release-relevant only—never
  internal QA (lint/build/test runs, “all gates passed”). Use after substantive
  app, UX, or user-facing docs changes, or when the user asks for release notes.
---

# Changelog and version (`changeLog.md` + `package.json`)

## Files

- **Changelog (Markdown)**: [changeLog.md](src/i18n/en-US/documents/changeLog.md) — shown in-app via i18n `documents.changeLog`.
- **Canonical semver**: [package.json](package.json) field **`version`** (e.g. `2.1.0`).
- **Planning context**: local `.cursor/plans/` files, especially those matching the current package version in filename or metadata.

Only this English document exists today; if other locales add a changelog later, mirror the same structure.

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

Those steps may be **required before** you edit the changelog (see repo rules), but they are **not** changelog content. Put verification detail in commit messages or PR descriptions instead.

When you **do** document a dependency refresh, describe **what** was refreshed (ranges, notable packages), not the full test matrix you ran afterward.

## Pre-changelog workflow gate (required)

Before editing `changeLog.md` for new work, keep this order ([`testing-terminal-isolation.mdc`](../../rules/testing-terminal-isolation.mdc)):

1. Run the **quality gate** in one terminal: `yarn testbatch:verify` (run `yarn lint:eslint`, `yarn lint:typescript`, `yarn lint:stylelint`, or `yarn test:unit` individually only while debugging a failure).
2. For affected user-facing **`src/components/**`**, verify Storybook updates are complete (`tests/*.stories.ts`, relevant mocks/placeholders) and Storybook starts cleanly (**`yarn storybook:run`**). Layout/page Storybook previews do not require Docs/autodocs ([`storybook-stories.mdc`](../../rules/storybook-stories.mdc)).
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

`changeLog.md` is loaded as a **vue-i18n message string**, not plain static text. The compiler treats **`{` … `}`** as **message placeholders** (interpolation). Content like shell glob brace expansion (**`*.{vue,css}`**), lone **`{foo}`**, or **`@:`**-style escapes can trigger **`Message compilation error`** at runtime when the changelog opens.

- **Do not** put literal **`{...}`** groups in changelog prose unless they are valid vue-i18n placeholder syntax you intend to use (you almost never should in this file).
- Describe file globs in **words** or list extensions (**`vue`**, **`css`**, **`scss`**, **`sass`**) without curly-brace grouping.
- If you must mention braces for documentation reasons, spell them out (for example “open brace … close brace”) or use phrasing that avoids the characters.

## Related

- Commit messages: [git-conventional-commits](../git-conventional-commits/SKILL.md) (e.g. `docs:` for changelog-only edits).
- Product tone: [fantasia-worldbuilding-domain](../fantasia-worldbuilding-domain/SKILL.md).

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
