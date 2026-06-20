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

Exactly one: **`feat`** | **`fix`** | **`test`** | **`chore`** | **`refactor`** | **`style`** | **`docs`**.

| Type | Use for |
|------|---------|
| `feat` | New user-visible behavior |
| `fix` | Bug fixes |
| `test` | Tests only |
| `chore` | Deps, CI, tooling, housekeeping |
| `refactor` | Restructure, same behavior |
| `style` | Format/lint autofix, no logic |
| `docs` | README, AGENTS, rules/skills, doc comments |

**Format**: `type: imperative subject` — lowercase type, space after colon, ~72 chars, no trailing period.

**Local enforcement**: **`.husky/commit-msg`** → **`yarn lint:commit`**. **`git commit --no-verify`** only when must bypass hooks.

## Workflow (default when user wants multiple commits)

1. **Inspect**: `git status`, `git diff`, `git diff --staged`
2. **Quality gate**: **`yarn testbatch:verify`** one terminal ([testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)). **Changelog-only** exception: only **`i18n/*/documents/changeLog.md`** + gate already passed after substantive edits
3. **Storybook gate**: changed **`src/components/**`** — stories/mocks. Skip changelog-only repair
4. **Changelog gate**: update **`changeLog.md`** before commit; prefer same commit as product work — [fantasia-changelog-en-us](../fantasia-changelog-en-us/SKILL.md)
5. **Plan**: ordered commits — type + subject + paths
6. **Approval loop** (when user asked per-commit approval): present next commit → wait explicit OK → `git add` those paths only → `git commit`
7. Single commit / no step-by-step: valid **`type:`** message after gates

## Rules

- Never commit without approval when user requested per-commit approval
- Never mix unrelated concerns in one commit
- Prefer small reviewable chunks
- **`refactor`** for production moves; **`chore`** for repo/meta
- No skipping changelog for substantive work
- No skipping Storybook for **`src/components/**`** product commits

## Final cleanup override

**Final cleanup** → [fantasia-final-cleanup](../fantasia-final-cleanup/SKILL.md): verify, changelog, logical commits, push — may commit without per-commit approval unless user interrupts.

## Related

- [git-conventional-commits.mdc](../../rules/git-conventional-commits.mdc)
- [fantasia-final-cleanup](../fantasia-final-cleanup/SKILL.md)

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
