---
name: git-conventional-commits
description: >-
  Splits working tree changes into logical Git commits with conventional
  messages (feat, fix, test, chore, refactor, style, docs). Proposes commits
  one at a time and waits for explicit user approval before each git commit.
  Use when the user asks to commit, split commits, stage by topic, or use
  conventional / semantic commit messages.
---

# Conventional commits — logical splits and approval loop

## Allowed types

Use exactly one of: **`feat`** | **`fix`** | **`test`** | **`chore`** | **`refactor`** | **`style`** | **`docs`**.

| Type | Use for |
|------|---------|
| `feat` | New capability or user-visible behavior |
| `fix` | Bug fixes |
| `test` | Test-only changes (new tests, assertions, test data, harness) |
| `chore` | Dependencies, build/CI config, tooling, repo housekeeping |
| `refactor` | Restructure without intended behavior change |
| `style` | Formatting, pure style/lint autofix, no logic change |
| `docs` | README, AGENTS, Cursor rules/skills, intentional documentation comments |

**Format**: `type: imperative subject` (lowercase type, space after colon, ~72 chars or less for subject; no trailing period on subject).

Examples: `feat: add splash screen fade-out`, `test: cover devtools menu toggle`, `docs: split vue rules by concern`.

**Local enforcement**: after **`yarn install`**, **`.husky/commit-msg`** runs **`yarn lint:commit --edit`** against **`commitlint.config.mjs`** (same type list; **`Merge …`** / **`Revert …`** ignored). See [git-conventional-commits.mdc](../../rules/git-conventional-commits.mdc). Use **`git commit --no-verify`** only when you must bypass hooks.

## Workflow (default when user wants multiple commits)

1. **Inspect**: Run `git status` and review `git diff` (and `git diff --staged` if anything is already staged).
2. **Quality gate** ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)): in **one** terminal, `yarn testbatch:verify` (stop on first failure; run `yarn lint:eslint`, `yarn lint:typescript`, `yarn lint:stylelint`, `yarn test:unit`, or `yarn test:coverage:verify` / `yarn test:coverage:electron` / `yarn test:coverage:helpers` / `yarn test:coverage:src` individually only while debugging). See [eslint-typescript.mdc](../../rules/eslint-typescript.mdc) and [vitest-tests.mdc](../../rules/vitest-tests.mdc) for layered Vitest coverage. **Skip** this step when the **only** paths you will commit match **`i18n/*/documents/changeLog.md`** and **`yarn testbatch:verify` already passed** after the latest substantive edits with **no** other uncommitted changes since then; if **unsure**, run **`yarn testbatch:verify`** anyway.
3. **Storybook gate (before changelog/commit for UI work)**: For changed user-facing **`src/components/**`**, verify Storybook coverage/health and add/update missing `tests/<Component>.stories.ts` plus required mocks/placeholders. Touching only **`src/layouts/**/tests` or `src/pages/**/tests` Storybook previews** does not require Docs/autodocs (canvas-only); see [storybook-stories.mdc](../../rules/storybook-stories.mdc). **Skip** when the commit is **changelog-only** as in step 2 and Storybook was already satisfied for the prior work.
4. **Changelog gate (before commit)**: Review `i18n/en-US/documents/changeLog.md` and reconcile whether staged user-visible work needs a changelog update. Follow project changelog/version rules when adjusting release notes. When you also maintain translations, update matching **`documents/changeLog.md`** files under other locales.
5. **Plan**: Propose an **ordered list** of commits. Each item: **type + subject**, bullet list of **paths** (or path patterns) to include. Order so dependencies make sense (e.g. chore before feat if needed).
6. **Approval loop** (mandatory when user asked for per-commit approval or “step through” commits):
   - Present **only the next** commit: message + exact paths.
   - **Stop and wait** for explicit user confirmation (e.g. “yes”, “go ahead”, “approved”) for that commit.
   - Then run `git add` with **only** those paths and `git commit -m "type: subject"`.
   - Repeat until the list is done or the user stops.
7. If the user asked for a **single** commit or did not ask for step-by-step approval, still use a valid `type:` message; you may commit in one shot after listing what will be included (still after the gates in step 2).

## Rules

- **Never** `git commit` without user confirmation if they requested approval per commit.
- **Never** mix unrelated concerns in one commit (e.g. don’t combine `docs:` rule edits with `feat:` app code unless the user explicitly overrides).
- Prefer **small, reviewable** chunks over one huge commit when splitting.
- If unsure between `chore` and `refactor`, prefer **`refactor`** for production code moves/renames and **`chore`** for repo/meta/tooling.
- Do not skip changelog review before committing substantive work; missing release-note updates should be handled before `git commit`, not left accidental. A **second** commit that adjusts **only** **`i18n/*/documents/changeLog.md`** is fine and may skip **`yarn testbatch:verify`** per [testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc).
- Do not skip Storybook review for changed user-facing **`src/components/**`** before you finish the **product** commit; **changelog-only** follow-up commits skip Storybook when the prior verified work already covered UI.

## Related

- Short reminder rule: `.cursor/rules/git-conventional-commits.mdc` (always on).

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
