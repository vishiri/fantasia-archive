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

- **Changelog**: [changeLog.md](../../../i18n/en-US/documents/changeLog.md) — in-app via **`documents.changeLog`**
- **Other locales**: mirror path (e.g. [fr changeLog.md](../../../i18n/fr/documents/changeLog.md)) — **edit only when user explicitly asks to mirror**; default = **`en-US`** only
- **Canonical semver**: [package.json](../../../package.json) **`version`**
- **Planning context**: `.cursor/plans/` matching current version

## When to update

After **substantive** user/operator-visible work: **`feat`**, **`fix`**, notable shipped dependency changes described as product change. Skip trivial-only edits unless user wants log.

### What must **not** go into `changeLog.md`

In-app changelog = end users. **Omit** bullets that only record:

- Re-running **`yarn testbatch:verify`**, lint, unit, Electron build, Playwright, Storybook, **`testbatch:ensure:*`**
- “All tests passed”, “pipeline green”, packaging QA meta
- Git/housekeeping: commits, pushes, “updated changelog”

Verification belongs in commits/PRs — not changelog. Dependency refresh bullets: describe **what** changed, not test matrix.

## Changelog timing vs Git

- **Default**: update in **same working tree** + **same commit** as feature/fix; finish **before** **`git commit`** and **`git push`**
- **Avoid**: trailing changelog-only commit after push — rare typo/section fixes only ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc))

## Pre-changelog workflow gate

1. **Full quality gate** — **`yarn testbatch:verify`** in one terminal ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)). Dev scoped gate during edits does **not** substitute. **Changelog-only** follow-up touching only **`i18n/*/documents/changeLog.md`**: may skip if full gate already passed after substantive edits and tree otherwise unchanged.
2. Affected **`src/components/**`**: Storybook stories/mocks aligned (**`yarn storybook:run`**). Skip for changelog-only repair.
3. Draft/update entries.

## Plan-context check

1. Read live **`package.json.version`** → **`pkg`**
2. Scan **`.cursor/plans/`** for filename/body matching **`pkg`**
3. Use plans as supporting context only

## Version policy (strict)

1. Re-read **`version`** from **`package.json`** immediately before edit → **`pkg`** (no cached value)
2. Topmost changelog heading: first **`## X.Y.Z`** semver below title
3. **NEVER, EVER, UNDER ANY CIRCUMSTANCES** auto-bump or infer new version
4. Changelog headings follow **`package.json`** exactly unless user explicitly requests manual version change

### Heading vs `pkg`

| Case | Action |
|------|--------|
| No semver heading yet | Add **`## {pkg} - Short title`** |
| Top heading **equals** `pkg` | Append bullets under existing **`###`** only |
| Top heading **lower than** `pkg` | New **`## {pkg} - Short title`** section above |
| Top heading **higher than** `pkg` | Fix changelog to match **`pkg`**; do not change **`package.json`** unless user asks |

## Section headings (`###`)

- Only headings with **≥1 real bullet**
- **No** empty categories, **no** “None” placeholders
- Omit entire **`###`** when nothing to say for this release

## Bullet style

- One line, **`- `** prefix; product-facing wording
- Add **`###`** only when adding bullets under it

## Translated changelogs (strict)

- **Never** edit **`i18n/<locale>/documents/changeLog.md`** for any non-**`en-US`** locale unless user **explicitly** asks to mirror
- Default scope = **`en-US`** only
- Translations, i18n key work, or other locale edits do **not** trigger changelog mirror
- When user does ask: mirror only maintained locale changelogs, reuse each locale's existing section heading + product-name translations

## vue-i18n and `changeLog.md` (required)

`changeLog.md` = **vue-i18n message string**. **`{` … `}`** = interpolation placeholders — invalid tokens throw at runtime (**`Invalid token in placeholder`**).

- **Do not** put literal **`{...}`** unless valid vue-i18n placeholder syntax (almost never here)
- **Avoid** JS/TS object literals, API option objects with braces in prose
- Describe globs in words — list extensions, no brace expansion
- Literal **`|`** needs vue-i18n escape (**`\\|`** in TS source where needed)
- Mention braces as “open brace … close brace” if documentation requires

## Related

- [git-conventional-commits](../git-conventional-commits/SKILL.md)
- [fantasia-worldbuilding-domain](../fantasia-worldbuilding-domain/SKILL.md)

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
