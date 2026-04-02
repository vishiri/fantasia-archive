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

## Workflow (default when user wants multiple commits)

1. **Inspect**: Run `git status` and review `git diff` (and `git diff --staged` if anything is already staged).
2. **Quality gate** ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)): in **one** terminal, `yarn lint && yarn lint:types && yarn lint:style && yarn test:unit` (stop on first failure; run steps individually only while debugging). See [eslint-typescript.mdc](../../rules/eslint-typescript.mdc) for what each covers.
3. **Storybook gate (before changelog/commit for UI work)**: For changed user-facing **`src/components/**`**, verify Storybook coverage/health and add/update missing `<Component>.stories.ts` plus required mocks/placeholders. Touching only **`src/layouts/**` or `src/pages/**` Storybook previews** does not require Docs/autodocs (canvas-only); see [storybook-stories.mdc](../../rules/storybook-stories.mdc).
4. **Changelog gate (before commit)**: Review `src/i18n/en-US/documents/changeLog.md` and reconcile whether staged user-visible work needs a changelog update. Follow project changelog/version rules when adjusting release notes.
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
- Do not skip changelog review before committing; missing release-note updates should be handled before `git commit`, not in a follow-up commit.
- Do not skip Storybook review for changed user-facing **`src/components/**`** before changelog/commit updates.

## Related

- Short reminder rule: `.cursor/rules/git-conventional-commits.mdc` (always on).
