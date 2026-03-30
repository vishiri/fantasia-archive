---
name: fantasia-changelog-en-us
description: >-
  Maintains the English in-app changelog at src/i18n/en-US/documents/changeLog.md
  in sync with package.json version and semver patch bumps when the latest
  changelog heading duplicates the package version. Use after substantive app,
  UX, test, or docs changes, or when the user asks for release notes or version
  bumps.
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
- Notable `test` / tooling only if it affects how to run or verify the app (`chore` / `refactor` / `style` usually **omit** unless the user asks)

Skip trivial-only edits (typo in a comment, pure format) unless the user wants everything logged.

## Plan-context check (required before drafting notes)

1. Read current `package.json.version` (`pkg`).
2. Inspect `.cursor/plans/` for plan documents with matching version context:
   - filename contains `v{pkg}` or `{pkg}`
   - file body contains `Project version: {pkg}`
3. Use matching plans only as supporting context for release notes and change grouping.
4. If no matching plan files exist, continue with code and git diff context only.

## Version to use for a **new** top section

1. Read **`version`** from `package.json` → call it `pkg`.
2. Parse the **topmost** changelog heading: first line matching `## X.Y.Z` (semver) below the file title, e.g. `## 2.1.0 - Tooling and AI-assisted development` → `2.1.0`.

### If there is **no** semver heading yet

- Add `## {pkg} - Short title` (imperative or product tone; user may supply title).

### If top heading version **equals** `pkg`

The same version is already the **current** release section. Two cases:

- **Same release, more notes**: Append bullets under the right `###` subsection only if that category has real items to add (see **Section headings** below). **Do not** bump version.
- **New patch release** (distinct batch of shipped work, or user asks to bump, or policy is “one top-level section per patch”): apply a **patch bump** to semver: **`major.minor.patch` → `major.minor.(patch+1)`** (this repo interprets “`X.X+1.0`” as **increment the last segment**; not minor `X.(Y+1).0` unless the user explicitly asks for minor/major).

  Then:

  1. Set `package.json` **`version`** to the new value.
  2. Insert a **new** `## {newVersion} - Short title` block **immediately below** the `----------` divider (above older `##` sections).
  3. Put new bullets only under `###` headings that have at least one entry (see **Section headings** below).

### If top heading version **is lower than** `pkg` (semver)

- Add a **new** top section `## {pkg} - Short title` with bullets; keep older sections below.

### If top heading version **is higher than** `pkg`

- **Do not** silently downgrade. Align with the user: either raise `package.json` to match the changelog or fix the changelog; default is to treat `package.json` as source of truth and ask.

## Section headings (`###`)

- Use **only** headings that have **at least one real changelog bullet** (e.g. `### New features`, `### Known issues`, `### Bugfixes & Optimizations`, or other titles consistent with the file).
- **Do not** add an empty category.
- **Do not** add placeholder bullets such as “None”, “Nothing at release”, or “No issues” solely to keep a section — if there is nothing to say for that category, **omit the entire `###` block** for this release.
- Older releases in the file may still show historical structure; apply this rule to **new edits** and when cleaning up a release block you are touching.

## Bullet style

- One line per item, `- ` prefix, imperative or past tense consistent with existing entries.
- Add a `###` heading only when you are adding one or more bullets under it.

## Related

- Commit messages: [git-conventional-commits](../git-conventional-commits/SKILL.md) (e.g. `docs:` for changelog-only edits).
- Product tone: [fantasia-worldbuilding-domain](../fantasia-worldbuilding-domain/SKILL.md).
